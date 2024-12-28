import { Logger } from '../../src/services/Logger';

describe('Logger Tests', () => {
    let logger: Logger;

    beforeEach(() => {
        logger = new Logger();
    });

    it('should log info messages correctly', () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const message = 'This is an info message';

        logger.log(message);

        expect(consoleLogSpy).toHaveBeenCalledWith(`==== INFO : ${message}`);
        consoleLogSpy.mockRestore();
    });

    it('should log error messages correctly', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const message = 'This is an error message';

        logger.error(message);

        expect(consoleErrorSpy).toHaveBeenCalledWith(`==== ERROR: ${message}`);
        consoleErrorSpy.mockRestore();
    });

    it('should log warn messages correctly', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const message = 'This is a warn message';

        logger.warn(message);

        expect(consoleWarnSpy).toHaveBeenCalledWith(`==== WARN : ${message}`);
        consoleWarnSpy.mockRestore();
    });
});