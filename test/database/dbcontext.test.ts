import { MongoClient, Db } from 'mongodb';
import { DBContext } from '../../src/database/dbcontext';
import { ILogger } from '../../src/services/ILogger';

describe('DBContext Tests', () => {
    let dbClient: MongoClient;
    let logger: ILogger;
    let dbContext: DBContext;
    const dbName = 'testDB';

    beforeEach(() => {
        dbClient = {
            connect: jest.fn().mockResolvedValue(undefined),
            db: jest.fn().mockReturnValue({} as Db),
            close: jest.fn().mockResolvedValue(undefined),
        } as unknown as MongoClient;

        logger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
        };


    });

    it('should connect to the database and log the connection', async () => {
        dbContext = new DBContext(dbClient, dbName, logger);
        const db = await dbContext.connectDatabase();

        expect(dbClient.connect).toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith('DBContext connected');
        expect(dbClient.db).toHaveBeenCalledWith(dbName);
        expect(db).toBe(dbClient.db(dbName));
    });

    it('should connect to the database and log the connection only once', async () => {
        dbContext = new DBContext(dbClient, dbName, logger);
        const db = await dbContext.connectDatabase();

        expect(dbClient.connect).toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith('DBContext connected');
        expect(dbClient.db).toHaveBeenCalledWith(dbName);
        expect(db).toBe(dbClient.db(dbName));

        //call connectDatabase again
        jest.resetAllMocks();
        const db2 = await dbContext.connectDatabase();
        expect(dbClient.connect).not.toHaveBeenCalled();
        expect(logger.log).not.toHaveBeenCalledWith('DBContext connected');
        expect(dbClient.db).toHaveBeenCalledWith(dbName);
        expect(db2).toBe(dbClient.db(dbName));
    });


    it('should close the database connection and log the closure', () => {
        dbContext = new DBContext(dbClient, dbName, logger);
        dbContext[Symbol.dispose]();

        expect(dbClient.close).toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith('DBContext closed');
    });

    it('using should close the database connection and log the closure', async () => {
        {
            await using dbContext = new DBContext(dbClient, dbName, logger)
            const db = await dbContext.connectDatabase();
        }

        expect(dbClient.connect).toHaveBeenCalled();
        expect(dbClient.db).toHaveBeenCalledWith(dbName);
        expect(logger.log).toHaveBeenCalledWith('DBContext connected');
        expect(dbClient.close).toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith('DBContext closed');
    });
});