import { Document } from 'mongoose'

export interface IComment {
    content: Content
    tag: Tag
    reply: string
    likes: string[]
    user: User
    postId: string
    postUserId: string
}

export interface ICommentModel extends IComment, Document {}
