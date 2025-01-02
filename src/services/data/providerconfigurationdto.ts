import { OpenAIEmbeddingsParams } from "@langchain/openai";
import { ModelProviderEmbeddingsParameters, OllamaEmbeddingsParams } from "../genaitypes";
import { ModelProvider } from "../types";
import { GoogleGenerativeAIEmbeddingsParams } from "@langchain/google-genai";


// type ModelProvider = 'ollama' | 'openai' | 'gpt3' | 'gpt2' | 'gpt2-medium' | 'gpt2-large' | 'gpt2-xl' | 'gpt2-turbo' | 'gpt2-turbo-medium' | 'gpt2-turbo-large' | 'gpt2-turbo-xl' | 'gpt2-turbo-3b' | 'gpt2-turbo-11b' | 'gpt2-turbo-3b-merged' | 'gpt2-turbo-11b-merged' | 'gpt2-turbo-3b-merged-merged' | 'gpt2-turbo-11b-merged-merged' | 'gpt2-turbo-3b-merged-merged-merged' | 'gpt2-turbo-11b-merged-merged-merged' | 'gpt2-turbo-3b-merged-

//type ModelProviderSettings = 
/**
 * Defines the supported properties of a model provider, e.g. Ollama, etc.
 */
export class ProviderConfigurationDto {
    constructor(
        public readonly modelProvider: ModelProvider,
        /**
         * Supported models for the povider. Note that model name needs to be passed as parameter to the constructor of the LLM model. 
         * This list allows to narrow the selection of models for the user.
         */
        public readonly llmModelNames: string[],
        /**
         * Supported embeddings models for the provider. Note that model name needs to be passed as parameter to the constructor of the embedding model.
         * This list allows to narrow the selection of models for the user.
         */
        public readonly embeddingsModelNames: string[],

        /**
         * Additional parameters that will be passed to the constructor of the LLM model. Note that baseURl is one of them.
         * Base URL for the model provider, for example, http://localhost:11434 for Ollama or a proxy url for OpenAI
         * Required for Ollama, OpenAI doesn't need this parameter if it is not behind a proxy.
         * See [ChatOpenAICallOptions](https://github.com/langchain-ai/langchainjs/blob/main/libs/langchain-openai/src/chat_models.ts#L389), <br/>
         * [GoogleGenerativeAIChatInput](https://github.com/langchain-ai/langchainjs/blob/main/libs/langchain-google-genai/src/chat_models.ts#L81) and
         * [ChatOllamaInput](https://github.com/langchain-ai/langchainjs/blob/main/libs/langchain-ollama/src/chat_models.ts#L59)
         */
        public readonly llmModelParams: {} | null,

        /**
         * Additional parameters that will be passed to the constructor of the embedding model. Note that baseURl is one of them.
         * Base URL for the model provider, for example, http://localhost:11434 for Ollama or a proxy url for OpenAI
         * Required for Ollama, OpenAI doesn't need this parameter if it is not behind a proxy.
         * See [OllamaEmbeddingsParams](https://github.com/langchain-ai/langchainjs/blob/main/libs/langchain-ollama/src/embeddings.ts#L10), <br/> 
         * [OpenAIEmbeddingsParams](https://github.com/langchain-ai/langchainjs/blob/main/libs/langchain-openai/src/embeddings.ts#L17) and <br/>
         * [GoogleGenerativeAIEmbeddingsParams](https://github.com/langchain-ai/langchainjs/blob/main/libs/langchain-google-genai/src/embeddings.ts#L11) for more details
         */
        public readonly embeddingModelParams: ModelProviderEmbeddingsParameters
    ) {
    }
}