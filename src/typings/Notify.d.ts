import { Document } from 'mongoose'

export interface INotify {
    id: string
    user: string
    recipients: string[]
    url: string
    text: string
    content: string
    image: string
    isRead: boolean
}

export interface INotifyModel extends INotify, Document {}
