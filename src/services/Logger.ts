import { ILogger } from "./ILogger";

export class Logger implements ILogger {
    log(message: string): void {
        console.log(`==== INFO : ${message}`);
    }

    error(message: string): void {
        console.error(`==== ERROR: ${message}`);
    }

    warn(message: string): void {
        console.warn(`==== WARN : ${message}`);
    }
} 