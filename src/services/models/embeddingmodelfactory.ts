import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OllamaEmbeddings } from "@langchain/ollama";
import { EmbeddingsInterface } from "@langchain/core/embeddings";
import { ModelProvider } from "../types";



/**
 * Used to create an instance of the Embeddings class based on the model type
 */
class EmbeddingModelFactory {
    private static modelMap: Record<ModelProvider, new () => EmbeddingsInterface> = {
        ["OpenAI"]: OpenAIEmbeddings,
        ["GoogleAI"]: GoogleGenerativeAIEmbeddings,
        ["Ollama"]: OllamaEmbeddings,
    };

    public static async getEmbeddingModel(modelProvider: ModelProvider): Promise<EmbeddingsInterface> {
        const ModelClass = this.modelMap[modelProvider];
        return new ModelClass();
    }
}

export {EmbeddingModelFactory };