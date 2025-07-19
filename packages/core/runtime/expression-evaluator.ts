// packages/core/runtime/expression-evaluator.ts
// Safe expression evaluator using AST parsing

/**
 * Token types for expression parsing
 */
enum TokenType {
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  IDENTIFIER = 'IDENTIFIER',
  OPERATOR = 'OPERATOR',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  DOT = 'DOT',
  COMMA = 'COMMA',
  EOF = 'EOF'
}

/**
 * Token interface
 */
interface Token {
  type: TokenType;
  value: string;
  position: number;
}

/**
 * AST Node types
 */
type ASTNode = 
  | { type: 'Literal'; value: any }
  | { type: 'Identifier'; name: string }
  | { type: 'BinaryExpression'; operator: string; left: ASTNode; right: ASTNode }
  | { type: 'UnaryExpression'; operator: string; argument: ASTNode }
  | { type: 'MemberExpression'; object: ASTNode; property: ASTNode; computed: boolean }
  | { type: 'CallExpression'; callee: ASTNode; arguments: ASTNode[] }
  | { type: 'ConditionalExpression'; test: ASTNode; consequent: ASTNode; alternate: ASTNode }
  | { type: 'LogicalExpression'; operator: string; left: ASTNode; right: ASTNode };

/**
 * Tokenizer for expression parsing
 */
class Tokenizer {
  private expression: string;
  private position: number = 0;

  constructor(expression: string) {
    this.expression = expression;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (this.position < this.expression.length) {
      this.skipWhitespace();
      
      if (this.position >= this.expression.length) {
        break;
      }

      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }

    tokens.push({ type: TokenType.EOF, value: '', position: this.position });
    return tokens;
  }

  private skipWhitespace(): void {
    while (this.position < this.expression.length && /\s/.test(this.expression[this.position])) {
      this.position++;
    }
  }

  private nextToken(): Token | null {
    const char = this.expression[this.position];
    const startPos = this.position;

    // Numbers
    if (/\d/.test(char)) {
      let value = '';
      while (this.position < this.expression.length && /[\d.]/.test(this.expression[this.position])) {
        value += this.expression[this.position++];
      }
      return { type: TokenType.NUMBER, value, position: startPos };
    }

    // Strings
    if (char === '"' || char === "'") {
      const quote = char;
      let value = '';
      this.position++; // Skip opening quote
      
      while (this.position < this.expression.length && this.expression[this.position] !== quote) {
        if (this.expression[this.position] === '\\') {
          this.position++;
          if (this.position < this.expression.length) {
            value += this.expression[this.position++];
          }
        } else {
          value += this.expression[this.position++];
        }
      }
      
      if (this.position < this.expression.length) {
        this.position++; // Skip closing quote
      }
      
      return { type: TokenType.STRING, value, position: startPos };
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(char)) {
      let value = '';
      while (this.position < this.expression.length && /[a-zA-Z0-9_$]/.test(this.expression[this.position])) {
        value += this.expression[this.position++];
      }
      
      // Check for boolean literals
      if (value === 'true' || value === 'false') {
        return { type: TokenType.BOOLEAN, value, position: startPos };
      }
      
      return { type: TokenType.IDENTIFIER, value, position: startPos };
    }

    // Operators and punctuation
    switch (char) {
      case '(':
        this.position++;
        return { type: TokenType.LPAREN, value: char, position: startPos };
      case ')':
        this.position++;
        return { type: TokenType.RPAREN, value: char, position: startPos };
      case '[':
        this.position++;
        return { type: TokenType.LBRACKET, value: char, position: startPos };
      case ']':
        this.position++;
        return { type: TokenType.RBRACKET, value: char, position: startPos };
      case '.':
        this.position++;
        return { type: TokenType.DOT, value: char, position: startPos };
      case ',':
        this.position++;
        return { type: TokenType.COMMA, value: char, position: startPos };
      case '!':
        this.position++;
        if (this.position < this.expression.length && this.expression[this.position] === '=') {
          this.position++;
          if (this.position < this.expression.length && this.expression[this.position] === '=') {
            this.position++;
            return { type: TokenType.OPERATOR, value: '!==', position: startPos };
          }
          return { type: TokenType.OPERATOR, value: '!=', position: startPos };
        }
        return { type: TokenType.OPERATOR, value: '!', position: startPos };
      case '=':
        this.position++;
        if (this.position < this.expression.length && this.expression[this.position] === '=') {
          this.position++;
          if (this.position < this.expression.length && this.expression[this.position] === '=') {
            this.position++;
            return { type: TokenType.OPERATOR, value: '===', position: startPos };
          }
          return { type: TokenType.OPERATOR, value: '==', position: startPos };
        }
        throw new Error(`Unexpected assignment operator at position ${startPos}`);
      case '<':
        this.position++;
        if (this.position < this.expression.length && this.expression[this.position] === '=') {
          this.position++;
          return { type: TokenType.OPERATOR, value: '<=', position: startPos };
        }
        return { type: TokenType.OPERATOR, value: '<', position: startPos };
      case '>':
        this.position++;
        if (this.position < this.expression.length && this.expression[this.position] === '=') {
          this.position++;
          return { type: TokenType.OPERATOR, value: '>=', position: startPos };
        }
        return { type: TokenType.OPERATOR, value: '>', position: startPos };
      case '&':
        this.position++;
        if (this.position < this.expression.length && this.expression[this.position] === '&') {
          this.position++;
          return { type: TokenType.OPERATOR, value: '&&', position: startPos };
        }
        throw new Error(`Unexpected bitwise operator at position ${startPos}`);
      case '|':
        this.position++;
        if (this.position < this.expression.length && this.expression[this.position] === '|') {
          this.position++;
          return { type: TokenType.OPERATOR, value: '||', position: startPos };
        }
        throw new Error(`Unexpected bitwise operator at position ${startPos}`);
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
        this.position++;
        return { type: TokenType.OPERATOR, value: char, position: startPos };
      case '?':
        this.position++;
        return { type: TokenType.OPERATOR, value: char, position: startPos };
      case ':':
        this.position++;
        return { type: TokenType.OPERATOR, value: char, position: startPos };
      default:
        throw new Error(`Unexpected character '${char}' at position ${startPos}`);
    }
  }
}

/**
 * Parser for converting tokens to AST
 */
class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): ASTNode {
    const ast = this.parseExpression();
    if (this.currentToken().type !== TokenType.EOF) {
      throw new Error(`Unexpected token '${this.currentToken().value}' at position ${this.currentToken().position}`);
    }
    return ast;
  }

  private currentToken(): Token {
    return this.tokens[this.position] || { type: TokenType.EOF, value: '', position: -1 };
  }

  private consumeToken(type?: TokenType): Token {
    const token = this.currentToken();
    if (type && token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type} at position ${token.position}`);
    }
    this.position++;
    return token;
  }

  private parseExpression(): ASTNode {
    return this.parseTernary();
  }

  private parseTernary(): ASTNode {
    let node = this.parseLogicalOr();

    while (this.currentToken().value === '?') {
      this.consumeToken();
      const consequent = this.parseExpression();
      this.consumeToken(); // consume ':'
      const alternate = this.parseTernary();
      node = { type: 'ConditionalExpression', test: node, consequent, alternate };
    }

    return node;
  }

  private parseLogicalOr(): ASTNode {
    let node = this.parseLogicalAnd();

    while (this.currentToken().value === '||') {
      const operator = this.consumeToken().value;
      const right = this.parseLogicalAnd();
      node = { type: 'LogicalExpression', operator, left: node, right };
    }

    return node;
  }

  private parseLogicalAnd(): ASTNode {
    let node = this.parseEquality();

    while (this.currentToken().value === '&&') {
      const operator = this.consumeToken().value;
      const right = this.parseEquality();
      node = { type: 'LogicalExpression', operator, left: node, right };
    }

    return node;
  }

  private parseEquality(): ASTNode {
    let node = this.parseRelational();

    while (['==', '!=', '===', '!=='].includes(this.currentToken().value)) {
      const operator = this.consumeToken().value;
      const right = this.parseRelational();
      node = { type: 'BinaryExpression', operator, left: node, right };
    }

    return node;
  }

  private parseRelational(): ASTNode {
    let node = this.parseAdditive();

    while (['<', '>', '<=', '>='].includes(this.currentToken().value)) {
      const operator = this.consumeToken().value;
      const right = this.parseAdditive();
      node = { type: 'BinaryExpression', operator, left: node, right };
    }

    return node;
  }

  private parseAdditive(): ASTNode {
    let node = this.parseMultiplicative();

    while (['+', '-'].includes(this.currentToken().value)) {
      const operator = this.consumeToken().value;
      const right = this.parseMultiplicative();
      node = { type: 'BinaryExpression', operator, left: node, right };
    }

    return node;
  }

  private parseMultiplicative(): ASTNode {
    let node = this.parseUnary();

    while (['*', '/', '%'].includes(this.currentToken().value)) {
      const operator = this.consumeToken().value;
      const right = this.parseUnary();
      node = { type: 'BinaryExpression', operator, left: node, right };
    }

    return node;
  }

  private parseUnary(): ASTNode {
    if (['!', '-', '+'].includes(this.currentToken().value)) {
      const operator = this.consumeToken().value;
      const argument = this.parseUnary();
      return { type: 'UnaryExpression', operator, argument };
    }

    return this.parseMember();
  }

  private parseMember(): ASTNode {
    let node = this.parsePrimary();

    while (true) {
      if (this.currentToken().type === TokenType.DOT) {
        this.consumeToken();
        const property = this.parsePrimary();
        if (property.type !== 'Identifier') {
          throw new Error('Expected identifier after dot');
        }
        node = { type: 'MemberExpression', object: node, property, computed: false };
      } else if (this.currentToken().type === TokenType.LBRACKET) {
        this.consumeToken();
        const property = this.parseExpression();
        this.consumeToken(TokenType.RBRACKET);
        node = { type: 'MemberExpression', object: node, property, computed: true };
      } else if (this.currentToken().type === TokenType.LPAREN) {
        this.consumeToken();
        const args: ASTNode[] = [];
        
        while (this.currentToken().type !== TokenType.RPAREN) {
          args.push(this.parseExpression());
          if (this.currentToken().type === TokenType.COMMA) {
            this.consumeToken();
          }
        }
        
        this.consumeToken(TokenType.RPAREN);
        node = { type: 'CallExpression', callee: node, arguments: args };
      } else {
        break;
      }
    }

    return node;
  }

  private parsePrimary(): ASTNode {
    const token = this.currentToken();

    switch (token.type) {
      case TokenType.NUMBER:
        this.consumeToken();
        return { type: 'Literal', value: parseFloat(token.value) };
      
      case TokenType.STRING:
        this.consumeToken();
        return { type: 'Literal', value: token.value };
      
      case TokenType.BOOLEAN:
        this.consumeToken();
        return { type: 'Literal', value: token.value === 'true' };
      
      case TokenType.IDENTIFIER:
        this.consumeToken();
        return { type: 'Identifier', name: token.value };
      
      case TokenType.LPAREN:
        this.consumeToken();
        const node = this.parseExpression();
        this.consumeToken(TokenType.RPAREN);
        return node;
      
      default:
        throw new Error(`Unexpected token ${token.type} at position ${token.position}`);
    }
  }
}

/**
 * Safe expression evaluator
 */
export class SafeExpressionEvaluator {
  /**
   * Evaluate an expression safely with a given context
   */
  static evaluate(expression: string, context: Record<string, any>): any {
    // Tokenize
    const tokenizer = new Tokenizer(expression);
    const tokens = tokenizer.tokenize();

    // Parse
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // Evaluate
    return this.evaluateAST(ast, context);
  }

  private static evaluateAST(node: ASTNode, context: Record<string, any>): any {
    switch (node.type) {
      case 'Literal':
        return node.value;
      
      case 'Identifier':
        if (!(node.name in context)) {
          throw new Error(`Undefined variable: ${node.name}`);
        }
        return context[node.name];
      
      case 'BinaryExpression':
        const left = this.evaluateAST(node.left, context);
        const right = this.evaluateAST(node.right, context);
        
        switch (node.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return left / right;
          case '%': return left % right;
          case '<': return left < right;
          case '>': return left > right;
          case '<=': return left <= right;
          case '>=': return left >= right;
          case '==': return left == right;
          case '!=': return left != right;
          case '===': return left === right;
          case '!==': return left !== right;
          default:
            throw new Error(`Unknown binary operator: ${node.operator}`);
        }
      
      case 'UnaryExpression':
        const argument = this.evaluateAST(node.argument, context);
        
        switch (node.operator) {
          case '!': return !argument;
          case '-': return -argument;
          case '+': return +argument;
          default:
            throw new Error(`Unknown unary operator: ${node.operator}`);
        }
      
      case 'LogicalExpression':
        const leftLogical = this.evaluateAST(node.left, context);
        
        if (node.operator === '&&') {
          return leftLogical && this.evaluateAST(node.right, context);
        } else if (node.operator === '||') {
          return leftLogical || this.evaluateAST(node.right, context);
        }
        
        throw new Error(`Unknown logical operator: ${node.operator}`);
      
      case 'ConditionalExpression':
        const test = this.evaluateAST(node.test, context);
        return test 
          ? this.evaluateAST(node.consequent, context)
          : this.evaluateAST(node.alternate, context);
      
      case 'MemberExpression':
        const object = this.evaluateAST(node.object, context);
        
        if (object == null) {
          throw new Error('Cannot access property of null or undefined');
        }
        
        let property: string;
        if (node.computed) {
          property = String(this.evaluateAST(node.property, context));
        } else {
          property = (node.property as any).name;
        }
        
        // Security check: prevent access to dangerous properties
        const dangerousProps = ['constructor', 'prototype', '__proto__', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__'];
        if (dangerousProps.includes(property)) {
          throw new Error(`Access to property '${property}' is not allowed`);
        }
        
        return object[property];
      
      case 'CallExpression':
        const callee = this.evaluateAST(node.callee, context);
        
        if (typeof callee !== 'function') {
          throw new Error('Attempted to call a non-function');
        }
        
        const args = node.arguments.map(arg => this.evaluateAST(arg, context));
        
        // Security: Only allow whitelisted functions
        if (!this.isSafeFunction(callee, context)) {
          throw new Error('Function call not allowed');
        }
        
        return callee(...args);
      
      default:
        throw new Error(`Unknown AST node type: ${(node as any).type}`);
    }
  }

  private static isSafeFunction(func: Function, context: Record<string, any>): boolean {
    // Check if the function is one of our safe context functions
    const safeFunctions = new Set(Object.values(context).filter(v => typeof v === 'function'));
    return safeFunctions.has(func);
  }
}