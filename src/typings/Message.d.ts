import { Document } from 'mongoose'

export interface IMessage {
    conversation: string
    sender: string
    recipient: string
    text: string
    media: Array
    call: string
}

export interface IMessageModel extends IMessage, Document {}
