
/**
 * Defines the types of model providers supported by the application
 */
type ModelProvider = "OpenAI" | "GoogleAI" | "Ollama";


interface GetBoundaryConfigurationsParams {
    boundaryName?: string;
    modelProvider?: string;
}


export { ModelProvider, GetBoundaryConfigurationsParams };