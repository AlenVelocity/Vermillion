import mongoose from 'mongoose'

const notifySchema = new mongoose.Schema(
    {
        id: mongoose.Types.ObjectId,
        user: { type: mongoose.Types.ObjectId, ref: 'user' },
        recipients: [mongoose.Types.ObjectId],
        url: String,
        text: String,
        content: String,
        image: String,
        isRead: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
)

export default mongoose.model('notify', notifySchema)
