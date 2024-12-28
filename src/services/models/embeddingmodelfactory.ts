import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OllamaEmbeddings } from "@langchain/ollama";
import { EmbeddingsInterface } from "@langchain/core/embeddings";

/**
 * Used to define the type of the model that the factory will return.
 */
enum EmbeddingModelEnum {
    OpenAI,
    GoogleAI,
    Ollama
}

/**
 * Used to create an instance of the Embeddings class based on the model type
 */
class EmbeddingModelFactory {
    public static async getEmbeddingModel(modelName: EmbeddingModelEnum) : Promise<EmbeddingsInterface> {
        switch (modelName) {
            case EmbeddingModelEnum.OpenAI:
                return new OpenAIEmbeddings();
            case EmbeddingModelEnum.GoogleAI:
                return new GoogleGenerativeAIEmbeddings();
            case EmbeddingModelEnum.Ollama:
                return new OllamaEmbeddings();
        }
    }
}

export { EmbeddingModelEnum, EmbeddingModelFactory };