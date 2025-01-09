import * as express from 'express';
import { DELETE, GET, POST, PUT, route } from "awilix-express";
import { ConversationService } from '../services/conversation.service';

@route('/conversations')
export class ConversationController {
    constructor(private conversationService: ConversationService) {}
    
    /**
     * Get last 10 conversations for the user. The method returns a list of conversations.
     * @param query 
     * @returns 
     */
    @GET()
    async getConversations(req: express.Request, res: express.Response) {
        return this.conversationService.getConversations();
    }
    
    /**
     * Create a new conversation. The method returns an ID of the created conversation.
     * @param body 
     * @returns 
     */
    @POST()
    async createConversation(@Body() body: CreateConversationBody) {
        return this.conversationService.createConversation(body);
    }
}