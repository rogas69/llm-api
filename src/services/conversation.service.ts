import { DBContext } from "../database/dbcontext";
import { ConversationDto } from "./data/conversationdto";
import { ILogger } from "./ILogger";

/**
 * Used to provide sorting criteria for the ConversationService getConversations method.
 * 
 * To use it, call the getConversations method and pass the sort criteria as an argument. like this:
 * ```typescript
 * const sortCriteria: ConversationSortCriteria = { created: -1 };
 * const conversations = await conversationService.getConversations(sortCriteria);
 * ```
 * Note - you can pass multiple parameters, separated by commas, like `{ created: -1, userId: 1 }`.
 */
export type ConversationSortCriteria = {
    [key in keyof ConversationDto]?: 1 | -1;
};

/**
 * This class is used to manage the lifetime of conversation objects.
 */
export class ConversationService {

    constructor(
        private readonly logger: ILogger,
        private readonly dbContext: DBContext) { }

    /**
     * Get last 10 conversations for the user. The method returns a list of conversations.
     * @param limit - numer of conversations to return, default is 10
     * @param sortCriteria - sorting criteria, default is by created date descending 
     * @returns A list of ConversationDto objects
     */
    async getConversations(limit: number = 10, sortCriteria: ConversationSortCriteria = { created: -1 }): Promise<ConversationDto[]> {
        this.logger.log('getConversations called');
        return await this.dbContext
            .connectDatabase()
            .then(async db => {
                const conversations = await db.collection<ConversationDto>('conversations')
                    .find()
                    .sort(sortCriteria)
                    .limit(10)
                    .toArray();
                return conversations;
            }
}