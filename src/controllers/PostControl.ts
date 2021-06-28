/* eslint-disable @typescript-eslint/no-explicit-any */
import PostsModel from '../Models/PostModel'
import CommentModel from '../Models/CommentModel'
import UserModel from '../Models/UserModel'
import { Request, Response } from 'express'

class APIfeatures {
    constructor(public query: any, public queryString: Request['query']) {}

    paginating() {
        const page = ((this?.queryString?.page as unknown as number) || 1) * 1 || 1
        const limit = ((this?.queryString?.limit as unknown as number) || 1) * 1 || 9
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this
    }
}

class PostControl {
    createPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const { content, images } = req.body

            if (images.length === 0) return void res.status(400).json({ msg: 'Please add your photo.' })

            const newPost = new PostsModel({
                content,
                images,
                user: (req as any).user._id
            })
            await newPost.save()

            res.json({
                msg: 'Created Post!',
                newPost: {
                    ...newPost._doc,
                    user: (req as any).user
                }
            })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    getPosts = async (req: Request, res: Response): Promise<void> => {
        try {
            const features = new APIfeatures(
                PostsModel.find({
                    user: [...(req as any).user.following, (req as any).user._id]
                }),
                req.query
            ).paginating()

            const posts = await features.query
                .sort('-createdAt')
                .populate('user likes', 'avatar username fullname followers')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user likes',
                        select: '-password'
                    }
                })

            res.json({
                msg: 'Success!',
                result: posts.length,
                posts
            })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    updatePost = async (req: Request, res: Response): Promise<void> => {
        try {
            const { content, images } = req.body

            const post = await PostsModel.findOneAndUpdate(
                { _id: req.params.id },
                {
                    content,
                    images
                }
            )
                .populate('user likes', 'avatar username fullname')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user likes',
                        select: '-password'
                    }
                })

            res.json({
                msg: 'Updated Post!',
                newPost: {
                    ...post._doc,
                    content,
                    images
                }
            })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    likePost = async (req: Request, res: Response): Promise<void> => {
        try {
            const post = await PostsModel.find({ _id: req.params.id, likes: (req as any).user._id })
            if (post.length > 0) return void res.status(400).json({ msg: 'You liked this post.' })

            const like = await PostsModel.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $push: { likes: (req as any).user._id }
                },
                { new: true }
            )

            if (!like) return void res.status(400).json({ msg: 'This post does not exist.' })

            res.json({ msg: 'Liked Post!' })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    unLikePost = async (req: Request, res: Response): Promise<void> => {
        try {
            const like = await PostsModel.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $pull: { likes: (req as any).user._id }
                },
                { new: true }
            )

            if (!like) return void res.status(400).json({ msg: 'This post does not exist.' })

            res.json({ msg: 'UnLiked Post!' })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    getUserPosts = async (req: Request, res: Response): Promise<void> => {
        try {
            const features = new APIfeatures(PostsModel.find({ user: req.params.id }), req.query).paginating()
            const posts = await features.query.sort('-createdAt')

            res.json({
                posts,
                result: posts.length
            })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    getPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const post = await PostsModel.findById(req.params.id)
                .populate('user likes', 'avatar username fullname followers')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user likes',
                        select: '-password'
                    }
                })

            if (!post) return void res.status(400).json({ msg: 'This post does not exist.' })

            res.json({
                post
            })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    getPostsDicover = async (req: Request, res: Response): Promise<void> => {
        try {
            const newArr = [...(req as any).user.following, (req as any).user._id]

            const num = req.query.num || 9

            const posts = await PostsModel.aggregate([
                { $match: { user: { $nin: newArr } } },
                { $sample: { size: Number(num) } }
            ])

            return void res.json({
                msg: 'Success!',
                result: posts.length,
                posts
            })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    deletePost = async (req: Request, res: Response): Promise<void> => {
        try {
            const post = await PostsModel.findOneAndDelete({ _id: req.params.id, user: (req as any).user._id })
            await CommentModel.deleteMany({ _id: { $in: post.comments } })

            res.json({
                msg: 'Deleted Post!',
                newPost: {
                    ...post,
                    user: (req as any).user
                }
            })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    savePost = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await UserModel.find({ _id: (req as any).user._id, saved: req.params.id })
            if (user.length > 0) return void res.status(400).json({ msg: 'You saved this post.' })

            const save = await UserModel.findOneAndUpdate(
                { _id: (req as any).user._id },
                {
                    $push: { saved: req.params.id }
                },
                { new: true }
            )

            if (!save) return void res.status(400).json({ msg: 'This user does not exist.' })

            res.json({ msg: 'Saved Post!' })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    unSavePost = async (req: Request, res: Response): Promise<void> => {
        try {
            const save = await UserModel.findOneAndUpdate(
                { _id: (req as any).user._id },
                {
                    $pull: { saved: req.params.id }
                },
                { new: true }
            )

            if (!save) return void res.status(400).json({ msg: 'This user does not exist.' })

            res.json({ msg: 'unSaved Post!' })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    getSavePosts = async (req: Request, res: Response): Promise<void> => {
        try {
            const features = new APIfeatures(
                PostsModel.find({
                    _id: { $in: (req as any).user.saved }
                }),
                req.query
            ).paginating()

            const savePosts = await features.query.sort('-createdAt')

            res.json({
                savePosts,
                result: savePosts.length
            })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
}

export default PostControl
