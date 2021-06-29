/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'

import UserModel from '../Models/UserModel'

class UserControl {
    searchUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const users = await UserModel.find({ username: { $regex: req.query.username as string } })
                .limit(10)
                .select('fullname username avatar')

            res.json({ users })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    getUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await UserModel.findById(req.params.id)
                .select('-password')
                .populate('followers following', '-password')
            if (!user) return void res.status(400).json({ msg: 'User does not exist.' })

            res.json({ user })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { avatar, fullname, mobile, address, story, website, gender } = req.body
            if (!fullname) return void res.status(400).json({ msg: 'Please add your full name.' })

            await UserModel.findOneAndUpdate(
                { _id: (req as any).user._id },
                {
                    avatar,
                    fullname,
                    mobile,
                    address,
                    story,
                    website,
                    gender
                }
            )

            res.json({ msg: 'Update Success!' })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    follow = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await UserModel.find({ _id: req.params.id, followers: (req as any).user._id })
            if (user.length > 0) return void res.status(500).json({ msg: 'You followed this user.' })

            const newUser = await UserModel.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $push: { followers: (req as any).user._id }
                },
                { new: true }
            ).populate('followers following', '-password')

            await UserModel.findOneAndUpdate(
                { _id: (req as any).user._id },
                {
                    $push: { following: req.params.id }
                },
                { new: true }
            )

            res.json({ newUser })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    unfollow = async (req: Request, res: Response): Promise<void> => {
        try {
            const newUser = await UserModel.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $pull: { followers: (req as any).user._id }
                },
                { new: true }
            ).populate('followers following', '-password')

            await UserModel.findOneAndUpdate(
                { _id: (req as any).user._id },
                {
                    $pull: { following: req.params.id }
                },
                { new: true }
            )

            res.json({ newUser })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    suggestionsUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const newArr = [...(req as any).user.following, (req as any).user._id]

            const num = req.query.num || 10

            const users = await UserModel.aggregate([
                { $match: { _id: { $nin: newArr } } },
                { $sample: { size: Number(num) } },
                { $lookup: { from: 'users', localField: 'followers', foreignField: '_id', as: 'followers' } },
                { $lookup: { from: 'users', localField: 'following', foreignField: '_id', as: 'following' } }
            ]).project('-password')

            return void res.json({
                users,
                result: users.length
            })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
}

export default UserControl
