import { Filter } from "mongodb";
import { DBContext } from "../../database/dbcontext";
import { ILogger } from "../ILogger";
import { BoundaryConfigurationDto } from "./boundaryconfigurationdto";
import { BoundaryDto } from "./boundarydto";

import { GetBoundaryConfigurationsParams, ModelProvider } from "../types";


export class BoundaryConfigurationRepository {

    private readonly collectionName: string = 'boundary_configurations';

    constructor(
        private readonly logger: ILogger,
        private readonly dbContext: DBContext) { }

    async getBoundaryConfigurations(params: GetBoundaryConfigurationsParams): Promise<BoundaryConfigurationDto[]> {
        this.logger.log('getBoundaryConfigurations called');
        const db = await this.dbContext.connectDatabase();
        const filter = this.buildFilter(params.boundaryName, params.modelProvider);
        const roles = await db.collection<BoundaryConfigurationDto>(this.collectionName).find(filter).toArray();
        return roles;
    }

    private buildFilter(boundaryName: string | undefined, modelProvider: string | undefined): Filter<BoundaryConfigurationDto> {
        const filter: Filter<BoundaryConfigurationDto> = {};

        const conditions: Filter<BoundaryConfigurationDto>[] = [];

        if (boundaryName) {
            conditions.push({ boundaryName: boundaryName });
        }

        if (modelProvider) {
            conditions.push({ modelProvider: modelProvider as ModelProvider });
        }

        if (conditions.length > 0) {
            filter.$and = conditions;
        }
        return filter;
    }


    /**
     * Inserts a boundary configuration into the database.
     * @param boundaryConfiguration 
     * @returns True if the boundary configuration was inserted successfully, false otherwise.
     */
    async insertBoundaryConfiguration(boundaryConfiguration: BoundaryConfigurationDto): Promise<boolean> {
        if (!(this.validateBoundaryConfiguration(boundaryConfiguration))) {
            this.logger.warn(`Error inserting boundary configuration - invalid data passed.`);
            return false;
        }

        const db = await this.dbContext.connectDatabase();
        //check if the boundary exists
        const boundaryExists = await db.collection<BoundaryDto>('boundaries')
            .findOne({ name: boundaryConfiguration.boundaryName });
        if (!boundaryExists) {
            this.logger.error(`Error inserting boundary configuration - boundary ${boundaryConfiguration.boundaryName} does not exist.`);
            return false;
        }

        const result = await db.collection<BoundaryConfigurationDto>(this.collectionName)
            .insertOne(boundaryConfiguration)
            .then((_) => {
                this.logger.log(`Boundary configuration ${boundaryConfiguration.boundaryName} inserted`);
                return true;
            })
            .catch((err) => {
                this.logger.error(`Error inserting boundary configuration ${boundaryConfiguration.boundaryName}: ${err}`);
                return false;
            });
        return result;
    }

    async updateBoundaryConfiguration(boundaryConfiguration: BoundaryConfigurationDto): Promise<boolean> {
        if (!(this.validateBoundaryConfiguration(boundaryConfiguration))) {
            this.logger.warn(`Error updating boundary configuration - invalid data passed.`);
            return false;
        }

        const db = await this.dbContext.connectDatabase();
        const result = await db.collection<BoundaryConfigurationDto>(this.collectionName)
            .updateOne({ boundaryName: boundaryConfiguration.boundaryName }, { $set: boundaryConfiguration }, { upsert: false })
            .then((_) => {
                this.logger.log(`Boundary configuration ${boundaryConfiguration.boundaryName} updated`);
                return true;
            })
            .catch((err) => {
                this.logger.error(`Error updating boundary configuration ${boundaryConfiguration.boundaryName}: ${err}`);
                return false;
            });
        return result;
    }

    async deleteBoundaryConfigurationByBoundaryName(boundaryName: string): Promise<boolean> {
        this.logger.log(`deleteBoundaryConfigurationByBoundaryName called with name: ${boundaryName}`);

        const db = await this.dbContext.connectDatabase();
        const result = await db.collection<BoundaryConfigurationDto>(this.collectionName)
            .deleteOne({ boundaryName: boundaryName })
            .then((_) => {
                this.logger.log(`Boundary configuration ${boundaryName} deleted`);
                return true;
            })
            .catch((err) => {
                this.logger.error(`Error deleting boundary configuration ${boundaryName}: ${err}`);
                return false;
            });
        return result;
    }

    private validString(value: string | undefined): boolean {
        return value !== undefined && value !== null && value.length > 0;
    }

    private validateBoundaryConfiguration(boundaryConfiguration: BoundaryConfigurationDto): boolean {
        return this.validString(boundaryConfiguration.boundaryName)
            && this.validString(boundaryConfiguration.llmModelName)
            && this.validString(boundaryConfiguration.modelProvider)
            && this.validString(boundaryConfiguration.embeddingsModelName)
    }

}


