import { Document } from 'mongoose'

export interface IPost {
    content: string
    images: string[]
    likes: string[]
    comments: string[]
    user: string[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _doc: any
}

export interface IPostModel extends IPost, Document {}
