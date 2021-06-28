/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import NotifyModel from '../Models/NotifyModel'

class NotifyControl {
    createNotify = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id, recipients, url, text, content, image } = req.body

            if (recipients.includes((req as any).user._id.toString())) return void null

            const notify = new NotifyModel({
                id,
                recipients,
                url,
                text,
                content,
                image,
                user: (req as any).user._id
            })

            await notify.save()
            return void res.json({ notify })
        } catch (err) {
            return void res.status(500).json({ msg: (err as any).message })
        }
    }
    removeNotify = async (req: Request, res: Response): Promise<void> => {
        try {
            const notify = await NotifyModel.findOneAndDelete({
                id: req.params.id,
                url: req.query.url
            })

            return void res.json({ notify })
        } catch (err) {
            return void res.status(500).json({ msg: (err as any).message })
        }
    }
    getNotifies = async (req: Request, res: Response): Promise<void> => {
        try {
            const notifies = await NotifyModel.find({ recipients: (req as any).user._id })
                .sort('-createdAt')
                .populate('user', 'avatar username')

            return void res.json({ notifies })
        } catch (err) {
            return void res.status(500).json({ msg: (err as any).message })
        }
    }
    isReadNotify = async (req: Request, res: Response): Promise<void> => {
        try {
            const notifies = await NotifyModel.findOneAndUpdate(
                { _id: req.params.id },
                {
                    isRead: true
                }
            )

            return void res.json({ notifies })
        } catch (err) {
            return void res.status(500).json({ msg: (err as any).message })
        }
    }
    deleteAllNotifies = async (req: Request, res: Response): Promise<void> => {
        try {
            const notifies = await NotifyModel.deleteMany({ recipients: (req as any).user._id })

            return void res.json({ notifies })
        } catch (err) {
            return void res.status(500).json({ msg: (err as any).message })
        }
    }
}

export default NotifyControl
