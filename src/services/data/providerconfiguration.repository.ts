import { Filter, WithId } from "mongodb";
import { DBContext } from "../../database/dbcontext";
import { ILogger } from "../ILogger";
import { ProviderConfigurationDto } from "./providerconfigurationdto";
import { EmbeddingModelProviderParameters, OllamaEmbeddingsParams } from "../genaitypes";
import { ChatOpenAIFields, OpenAIEmbeddingsParams } from "@langchain/openai";
import { GoogleGenerativeAIChatInput, GoogleGenerativeAIEmbeddingsParams } from "@langchain/google-genai";
import { ChatOllamaInput } from "@langchain/ollama";

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

    /**
     * Returns a provider with the name providerName or null.
     * @param providerName s
     * @returns 
     */
    private async getProviderConfiguration(providerName: string) : Promise<ProviderConfigurationDto | null> {
        const db = await this.dbContext.connectDatabase();
        const filter = this.buildFilter(providerName);
        const config = await db.collection<ProviderConfigurationDto>(this.collectionName)
            .findOne(filter);
        return config;
    }

    /**
     * Returns a list of chat models for a given provider, supported by the application. If provider is not found, the method returns an empty array.
     * @param params 
     * @returns 
     */
    async getProviderChatModels(params: GetProviderConfigurationsParams): Promise<string[]> {
        this.logger.log('getProviderChatModels called');
        const config = await this.getProviderConfiguration(params.modelProvider!);
        return config?.llmModelNames ?? [];
    }


    /**
     * Returns a list of embedding models for a given provider, supported by the application. If provider is not found, the method returns an empty array.
     * @param params 
     * @returns 
     */
    async getProviderEmbeddingModels(params: GetProviderConfigurationsParams): Promise<string[]> {
        this.logger.log('getProviderEmbeddingModels called');
        const config = await this.getProviderConfiguration(params.modelProvider!);
        return config?.embeddingsModelNames ?? [];
    }



    async insertProviderConfiguration(providerConfiguration: ProviderConfigurationDto): Promise<boolean> {
        if (!(this.validateProviderConfiguration(providerConfiguration))) {
            this.logger.error(`Error inserting provider configuration - invalid data passed.`);
            return false;
        }

        const db = await this.dbContext.connectDatabase();
        const result = await db.collection<ProviderConfigurationDto>(this.collectionName)
            .insertOne(providerConfiguration);
        return result.acknowledged;
    }

    validateProviderConfiguration(dto: ProviderConfigurationDto) {
        if (!dto.modelProvider) {
            return false;
        }
        if (!dto.llmModelNames || dto.llmModelNames.length === 0) return false;
        if (!dto.embeddingsModelNames || dto.embeddingsModelNames.length === 0) return false;

        //basically this validation only checks if the provided parameters have the model property.
        if ((this.isModelProviderParams<ChatOpenAIFields>(dto.llmModelParams)
            || this.isModelProviderParams<GoogleGenerativeAIChatInput>(dto.llmModelParams)
            || this.isModelProviderParams<ChatOllamaInput>(dto.llmModelParams)) === false) return false;


        if ((this.isOllamaEmbeddingsParams(dto.embeddingModelParams)
            || this.isOpenAIEmbeddingsParams(dto.embeddingModelParams)
            || this.isGoogleGenerativeAIEmbeddingsParams(dto.embeddingModelParams)) === false) return false;
        return true;
    }

    // Custom type guard functions
    private isModelProviderParams<T extends { model?: string | undefined }>(value: any): value is T {
        return value && typeof value.model === 'string' && value.model.length > 0;
    }

    private isOllamaEmbeddingsParams(value: EmbeddingModelProviderParameters): value is OllamaEmbeddingsParams {
        return this.isModelProviderParams<OllamaEmbeddingsParams>(value);
    }

    private isOpenAIEmbeddingsParams(value: EmbeddingModelProviderParameters): value is OpenAIEmbeddingsParams {
        return this.isModelProviderParams<OpenAIEmbeddingsParams>(value);
    }

    private isGoogleGenerativeAIEmbeddingsParams(value: EmbeddingModelProviderParameters): value is GoogleGenerativeAIEmbeddingsParams {
        return this.isModelProviderParams<GoogleGenerativeAIEmbeddingsParams>(value);
    }

    private buildFilter(modelProvider: string | undefined): Filter<ProviderConfigurationDto> {
        const filter: Filter<ProviderConfigurationDto> = {};

        if (modelProvider) {
            (filter as any).modelProvider = modelProvider;
        }

        return filter;
    }
}


