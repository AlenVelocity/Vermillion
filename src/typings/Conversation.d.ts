import { Document } from 'mongoose'

export interface IConversation {
    recipients: string[]
    text: string
    media: media[]
    call: Call
}

export interface IConversationModel extends IConversation, Document {}
