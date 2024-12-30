import { Db, MongoClient } from "mongodb";
import { ILogger } from "../services/ILogger";

export class DBContext implements Disposable {

    private isConnected: boolean = false;
    constructor(
        private readonly mongoDbClient: MongoClient,
        private readonly dbName: string,
        private readonly logger: ILogger) { 
            
        }
    async connectDatabase(): Promise<Db> {
        if(this.isConnected) 
            return this.mongoDbClient.db(this.dbName);
        
        await this.mongoDbClient.connect();
        this.logger.log('DBContext connected');
        this.isConnected = true;
        return this.mongoDbClient.db(this.dbName);
    }

    [Symbol.dispose](): void {
         this.mongoDbClient.close(); 
         this.logger.log('DBContext closed');
    }
}