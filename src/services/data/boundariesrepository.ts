import { DBContext } from "../../database/dbcontext";
import { ILogger } from "../ILogger";
import { ApiData } from "./boundarydto";

export class BoundariesRepository implements Disposable {
    constructor(
        private readonly logger: ILogger,
        private readonly dbContext: DBContext) { }

    async getAllBundaries(): Promise<ApiData.BoundaryDto[]> {
        const db = await this.dbContext.connectDatabase();
        const roles = await db.collection<ApiData.BoundaryDto>('boundaries').find().toArray();
        return roles;
    }


    async getBoundaryByName(boundaryName: string): Promise<ApiData.BoundaryDto[]> {
        const db = await this.dbContext.connectDatabase();
        const boundary = await db.collection<ApiData.BoundaryDto>('boundaries').find({ name: boundaryName }).toArray();
        return boundary;
    }

    async insertBoundary(boundary: ApiData.BoundaryDto): Promise<boolean> {
        if(!(boundary.name)) {
            this.logger.warn(`Error inserting boundary - invalid data passed.`);
            return false;
        }
        const db = await this.dbContext.connectDatabase();
        const result = await db.collection<ApiData.BoundaryDto>('boundaries')
            .insertOne(boundary)
            .then((_) => {
                this.logger.log(`Boundary ${boundary.name} inserted`);
                return true;
            }) 
            .catch((err) => {
                this.logger.error(`Error inserting boundary ${boundary.name}: ${err}`);
                return false;
            });
            return result;
    }

    async deleteBoundaryByName(boundaryName: string): Promise<boolean> {
        if(!boundaryName) {
            this.logger.warn('Error deleting boundary - invalid name passed.');
            return false;
        }
        const db = await this.dbContext.connectDatabase();
        const result = await db.collection<ApiData.BoundaryDto>('boundaries')
            .deleteOne({ name: boundaryName })
            .then((deleteResult) => {
                if (deleteResult.deletedCount === 0) {
                    this.logger.warn(`Boundary ${boundaryName} not found`);
                    return false;
                }
                this.logger.log(`Boundary ${boundaryName} deleted`);
                return true;
            })
            .catch((err) => {
                this.logger.error(`Error deleting boundary ${boundaryName}: ${err}`);
                return false;
            });
        return result;
    }

    async updateBoundary(boundary: ApiData.BoundaryDto): Promise<boolean> {
        const db = await this.dbContext.connectDatabase();
        const result = await db.collection<ApiData.BoundaryDto>('boundaries')
            .updateOne({ name: boundary.name }, boundary, { upsert: false })
            .then((_) => {
                this.logger.log(`Boundary ${boundary.name} updated`);
                return true;
            })
            .catch((err) => {
                this.logger.error(`Error updating boundary ${boundary.name}: ${err}`);
                return false;
            });
        return result;
    }

    [Symbol.dispose](): void {
        this.dbContext[Symbol.dispose]();
    }

}