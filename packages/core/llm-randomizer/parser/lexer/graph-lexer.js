// Epic 12 - LLM Agent Randomizer System
// Story 12.3 - Parser Implementation
// Lexical analysis for LLM-generated graph format
export var TokenType;
(function (TokenType) {
    // Structure tokens
    TokenType["VERSION"] = "VERSION";
    TokenType["CHECKSUM"] = "CHECKSUM";
    TokenType["METADATA"] = "METADATA";
    TokenType["SECTION_DELIMITER"] = "SECTION_DELIMITER";
    // YAML tokens
    TokenType["KEY"] = "KEY";
    TokenType["VALUE"] = "VALUE";
    TokenType["COLON"] = "COLON";
    TokenType["DASH"] = "DASH";
    TokenType["ARRAY_START"] = "ARRAY_START";
    TokenType["ARRAY_END"] = "ARRAY_END";
    // Content tokens
    TokenType["STRING"] = "STRING";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["BOOLEAN"] = "BOOLEAN";
    TokenType["NULL"] = "NULL";
    // Special tokens
    TokenType["NEWLINE"] = "NEWLINE";
    TokenType["INDENT"] = "INDENT";
    TokenType["DEDENT"] = "DEDENT";
    TokenType["EDGE_ARROW"] = "EDGE_ARROW";
    // Control tokens
    TokenType["EOF"] = "EOF";
    TokenType["ERROR"] = "ERROR";
})(TokenType || (TokenType = {}));
export class GraphLexer {
    input;
    position = 0;
    line = 1;
    column = 1;
    tokens = [];
    errors = [];
    indentStack = [0];
    currentSection = null;
    constructor(input) {
        this.input = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
    /**
     * Tokenize the entire input
     */
    tokenize() {
        this.tokens = [];
        this.errors = [];
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.indentStack = [0];
        this.currentSection = null;
        while (!this.isAtEnd()) {
            this.scanToken();
        }
        // Emit final dedents
        while (this.indentStack.length > 1) {
            this.indentStack.pop();
            this.addToken(TokenType.DEDENT, '');
        }
        this.addToken(TokenType.EOF, '');
        return {
            tokens: this.tokens,
            errors: this.errors
        };
    }
    /**
     * Scan and classify the next token
     */
    scanToken() {
        const start = this.position;
        const char = this.advance();
        // Skip whitespace (except newlines)
        if (char === ' ' || char === '\t') {
            // Handle indentation at start of line
            if (this.isAtLineStart()) {
                this.handleIndentation();
            }
            return;
        }
        // Handle newlines
        if (char === '\n') {
            this.addToken(TokenType.NEWLINE, '\n');
            this.line++;
            this.column = 1;
            return;
        }
        // Skip comments
        if (char === '#') {
            this.skipComment();
            return;
        }
        // Handle section delimiters
        if (char === '-' && this.peek() === '-' && this.peekNext() === '-') {
            this.scanSectionDelimiter();
            return;
        }
        // Handle edge arrows in edges section
        if (this.currentSection === 'EDGES' && char === '-' && this.peek() === '>') {
            this.advance(); // consume '>'
            this.addToken(TokenType.EDGE_ARROW, '->');
            return;
        }
        // Handle YAML structure
        switch (char) {
            case ':':
                this.addToken(TokenType.COLON, ':');
                break;
            case '-':
                if (this.isWhitespace(this.peek())) {
                    this.addToken(TokenType.DASH, '-');
                }
                else {
                    this.scanString();
                }
                break;
            case '[':
                this.addToken(TokenType.ARRAY_START, '[');
                break;
            case ']':
                this.addToken(TokenType.ARRAY_END, ']');
                break;
            case '"':
            case "'":
                this.scanQuotedString(char);
                break;
            default:
                if (this.isDigit(char)) {
                    this.scanNumber();
                }
                else if (this.isAlpha(char)) {
                    this.scanIdentifier();
                }
                else {
                    this.addError(`Unexpected character: ${char}`, 'Check for typos or invalid characters');
                }
                break;
        }
    }
    /**
     * Handle indentation tracking
     */
    handleIndentation() {
        let indent = 0;
        const start = this.position - 1; // Go back to include current space/tab
        // Count indentation
        for (let i = start; i < this.input.length; i++) {
            const char = this.input[i];
            if (char === ' ') {
                indent++;
            }
            else if (char === '\t') {
                indent += 4; // Treat tab as 4 spaces
            }
            else {
                break;
            }
        }
        const currentIndent = this.indentStack[this.indentStack.length - 1];
        if (indent > currentIndent) {
            // Increased indentation
            this.indentStack.push(indent);
            this.addToken(TokenType.INDENT, ' '.repeat(indent));
        }
        else if (indent < currentIndent) {
            // Decreased indentation - may need multiple dedents
            while (this.indentStack.length > 1 && this.indentStack[this.indentStack.length - 1] > indent) {
                this.indentStack.pop();
                this.addToken(TokenType.DEDENT, '');
            }
            // Check for indentation error
            if (this.indentStack[this.indentStack.length - 1] !== indent) {
                this.addError('Indentation does not match any outer indentation level', 'Use consistent 2-space indentation');
            }
        }
    }
    /**
     * Scan section delimiter (---NODES---, ---EDGES---, etc.)
     */
    scanSectionDelimiter() {
        const start = this.position - 1;
        // Skip the '---' we already detected
        this.advance(); // second -
        this.advance(); // third -
        let sectionName = '';
        while (!this.isAtEnd() && this.peek() !== '-') {
            sectionName += this.advance();
        }
        // Expect closing '---'
        if (this.peek() === '-' && this.peekNext() === '-' && this.input[this.position + 2] === '-') {
            this.advance(); // first -
            this.advance(); // second -  
            this.advance(); // third -
        }
        else {
            this.addError('Incomplete section delimiter', 'Section delimiters must end with ---');
        }
        const fullDelimiter = this.input.substring(start, this.position);
        this.addToken(TokenType.SECTION_DELIMITER, fullDelimiter);
        // Track current section
        this.currentSection = sectionName;
    }
    /**
     * Scan quoted string
     */
    scanQuotedString(quote) {
        const start = this.position - 1;
        let value = '';
        let escaped = false;
        while (!this.isAtEnd() && (this.peek() !== quote || escaped)) {
            if (escaped) {
                // Handle escape sequences
                const char = this.advance();
                switch (char) {
                    case 'n':
                        value += '\n';
                        break;
                    case 't':
                        value += '\t';
                        break;
                    case 'r':
                        value += '\r';
                        break;
                    case '\\':
                        value += '\\';
                        break;
                    case '"':
                        value += '"';
                        break;
                    case "'":
                        value += "'";
                        break;
                    default:
                        value += char;
                        break;
                }
                escaped = false;
            }
            else if (this.peek() === '\\') {
                escaped = true;
                this.advance();
            }
            else {
                value += this.advance();
            }
        }
        if (this.isAtEnd()) {
            this.addError('Unterminated string', 'Add closing quote');
            return;
        }
        // Consume closing quote
        this.advance();
        this.addToken(TokenType.STRING, value);
    }
    /**
     * Scan unquoted string/identifier
     */
    scanString() {
        const start = this.position - 1;
        let value = this.input[start];
        while (!this.isAtEnd() && !this.isLineTerminator(this.peek()) &&
            this.peek() !== ':' && this.peek() !== '[' && this.peek() !== ']' &&
            this.peek() !== ',' && !this.isWhitespace(this.peek())) {
            value += this.advance();
        }
        // Determine if this is a key or value based on context
        if (this.isAtLineStart() || this.isAfterIndent()) {
            this.addToken(TokenType.KEY, value.trim());
        }
        else {
            this.addToken(TokenType.VALUE, value.trim());
        }
    }
    /**
     * Scan identifier (unquoted key/value)
     */
    scanIdentifier() {
        const start = this.position - 1;
        let value = this.input[start];
        while (!this.isAtEnd() && (this.isAlpha(this.peek()) || this.isDigit(this.peek()) ||
            this.peek() === '_' || this.peek() === '-' || this.peek() === '.')) {
            value += this.advance();
        }
        // Check for special keywords
        const tokenType = this.getKeywordType(value);
        this.addToken(tokenType, value);
    }
    /**
     * Scan numeric value
     */
    scanNumber() {
        const start = this.position - 1;
        let value = this.input[start];
        while (!this.isAtEnd() && (this.isDigit(this.peek()) || this.peek() === '.')) {
            value += this.advance();
        }
        this.addToken(TokenType.NUMBER, value);
    }
    /**
     * Skip comment to end of line
     */
    skipComment() {
        while (!this.isAtEnd() && this.peek() !== '\n') {
            this.advance();
        }
    }
    /**
     * Get token type for keywords
     */
    getKeywordType(value) {
        switch (value.toLowerCase()) {
            case 'version': return TokenType.VERSION;
            case 'checksum': return TokenType.CHECKSUM;
            case 'metadata': return TokenType.METADATA;
            case 'true':
            case 'false': return TokenType.BOOLEAN;
            case 'null':
            case 'nil': return TokenType.NULL;
            default:
                // Determine if key or value based on position
                return this.isAtLineStart() || this.isAfterIndent() ? TokenType.KEY : TokenType.VALUE;
        }
    }
    /**
     * Add token to list
     */
    addToken(type, value) {
        this.tokens.push({
            type,
            value,
            position: {
                line: this.line,
                column: this.column - value.length,
                offset: this.position - value.length
            }
        });
    }
    /**
     * Add error to list
     */
    addError(message, suggestion) {
        this.errors.push({
            message,
            position: {
                line: this.line,
                column: this.column,
                offset: this.position
            },
            suggestion
        });
    }
    /**
     * Helper methods
     */
    advance() {
        if (this.isAtEnd())
            return '\0';
        this.column++;
        return this.input[this.position++];
    }
    peek() {
        if (this.isAtEnd())
            return '\0';
        return this.input[this.position];
    }
    peekNext() {
        if (this.position + 1 >= this.input.length)
            return '\0';
        return this.input[this.position + 1];
    }
    isAtEnd() {
        return this.position >= this.input.length;
    }
    isDigit(char) {
        return char >= '0' && char <= '9';
    }
    isAlpha(char) {
        return (char >= 'a' && char <= 'z') ||
            (char >= 'A' && char <= 'Z');
    }
    isWhitespace(char) {
        return char === ' ' || char === '\t';
    }
    isLineTerminator(char) {
        return char === '\n' || char === '\r';
    }
    isAtLineStart() {
        // Check if we're at the beginning of a line (after newline and optional whitespace)
        if (this.position === 0)
            return true;
        for (let i = this.position - 1; i >= 0; i--) {
            const char = this.input[i];
            if (char === '\n')
                return true;
            if (!this.isWhitespace(char))
                return false;
        }
        return true;
    }
    isAfterIndent() {
        // Check if we're immediately after indentation
        if (this.tokens.length === 0)
            return false;
        const lastToken = this.tokens[this.tokens.length - 1];
        return lastToken.type === TokenType.INDENT;
    }
}
