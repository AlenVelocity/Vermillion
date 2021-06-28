import { Request, Response, NextFunction } from 'express'
import UserModel from '../Models/UserModel'
import jwt from 'jsonwebtoken'

const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header('Authorization')
        if (!token) return void res.status(400).json({ msg: 'Invalid Authentication.' })
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if (!decoded) return void res.status(400).json({ msg: 'Invalid Authentication.' })
        const user = await UserModel.findOne({ _id: decoded.id })
        ;(req as unknown as { user }).user = user
        next()
    } catch (err) {
        return void res.status(500).json({ msg: (err as Error).message })
    }
}

export default auth
