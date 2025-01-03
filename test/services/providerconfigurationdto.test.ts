import { ChatOpenAIFields, OpenAIEmbeddingsParams } from '@langchain/openai';
import { ProviderConfigurationDto } from '../../src/services/data/providerconfigurationdto';
import { OllamaEmbeddingsParams } from '../../src/services/genaitypes';
import { ModelProvider } from '../../src/services/types';
import { GoogleGenerativeAIChatInput, GoogleGenerativeAIEmbeddingsParams } from '@langchain/google-genai';
import { ChatOllamaInput } from '@langchain/ollama';


describe('ProviderConfigurationDto Tests', () => {
    it('should create a ProviderConfigurationDto instance with valid data for Ollama', () => {
        const modelProvider = 'Ollama' as ModelProvider;
        const llmModelNames = ['model1', 'model2'];
        const embeddingsModelNames = ['embedding1', 'embedding2'];
        const llmModelParams = { baseUrl: 'http://localhost:11434' } as ChatOllamaInput;
        const embeddingModelParams = { baseUrl: 'http://localhost:11434' } as OllamaEmbeddingsParams;

        const providerConfigurationDto = new ProviderConfigurationDto(
            modelProvider,
            llmModelNames,
            embeddingsModelNames,
            llmModelParams,
            embeddingModelParams
        );

        expect(providerConfigurationDto).toBeInstanceOf(ProviderConfigurationDto);
    });

    it('should create a ProviderConfigurationDto instance with valid data for OpenAI', () => {
        const modelProvider = 'OpenAI' as ModelProvider;
        const llmModelNames = ['model1', 'model2'];
        const embeddingsModelNames = ['embedding1', 'embedding2'];
        const llmModelParams = { baseUrl: 'http://localhost:11434' } as ChatOpenAIFields;
        const embeddingModelParams = {} as OpenAIEmbeddingsParams;

        const providerConfigurationDto = new ProviderConfigurationDto(
            modelProvider,
            llmModelNames,
            embeddingsModelNames,
            llmModelParams,
            embeddingModelParams
        );

        expect(providerConfigurationDto).toBeInstanceOf(ProviderConfigurationDto);
    });

    it('should create a ProviderConfigurationDto instance with valid data for GoogleAI', () => {
        const modelProvider = 'GoogleAI' as ModelProvider;
        const llmModelNames = ['model1', 'model2'];
        const embeddingsModelNames = ['embedding1', 'embedding2'];
        const llmModelParams = { baseUrl: 'http://localhost:11434' } as  GoogleGenerativeAIChatInput;
        const embeddingModelParams = {} as GoogleGenerativeAIEmbeddingsParams;

        const providerConfigurationDto = new ProviderConfigurationDto(
            modelProvider,
            llmModelNames,
            embeddingsModelNames,
            llmModelParams,
            embeddingModelParams
        );

        expect(providerConfigurationDto).toBeInstanceOf(ProviderConfigurationDto);
    });
});