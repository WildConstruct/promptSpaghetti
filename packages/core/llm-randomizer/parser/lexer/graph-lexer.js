"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphLexer = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType["VERSION"] = "VERSION";
    TokenType["CHECKSUM"] = "CHECKSUM";
    TokenType["METADATA"] = "METADATA";
    TokenType["SECTION_DELIMITER"] = "SECTION_DELIMITER";
    TokenType["KEY"] = "KEY";
    TokenType["VALUE"] = "VALUE";
    TokenType["COLON"] = "COLON";
    TokenType["DASH"] = "DASH";
    TokenType["ARRAY_START"] = "ARRAY_START";
    TokenType["ARRAY_END"] = "ARRAY_END";
    TokenType["STRING"] = "STRING";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["BOOLEAN"] = "BOOLEAN";
    TokenType["NULL"] = "NULL";
    TokenType["NEWLINE"] = "NEWLINE";
    TokenType["INDENT"] = "INDENT";
    TokenType["DEDENT"] = "DEDENT";
    TokenType["EDGE_ARROW"] = "EDGE_ARROW";
    TokenType["EOF"] = "EOF";
    TokenType["ERROR"] = "ERROR";
})(TokenType || (exports.TokenType = TokenType = {}));
class GraphLexer {
    constructor(input) {
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
        this.errors = [];
        this.indentStack = [0];
        this.currentSection = null;
        this.input = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
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
    scanToken() {
        const start = this.position;
        const char = this.advance();
        if (char === ' ' || char === '\t') {
            if (this.isAtLineStart()) {
                this.handleIndentation();
            }
            return;
        }
        if (char === '\n') {
            this.addToken(TokenType.NEWLINE, '\n');
            this.line++;
            this.column = 1;
            return;
        }
        if (char === '#') {
            this.skipComment();
            return;
        }
        if (char === '-' && this.peek() === '-' && this.peekNext() === '-') {
            this.scanSectionDelimiter();
            return;
        }
        if (this.currentSection === 'EDGES' && char === '-' && this.peek() === '>') {
            this.advance();
            this.addToken(TokenType.EDGE_ARROW, '->');
            return;
        }
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
    handleIndentation() {
        let indent = 0;
        const start = this.position - 1;
        for (let i = start; i < this.input.length; i++) {
            const char = this.input[i];
            if (char === ' ') {
                indent++;
            }
            else if (char === '\t') {
                indent += 4;
            }
            else {
                break;
            }
        }
        const currentIndent = this.indentStack[this.indentStack.length - 1];
        if (indent > currentIndent) {
            this.indentStack.push(indent);
            this.addToken(TokenType.INDENT, ' '.repeat(indent));
        }
        else if (indent < currentIndent) {
            while (this.indentStack.length > 1 && this.indentStack[this.indentStack.length - 1] > indent) {
                this.indentStack.pop();
                this.addToken(TokenType.DEDENT, '');
            }
            if (this.indentStack[this.indentStack.length - 1] !== indent) {
                this.addError('Indentation does not match any outer indentation level', 'Use consistent 2-space indentation');
            }
        }
    }
    scanSectionDelimiter() {
        const start = this.position - 1;
        this.advance();
        this.advance();
        let sectionName = '';
        while (!this.isAtEnd() && this.peek() !== '-') {
            sectionName += this.advance();
        }
        if (this.peek() === '-' && this.peekNext() === '-' && this.input[this.position + 2] === '-') {
            this.advance();
            this.advance();
            this.advance();
        }
        else {
            this.addError('Incomplete section delimiter', 'Section delimiters must end with ---');
        }
        const fullDelimiter = this.input.substring(start, this.position);
        this.addToken(TokenType.SECTION_DELIMITER, fullDelimiter);
        this.currentSection = sectionName;
    }
    scanQuotedString(quote) {
        const start = this.position - 1;
        let value = '';
        let escaped = false;
        while (!this.isAtEnd() && (this.peek() !== quote || escaped)) {
            if (escaped) {
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
        this.advance();
        this.addToken(TokenType.STRING, value);
    }
    scanString() {
        const start = this.position - 1;
        let value = this.input[start];
        while (!this.isAtEnd() && !this.isLineTerminator(this.peek()) &&
            this.peek() !== ':' && this.peek() !== '[' && this.peek() !== ']' &&
            this.peek() !== ',' && !this.isWhitespace(this.peek())) {
            value += this.advance();
        }
        if (this.isAtLineStart() || this.isAfterIndent()) {
            this.addToken(TokenType.KEY, value.trim());
        }
        else {
            this.addToken(TokenType.VALUE, value.trim());
        }
    }
    scanIdentifier() {
        const start = this.position - 1;
        let value = this.input[start];
        while (!this.isAtEnd() && (this.isAlpha(this.peek()) || this.isDigit(this.peek()) ||
            this.peek() === '_' || this.peek() === '-' || this.peek() === '.')) {
            value += this.advance();
        }
        const tokenType = this.getKeywordType(value);
        this.addToken(tokenType, value);
    }
    scanNumber() {
        const start = this.position - 1;
        let value = this.input[start];
        while (!this.isAtEnd() && (this.isDigit(this.peek()) || this.peek() === '.')) {
            value += this.advance();
        }
        this.addToken(TokenType.NUMBER, value);
    }
    skipComment() {
        while (!this.isAtEnd() && this.peek() !== '\n') {
            this.advance();
        }
    }
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
                return this.isAtLineStart() || this.isAfterIndent() ? TokenType.KEY : TokenType.VALUE;
        }
    }
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
        if (this.tokens.length === 0)
            return false;
        const lastToken = this.tokens[this.tokens.length - 1];
        return lastToken.type === TokenType.INDENT;
    }
}
exports.GraphLexer = GraphLexer;
//# sourceMappingURL=graph-lexer.js.map