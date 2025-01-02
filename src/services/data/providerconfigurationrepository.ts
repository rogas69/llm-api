import { Filter, WithId } from "mongodb";
import { DBContext } from "../../database/dbcontext";
import { ILogger } from "../ILogger";
import { ProviderConfigurationDto } from "./providerconfigurationdto";

export interface GetProviderConfigurationsParams {
    modelProvider?: string;
};

export class ProviderConfigurationRepository {

    private readonly collectionName: string = 'provider_configurations';

    constructor(
        private readonly logger: ILogger,
        private readonly dbContext: DBContext) { }

    async getProviderConfigurations(params: GetProviderConfigurationsParams): Promise<WithId<ProviderConfigurationDto>[]> {
        this.logger.log('getProviderConfigurations called');
        const db = await this.dbContext.connectDatabase();
        const filter = this.buildFilter(params.modelProvider);
        const configurations = await db.collection<ProviderConfigurationDto>(this.collectionName)
            .find(filter)
            .toArray();
        return configurations ?? [];
    }

    async getProviderModels(params: GetProviderConfigurationsParams): Promise<string[]> {
        this.logger.log('getProviderModels called');
        const db = await this.dbContext.connectDatabase();
        const filter = this.buildFilter(params.modelProvider);
        const config = await db.collection<ProviderConfigurationDto>(this.collectionName)
            .findOne(filter);
        if (config) {
            const { _id, ...providerConfig } = config; // Exclude the _id field
            return (providerConfig as ProviderConfigurationDto).llmModelNames ?? [];
        }
        return [];
    }

    private buildFilter(modelProvider: string | undefined): Filter<ProviderConfigurationDto> {
        const filter: Filter<ProviderConfigurationDto> = {};

        if (modelProvider) {
            (filter as any).modelProvider = modelProvider;
        }

        return filter;
    }
}