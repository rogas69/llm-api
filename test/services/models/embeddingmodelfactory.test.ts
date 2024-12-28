import { EmbeddingModelFactory, EmbeddingModelEnum } from '../../../src/services/models/embeddingmodelfactory';
import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OllamaEmbeddings } from "@langchain/ollama";

describe('EmbeddingModelFactory Tests', () => {
    it('should return an instance of OpenAIEmbeddings for OpenAI model', async () => {
        if(!process.env.OPENAI_API_KEY)
            return;
        const model = await EmbeddingModelFactory.getEmbeddingModel(EmbeddingModelEnum.OpenAI);
        expect(model).toBeInstanceOf(OpenAIEmbeddings);
    });

    it('should return an instance of GoogleGenerativeAIEmbeddings for GoogleAI model', async () => {
        if(!process.env.GOOGLE_API_KEY)
            return;
        const model = await EmbeddingModelFactory.getEmbeddingModel(EmbeddingModelEnum.GoogleAI);
        expect(model).toBeInstanceOf(GoogleGenerativeAIEmbeddings);
    });

    it('should return an instance of OllamaEmbeddings for Ollama model', async () => {
        const model = await EmbeddingModelFactory.getEmbeddingModel(EmbeddingModelEnum.Ollama);
        expect(model).toBeInstanceOf(OllamaEmbeddings);
    });
});