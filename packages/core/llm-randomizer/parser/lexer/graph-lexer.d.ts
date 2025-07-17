export interface LexerPosition {
    line: number;
    column: number;
    offset: number;
}
export declare enum TokenType {
    VERSION = "VERSION",
    CHECKSUM = "CHECKSUM",
    METADATA = "METADATA",
    SECTION_DELIMITER = "SECTION_DELIMITER",
    KEY = "KEY",
    VALUE = "VALUE",
    COLON = "COLON",
    DASH = "DASH",
    ARRAY_START = "ARRAY_START",
    ARRAY_END = "ARRAY_END",
    STRING = "STRING",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN",
    NULL = "NULL",
    NEWLINE = "NEWLINE",
    INDENT = "INDENT",
    DEDENT = "DEDENT",
    EDGE_ARROW = "EDGE_ARROW",
    EOF = "EOF",
    ERROR = "ERROR"
}
export interface Token {
    type: TokenType;
    value: string;
    position: LexerPosition;
    raw?: string;
}
export interface LexerError {
    message: string;
    position: LexerPosition;
    suggestion?: string;
}
export declare class GraphLexer {
    private input;
    private position;
    private line;
    private column;
    private tokens;
    private errors;
    private indentStack;
    private currentSection;
    constructor(input: string);
    tokenize(): {
        tokens: Token[];
        errors: LexerError[];
    };
    private scanToken;
    private handleIndentation;
    private scanSectionDelimiter;
    private scanQuotedString;
    private scanString;
    private scanIdentifier;
    private scanNumber;
    private skipComment;
    private getKeywordType;
    private addToken;
    private addError;
    private advance;
    private peek;
    private peekNext;
    private isAtEnd;
    private isDigit;
    private isAlpha;
    private isWhitespace;
    private isLineTerminator;
    private isAtLineStart;
    private isAfterIndent;
}
//# sourceMappingURL=graph-lexer.d.ts.map