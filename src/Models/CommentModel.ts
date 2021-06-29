import mongoose from 'mongoose'
import { ICommentModel } from '../typings/Comment'

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        tag: Object,
        reply: mongoose.Types.ObjectId,
        likes: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
        user: { type: mongoose.Types.ObjectId, ref: 'user' },
        postId: mongoose.Types.ObjectId,
        postUserId: mongoose.Types.ObjectId
    },
    {
        timestamps: true
    }
)

export default mongoose.model<ICommentModel>('comment', commentSchema)
