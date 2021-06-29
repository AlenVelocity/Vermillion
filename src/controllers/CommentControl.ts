/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import CommentsModel from '../Models/CommentModel'
import PostsModel from '../Models/PostModel'

class CommentControl {
    createComment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { postId, content, tag, reply, postUserId } = req.body

            const post = await PostsModel.findById(postId)
            if (!post) return void void res.status(400).json({ msg: 'This post does not exist.' })

            if (reply) {
                const cm = await CommentsModel.findById(reply)
                if (!cm) return void void res.status(400).json({ msg: 'This comment does not exist.' })
            }

            const newComment = new CommentsModel({
                user: (req as any).user._id,
                content,
                tag,
                reply,
                postUserId,
                postId
            })

            await PostsModel.findOneAndUpdate(
                { _id: postId },
                {
                    $push: { CommentsModel: newComment._id }
                },
                { new: true }
            )

            await newComment.save()

            res.json({ newComment })
        } catch (err) {
            return void void res.status(500).json({ msg: (err as Error).message })
        }
    }
    updateComment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { content } = req.body

            await CommentsModel.findOneAndUpdate(
                {
                    _id: req.params.id,
                    user: (req as any).user._id
                },
                { content }
            )

            res.json({ msg: 'Update Success!' })
        } catch (err) {
            return void void res.status(500).json({ msg: (err as Error).message })
        }
    }
    likeComment = async (req: Request, res: Response): Promise<void> => {
        try {
            const comment = await CommentsModel.find({ _id: req.params.id, likes: (req as any).user._id })
            if (comment.length > 0) return void void res.status(400).json({ msg: 'You liked this post.' })

            await CommentsModel.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $push: { likes: (req as any).user._id }
                },
                { new: true }
            )

            res.json({ msg: 'Liked Comment!' })
        } catch (err) {
            return void void res.status(500).json({ msg: (err as Error).message })
        }
    }
    unLikeComment = async (req: Request, res: Response): Promise<void> => {
        try {
            await CommentsModel.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $pull: { likes: (req as any).user._id }
                },
                { new: true }
            )

            res.json({ msg: 'UnLiked Comment!' })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    deleteComment = async (req: Request, res: Response): Promise<void> => {
        try {
            const comment = await CommentsModel.findOneAndDelete({
                _id: req.params.id,
                $or: [{ user: (req as any).user._id }, { postUserId: (req as any).user._id }]
            })

            await PostsModel.findOneAndUpdate(
                { _id: comment?.postId || '' },
                {
                    $pull: { CommentsModel: req.params.id }
                }
            )

            res.json({ msg: 'Deleted Comment!' })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
}

export default CommentControl
