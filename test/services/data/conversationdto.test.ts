import { ConversationDto, ConversationState } from '../../../src/services/data/conversationdto';

describe('ConversationDto', () => {
    it('should create an instance with the correct properties', () => {
        const conversationId = '12345';
        const userId = 'user1';
        const boundary = 'boundary1';
        const providerName = 'provider1';
        const conversationState: ConversationState = 'active';
        const created = new Date();
        const updated = new Date();

        const conversationDto = new ConversationDto(
            conversationId,
            userId,
            boundary,
            providerName,
            conversationState,
            created,
            updated
        );

        expect(conversationDto.conversationId).toBe(conversationId);
        expect(conversationDto.userId).toBe(userId);
        expect(conversationDto.boundary).toBe(boundary);
        expect(conversationDto.providerName).toBe(providerName);
        expect(conversationDto.conversationState).toBe(conversationState);
        expect(conversationDto.created).toBe(created);
        expect(conversationDto.updated).toBe(updated);
    });
});