import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
    {
        conversation: { type: mongoose.Types.ObjectId, ref: 'conversation' },
        sender: { type: mongoose.Types.ObjectId, ref: 'user' },
        recipient: { type: mongoose.Types.ObjectId, ref: 'user' },
        text: String,
        media: Array,
        call: Object
    },
    {
        timestamps: true
    }
)

export default mongoose.model('message', messageSchema)
