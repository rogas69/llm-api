import { BoundaryConfigurationDto } from '../../../src/services/data/boundaryconfigurationdto';
import { ModelProvider } from '../../../src/services/types';

describe('BoundaryConfigurationDto Tests', () => {
    it('should create a BoundaryConfigurationDto instance with valid data', () => {
        const boundaryName = 'Test Boundary';
        const modelProvider = 'Ollama' as ModelProvider;
        const llmModelName = 'Test LLM Model';
        const embeddingsModelName = 'Test Embeddings Model';
        const comments = 'Test Comments';

        const boundaryConfigurationDto = new BoundaryConfigurationDto(
            boundaryName,
            modelProvider,
            llmModelName,
            embeddingsModelName,
            comments
        );

        expect(boundaryConfigurationDto).toBeInstanceOf(BoundaryConfigurationDto);
        expect(boundaryConfigurationDto.boundaryName).toBe(boundaryName);
        expect(boundaryConfigurationDto.modelProvider).toBe(modelProvider);
        expect(boundaryConfigurationDto.llmModelName).toBe(llmModelName);
        expect(boundaryConfigurationDto.embeddingsModelName).toBe(embeddingsModelName);
        expect(boundaryConfigurationDto.comments).toBe(comments);
    });


    it('should set comments to null by default', () => {
        const boundaryName = 'Test Boundary';
        const modelProvider = 'Ollama' as ModelProvider;
        const llmModelName = 'Test LLM Model';
        const embeddingsModelName = 'Test Embeddings Model';

        const boundaryConfigurationDto = new BoundaryConfigurationDto(
            boundaryName,
            modelProvider,
            llmModelName,
            embeddingsModelName
        );

        expect(boundaryConfigurationDto.comments).toBeNull();
    });

});