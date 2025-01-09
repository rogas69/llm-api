export type ConversationState = 'active' | 'complete' | 'deleted';
/**
 * Used to transfer Converstation data objects between client and the database
 */
export class ConversationDto {
    constructor(
        public readonly conversationId: string,
        public readonly userId: string,
        public readonly boundary: string,
        public readonly providerName: string,
        public readonly conversationState: ConversationState,
        public readonly created: Date,
        public readonly updated: Date
    ){}
}