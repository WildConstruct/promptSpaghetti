"""
Security validation for Python code execution
Analyzes code for dangerous patterns and validates against security policies
"""

import ast
import re
from dataclasses import dataclass
from typing import List, Set, Dict, Any

import structlog

logger = structlog.get_logger()


@dataclass
class ValidationResult:
    """Result of code security validation"""
    valid: bool
    errors: List[str]
    warnings: List[str]


class SecurityValidator:
    """Validates Python code for security risks before execution"""
    
    # Dangerous patterns that should never be allowed
    PROHIBITED_PATTERNS = [
        # Direct dangerous operations
        r'\beval\s*\(',
        r'\bexec\s*\(',
        r'\bcompile\s*\(',
        r'\b__import__\s*\(',
        r'\bglobals\s*\(',
        r'\blocals\s*\(',
        r'\bvars\s*\(',
        r'\bdir\s*\(',
        r'\bdelattr\s*\(',
        
        # File system access
        r'\bopen\s*\(',
        r'\bfile\s*\(',
        r'\bread\s*\(',
        r'\bwrite\s*\(',
        
        # System access
        r'\bos\.',
        r'\bsys\.',
        r'\bsubprocess\.',
        r'\bshutil\.',
        r'\bpathlib\.',
        
        # Network access
        r'\bsocket\.',
        r'\burllib\.',
        r'\brequests\.',
        r'\bhttplib\.',
        
        # Process manipulation
        r'\bmultiprocessing\.',
        r'\bthreading\.',
        r'\basyncio\.',
        
        # Dangerous attributes
        r'__class__',
        r'__bases__',
        r'__subclasses__',
        r'__mro__',
        r'__globals__',
        r'__code__',
        r'__func__',
        
        # Code generation
        r'\btype\s*\(',
        r'\bclassmethod\s*\(',
        r'\bstaticmethod\s*\(',
        r'\bproperty\s*\(',
    ]
    
    # Patterns that raise warnings but don't block execution
    WARNING_PATTERNS = [
        r'\bwhile\s+True\s*:',  # Potential infinite loops
        r'\bfor\s+.*\s+in\s+range\s*\(\s*\d{6,}\s*\)',  # Large ranges
        r'\b[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*\[.*\]\s*\*\s*\d{4,}',  # Large list multiplication
    ]
    
    # AST node types that are prohibited
    PROHIBITED_AST_NODES = {
        ast.Import,
        ast.ImportFrom,
        ast.Global,
        ast.Nonlocal,
        ast.Lambda,  # Can be used for code injection
    }
    
    # Maximum complexity metrics
    MAX_COMPLEXITY = {
        'lines': 100,
        'functions': 5,
        'loops': 3,
        'conditions': 10,
        'depth': 5
    }
    
    def __init__(self):
        # Compile regex patterns for performance
        self.prohibited_regex = [re.compile(pattern, re.IGNORECASE) for pattern in self.PROHIBITED_PATTERNS]
        self.warning_regex = [re.compile(pattern, re.IGNORECASE) for pattern in self.WARNING_PATTERNS]
        
        logger.info("security_validator_initialized")
    
    def validate_code(self, code: str, allowed_modules: List[str]) -> ValidationResult:
        """
        Comprehensive security validation of Python code
        
        Args:
            code: Python code to validate
            allowed_modules: List of modules that are allowed to be used
            
        Returns:
            ValidationResult with validation status and any errors/warnings
        """
        
        errors = []
        warnings = []
        
        logger.info("validation_starting", code_length=len(code))
        
        # Basic syntax validation
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            errors.append(f"Syntax error: {e}")
            return ValidationResult(valid=False, errors=errors, warnings=warnings)
        
        # Pattern-based validation
        pattern_errors = self._validate_patterns(code)
        errors.extend(pattern_errors)
        
        pattern_warnings = self._check_warning_patterns(code)
        warnings.extend(pattern_warnings)
        
        # AST-based validation
        ast_errors, ast_warnings = self._validate_ast(tree, allowed_modules)
        errors.extend(ast_errors)
        warnings.extend(ast_warnings)
        
        # Complexity validation
        complexity_warnings = self._check_complexity(tree, code)
        warnings.extend(complexity_warnings)
        
        # Transform function validation
        transform_errors = self._validate_transform_function(tree)
        errors.extend(transform_errors)
        
        valid = len(errors) == 0
        
        logger.info(
            "validation_completed",
            valid=valid,
            error_count=len(errors),
            warning_count=len(warnings)
        )
        
        return ValidationResult(valid=valid, errors=errors, warnings=warnings)
    
    def _validate_patterns(self, code: str) -> List[str]:
        """Check code against prohibited regex patterns"""
        errors = []
        
        for pattern in self.prohibited_regex:
            matches = pattern.findall(code)
            if matches:
                errors.append(f"Prohibited operation detected: {pattern.pattern}")
        
        return errors
    
    def _check_warning_patterns(self, code: str) -> List[str]:
        """Check code against warning patterns"""
        warnings = []
        
        for pattern in self.warning_regex:
            matches = pattern.findall(code)
            if matches:
                warnings.append(f"Potentially problematic pattern: {pattern.pattern}")
        
        return warnings
    
    def _validate_ast(self, tree: ast.AST, allowed_modules: List[str]) -> tuple[List[str], List[str]]:
        """Validate AST for prohibited operations"""
        errors = []
        warnings = []
        
        class SecurityVisitor(ast.NodeVisitor):
            def __init__(self, validator, allowed_modules):
                self.validator = validator
                self.allowed_modules = set(allowed_modules)
                self.errors = []
                self.warnings = []
            
            def visit_Import(self, node):
                """Check import statements"""
                for alias in node.names:
                    module_name = alias.name.split('.')[0]  # Get top-level module
                    if module_name not in self.allowed_modules:
                        self.errors.append(f"Import of prohibited module: {alias.name}")
                self.generic_visit(node)
            
            def visit_ImportFrom(self, node):
                """Check from ... import statements"""
                if node.module:
                    module_name = node.module.split('.')[0]  # Get top-level module
                    if module_name not in self.allowed_modules:
                        self.errors.append(f"Import from prohibited module: {node.module}")
                self.generic_visit(node)
            
            def visit_Attribute(self, node):
                """Check attribute access for dangerous patterns"""
                # Check for dangerous attribute access
                if isinstance(node.value, ast.Name):
                    attr_access = f"{node.value.id}.{node.attr}"
                    if any(dangerous in attr_access for dangerous in ['__class__', '__bases__', '__subclasses__']):
                        self.errors.append(f"Prohibited attribute access: {attr_access}")
                self.generic_visit(node)
            
            def visit_Call(self, node):
                """Check function calls for dangerous operations"""
                if isinstance(node.func, ast.Name):
                    func_name = node.func.id
                    if func_name in ['eval', 'exec', 'compile', '__import__', 'globals', 'locals']:
                        self.errors.append(f"Prohibited function call: {func_name}")
                    elif func_name in ['input', 'raw_input']:
                        self.warnings.append(f"Input function detected: {func_name}")
                
                # Check for recursive calls that might cause stack overflow
                if isinstance(node.func, ast.Name) and hasattr(node.func, 'id'):
                    if node.func.id == 'transform':
                        self.warnings.append("Recursive call to transform function detected")
                
                self.generic_visit(node)
            
            def visit_While(self, node):
                """Check while loops for potential infinite loops"""
                # Simple heuristic: while True with no break
                if isinstance(node.test, ast.Constant) and node.test.value is True:
                    has_break = any(isinstance(n, ast.Break) for n in ast.walk(node))
                    if not has_break:
                        self.warnings.append("Potential infinite loop detected (while True without break)")
                self.generic_visit(node)
            
            def visit_For(self, node):
                """Check for loops for large iterations"""
                # Check if iterating over large range
                if isinstance(node.iter, ast.Call) and isinstance(node.iter.func, ast.Name):
                    if node.iter.func.id == 'range' and node.iter.args:
                        if isinstance(node.iter.args[0], ast.Constant) and node.iter.args[0].value > 10000:
                            self.warnings.append(f"Large range iteration detected: {node.iter.args[0].value}")
                self.generic_visit(node)
        
        visitor = SecurityVisitor(self, allowed_modules)
        visitor.visit(tree)
        
        return visitor.errors, visitor.warnings
    
    def _check_complexity(self, tree: ast.AST, code: str) -> List[str]:
        """Check code complexity metrics"""
        warnings = []
        
        # Line count
        lines = len([line for line in code.split('\n') if line.strip()])
        if lines > self.MAX_COMPLEXITY['lines']:
            warnings.append(f"Code too long: {lines} lines (max {self.MAX_COMPLEXITY['lines']})")
        
        # Count various AST elements
        function_count = sum(1 for _ in ast.walk(tree) if isinstance(_, ast.FunctionDef))
        loop_count = sum(1 for _ in ast.walk(tree) if isinstance(_, (ast.For, ast.While)))
        condition_count = sum(1 for _ in ast.walk(tree) if isinstance(_, ast.If))
        
        if function_count > self.MAX_COMPLEXITY['functions']:
            warnings.append(f"Too many functions: {function_count} (max {self.MAX_COMPLEXITY['functions']})")
        
        if loop_count > self.MAX_COMPLEXITY['loops']:
            warnings.append(f"Too many loops: {loop_count} (max {self.MAX_COMPLEXITY['loops']})")
        
        if condition_count > self.MAX_COMPLEXITY['conditions']:
            warnings.append(f"Too many conditions: {condition_count} (max {self.MAX_COMPLEXITY['conditions']})")
        
        # Check nesting depth
        max_depth = self._calculate_max_depth(tree)
        if max_depth > self.MAX_COMPLEXITY['depth']:
            warnings.append(f"Code too deeply nested: {max_depth} levels (max {self.MAX_COMPLEXITY['depth']})")
        
        return warnings
    
    def _calculate_max_depth(self, tree: ast.AST) -> int:
        """Calculate maximum nesting depth of code"""
        class DepthVisitor(ast.NodeVisitor):
            def __init__(self):
                self.max_depth = 0
                self.current_depth = 0
            
            def visit_compound_statement(self, node):
                self.current_depth += 1
                self.max_depth = max(self.max_depth, self.current_depth)
                self.generic_visit(node)
                self.current_depth -= 1
            
            # Apply depth tracking to compound statements
            visit_If = visit_compound_statement
            visit_For = visit_compound_statement
            visit_While = visit_compound_statement
            visit_With = visit_compound_statement
            visit_FunctionDef = visit_compound_statement
            visit_ClassDef = visit_compound_statement
            visit_Try = visit_compound_statement
        
        visitor = DepthVisitor()
        visitor.visit(tree)
        return visitor.max_depth
    
    def _validate_transform_function(self, tree: ast.AST) -> List[str]:
        """Validate that code defines a proper transform function"""
        errors = []
        
        # Find all function definitions
        functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        
        # Check if transform function exists
        transform_functions = [f for f in functions if f.name == 'transform']
        
        if not transform_functions:
            errors.append("Code must define a 'transform' function")
            return errors
        
        if len(transform_functions) > 1:
            errors.append("Multiple 'transform' functions defined")
            return errors
        
        transform_func = transform_functions[0]
        
        # Validate function signature
        if not transform_func.args.args:
            errors.append("Transform function must accept at least one argument")
        elif len(transform_func.args.args) > 3:
            errors.append("Transform function should not accept more than 3 arguments")
        
        # Check for return statement
        has_return = any(isinstance(node, ast.Return) for node in ast.walk(transform_func))
        if not has_return:
            errors.append("Transform function should have at least one return statement")
        
        return errors
    
    def analyze_complexity(self, code: str) -> int:
        """Analyze code complexity and return a score from 1-10"""
        try:
            tree = ast.parse(code)
        except SyntaxError:
            return 10  # Maximum complexity for invalid syntax
        
        # Calculate various complexity metrics
        lines = len([line for line in code.split('\n') if line.strip()])
        functions = sum(1 for _ in ast.walk(tree) if isinstance(_, ast.FunctionDef))
        loops = sum(1 for _ in ast.walk(tree) if isinstance(_, (ast.For, ast.While)))
        conditions = sum(1 for _ in ast.walk(tree) if isinstance(_, ast.If))
        depth = self._calculate_max_depth(tree)
        
        # Weighted complexity score
        score = (
            (lines / 10) * 0.3 +
            functions * 0.2 +
            loops * 0.2 +
            (conditions / 2) * 0.2 +
            depth * 0.1
        )
        
        return min(10, max(1, int(score)))
    
    def estimate_execution_time(self, code: str) -> float:
        """Estimate execution time based on code analysis"""
        try:
            tree = ast.parse(code)
        except SyntaxError:
            return 0.0
        
        # Simple heuristics for execution time estimation
        lines = len([line for line in code.split('\n') if line.strip()])
        loops = sum(1 for _ in ast.walk(tree) if isinstance(_, (ast.For, ast.While)))
        
        # Base time + complexity factors
        estimated_time = 0.01  # Base execution time
        estimated_time += lines * 0.001  # ~1ms per line
        estimated_time += loops * 0.01   # ~10ms per loop
        
        return round(estimated_time, 3)
    
    def detect_imports(self, code: str) -> List[str]:
        """Detect all import statements in code"""
        imports = []
        
        try:
            tree = ast.parse(code)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        imports.append(node.module)
        
        except SyntaxError:
            pass
        
        return list(set(imports))  # Remove duplicates