import { ModelProvider } from "../types";


export class BoundaryConfigurationDto {
    constructor(

        /**
         * The name of the (user separation) boundary. Must be one of the existing boundaries in the system. See also BoundaryDto
         */
        public readonly boundaryName: string,

        /**
         * The name of the model provider that will be used to provide the models for this boundary. 
         */
        public readonly modelProvider: ModelProvider,

        /**
         * The name of the llm model that will be used to provide the models for this boundary.
         */
        public readonly llmModelName: string,

        /**
         * The name of the embeddings model that will be used to provide the models for this boundary. 
         * The model provider will be the same for llm and embeddings models.
         */
        public readonly embeddingsModelName: string,

        /**
         * Any additional comments that the user may want to add to the configuration
         */
        public readonly comments: string | null = null
    ) { }
}
