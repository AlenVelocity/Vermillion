/* eslint-disable @typescript-eslint/no-explicit-any */
import ConversationsModel from '../Models/ConversationModel'
import MessagesModel from '../Models/MessageModel'
import { Request, Response } from 'express'
import APIfeatures from './APIFeatures'


class messageCtrl {
    createMessage = async (req: Request, res: Response): Promise<void>  => {
        try {
            const { sender, recipient, text, media, call } = req.body

            if(!recipient || (!text.trim() && media.length === 0 && !call)) return;

            const newConversation = await ConversationsModel.findOneAndUpdate({
                $or: [
                    {recipients: [sender, recipient]},
                    {recipients: [recipient, sender]}
                ]
            }, {
                recipients: [sender, recipient],
                text, media, call
            }, { new: true, upsert: true })

            const newMessage = new MessagesModel({
                conversation: newConversation._id,
                sender, call,
                recipient, text, media
            })

            await newMessage.save()

            res.json({msg: 'Create Success!'})

        } catch (err) {
            return void res.status(500).json({msg: (err as Error).message})
        }
    }
    getConversations= async (req: Request, res: Response): Promise<void>  => {
        try {
            const features = new APIfeatures(ConversationsModel.find({
                recipients: (req as any)._id
            }), req.query).paginating()

            const conversations = await features.query.sort('-updatedAt')
            .populate('recipients', 'avatar username fullname')

            res.json({
                conversations,
                result: conversations.length
            })

        } catch (err) {
            return void res.status(500).json({msg: (err as Error).message})
        }
    }
    getMessages= async (req: Request, res: Response): Promise<void> => {
        try {
            const features = new APIfeatures(MessagesModel.find({
                $or: [
                    {sender: (req as any)._id, recipient: req.params.id},
                    {sender: req.params.id, recipient: (req as any)._id}
                ]
            }), req.query).paginating()

            const messages = await features.query.sort('-createdAt')

            res.json({
                messages,
                result: messages.length
            })

        } catch (err) {
            return void res.status(500).json({msg: (err as Error).message})
        }
    }
    deleteMessages= async (req: Request, res: Response): Promise<void> => {
        try {
            await MessagesModel.findOneAndDelete({_id: req.params.id, sender: (req as any)._id})
            res.json({msg: 'Delete Success!'})
        } catch (err) {
            return void res.status(500).json({msg: (err as Error).message})
        }
    }
    deleteConversation= async (req: Request, res: Response): Promise<void> => {
        try {
            const newConver = await ConversationsModel.findOneAndDelete({
                $or: [
                    {recipients: [(req as any)._id, req.params.id]},
                    {recipients: [req.params.id, (req as any)._id]}
                ]
            })
            await MessagesModel.deleteMany({conversation: newConver._id})
            
            res.json({msg: 'Delete Success!'})
        } catch (err) {
            return void res.status(500).json({msg: (err as Error).message})
        }
    }
}


module.exports = messageCtrl