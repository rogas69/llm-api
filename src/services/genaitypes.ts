/*
 * This file contains the types used to create and configure chat and embedding models
 */

import { EmbeddingsParams } from "@langchain/core/embeddings";
import { GoogleGenerativeAIChatInput, GoogleGenerativeAIEmbeddingsParams } from "@langchain/google-genai";
import { ChatOllamaInput } from "@langchain/ollama";
import { ChatOpenAIFields, OpenAIEmbeddingsParams } from "@langchain/openai";

/**
 * This type shadows the interface defined in the @langchainn/ollama package, because the original interface is not exported.
 * Note that OpenAI and GoogleAI packages export corresponding interfaces.
 * When the original interface is exported, this type should be removed.
 * 
 * See [OllamaEmbeddingsParams](https://github.com/langchain-ai/langchainjs/blob/main/libs/langchain-ollama/src/embeddings.ts#L10)
 * 
 * Interface for OllamaEmbeddings parameters. Extends EmbeddingsParams and
 * defines additional parameters specific to the OllamaEmbeddings class.
 */
export interface OllamaEmbeddingsParams extends EmbeddingsParams {
    /**
     * The Ollama model to use for embeddings.
     * @default "mxbai-embed-large"
     */
    model?: string;

    /**
     * Base URL of the Ollama server
     * @default "http://localhost:11434"
     */
    baseUrl?: string;

    /**
     * Defaults to "5m"
     */
    keepAlive?: string | number;

    /**
     * Whether or not to truncate the input text to fit inside the model's
     * context window.
     * @default false
     */
    truncate?: boolean;

    /**
     * Optional HTTP Headers to include in the request.
     */
    headers?: Headers | Record<string, string>;

    /**
     * Advanced Ollama API request parameters in camelCase, see
     * https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values
     * for details of the available parameters.
     * 
     * NOTE: this field is commented to avoid overcomplication of imports or duck typing.
     * Uncomment it if you need to use it and the replacement doesn't work.
     */
    //requestOptions?: OllamaCamelCaseOptions & Partial<OllamaOptions>;
    requestOptions?: {};
}

/**
 * Used to define the type of the embedding model parameters for different providers.
 */
export type EmbeddingModelProviderParameters =
    OllamaEmbeddingsParams
    | OpenAIEmbeddingsParams
    | GoogleGenerativeAIEmbeddingsParams;


/**
 * Used to define the type of the chat model parameters for different providers.
 */
export type ChatModelProviderParameters =
    ChatOpenAIFields
    | GoogleGenerativeAIChatInput
    | ChatOllamaInput;
