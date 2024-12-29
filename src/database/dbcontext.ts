import { Db, MongoClient } from "mongodb";
import { ILogger } from "../services/ILogger";

export class DBContext implements Disposable {

    private isConnected: boolean = false;
    constructor(
        private readonly dbClient: MongoClient,
        private readonly dbName: string,
        private readonly logger: ILogger) { 
            
        }
    async connectDatabase(): Promise<Db> {
        if(this.isConnected) 
            return this.dbClient.db(this.dbName);
        
        await this.dbClient.connect();
        this.logger.log('DBContext connected');
        this.isConnected = true;
        return this.dbClient.db(this.dbName);
    }

    [Symbol.dispose](): void {
         this.dbClient.close(); 
         this.logger.log('DBContext closed');
    }
}