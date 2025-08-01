/**
 * Simple logger utility
 * Can be replaced with more sophisticated logging libraries like winston or pino
 */
}
}
}
export interface Logger {
    info: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    debug: (message: string, ...args: unknown[]) => void;
}
}
}
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map