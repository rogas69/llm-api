import { DBContext } from "../../database/dbcontext";
import { ILogger } from "../ILogger";
import { BoundaryDto } from "./boundarydto";

export class BoundaryRepository implements Disposable {

    private readonly collectionName: string = 'boundaries';

    constructor(
        private readonly logger: ILogger,
        private readonly dbContext: DBContext) { }

    /**
     * Returns all boundaries from the database
     * @returns 
     */
    async getAllBoundaries(): Promise<BoundaryDto[]> {
        const db = await this.dbContext.connectDatabase();
        const roles = db.collection<BoundaryDto>(this.collectionName).find().toArray();
        return roles;
    }


    /**
     * Returns a boundary with the given name
     * @param boundaryName - the name of the boundary to return
     * @returns a one-element array with the boundary, or an empty array if no boundary with the given name exists
     */
    async getBoundaryByName(boundaryName: string): Promise<BoundaryDto[]> {
        const db = await this.dbContext.connectDatabase();
        const boundary = await db.collection<BoundaryDto>(this.collectionName).find({ name: boundaryName }).toArray();
        return boundary;
    }

    /**
     * 
     * @param boundary Inserts a new boundary into the database
     * @returns true if the boundary was inserted, false otherwise
     */
    async insertBoundary(boundary: BoundaryDto): Promise<boolean> {
        if(!(boundary.name)) {
            this.logger.warn(`Error inserting boundary - invalid data passed.`);
            return false;
        }
        const db = await this.dbContext.connectDatabase();
        const result = await db.collection<BoundaryDto>(this.collectionName)
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

    /**
     * 
     * @param boundaryName Removes a boundary with given name from the database
     * @returns true if a record was deleted, false otherwise
     */
    async deleteBoundaryByName(boundaryName: string): Promise<boolean> {
        if(!boundaryName) {
            this.logger.warn('Error deleting boundary - invalid name passed.');
            return false;
        }
        const db = await this.dbContext.connectDatabase();
        const result = await db.collection<BoundaryDto>(this.collectionName)
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

    /**
     * Updates a boundary in the database. Both the name and description can be updated.
     * @param boundary 
     * @returns true if a record was updated, false otherwise
     */
    async updateBoundary(boundary: BoundaryDto): Promise<boolean> {
        const db = await this.dbContext.connectDatabase();
        const result = await db.collection<BoundaryDto>(this.collectionName)
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