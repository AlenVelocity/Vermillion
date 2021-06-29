import UserModel from '../Models/UserModel'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'

class AuthControl {
    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { fullname, username, email, password, gender } = req.body
            const newUserName = username.toLowerCase().replace(/ /g, '')

            const user_name = await UserModel.findOne({ username: newUserName })
            if (user_name) return void res.status(400).json({ msg: 'This username already exists.' })

            const user_email = await UserModel.findOne({ email })
            if (user_email) return void res.status(400).json({ msg: 'This email already exists.' })

            if (password.length < 6)
                return void res.status(400).json({ msg: 'Password must be at least 6 characters.' })

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = new UserModel({
                fullname,
                username: newUserName,
                email,
                password: passwordHash,
                gender
            })

            const access_token = createAccessToken({ id: newUser._id as string })
            const refresh_token = createRefreshToken({ id: newUser._id as string })

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
            })

            await newUser.save()

            res.json({
                msg: 'Register Success!',
                access_token,
                user: {
                    ...newUser._doc,
                    password: ''
                }
            })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body

            const user = await UserModel.findOne({ email }).populate(
                'followers following',
                'avatar username fullname followers following'
            )

            if (!user) return void res.status(400).json({ msg: 'This email does not exist. Please Register' })

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return void res.status(400).json({ msg: 'Password is incorrect.' })

            const access_token = createAccessToken({ id: user._id })
            const refresh_token = createRefreshToken({ id: user._id })

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
            })

            res.json({
                msg: 'Login Success!',
                access_token,
                user: {
                    ...user._doc,
                    password: ''
                }
            })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            res.clearCookie('refreshtoken', { path: '/api/refresh_token' })
            return void res.json({ msg: 'Logged out!' })
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
    generateAccessToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const rf_token = req.cookies.refreshtoken
            if (!rf_token) return void res.status(400).json({ msg: 'Please login now.' })

            jwt.verify(
                rf_token,
                process.env.REFRESH_TOKEN_SECRET as string,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                async (err: Error, result: { id: string }) => {
                    if (err) return void res.status(400).json({ msg: 'Please login now.' })

                    const user = await UserModel.findById(result.id)
                        .select('-password')
                        .populate('followers following', 'avatar username fullname followers following')

                    if (!user) return void res.status(400).json({ msg: 'This does not exist.' })

                    const access_token = createAccessToken({ id: result.id })

                    res.json({
                        access_token,
                        user
                    })
                }
            )
        } catch (err) {
            return void res.status(500).json({ msg: (err as Error).message })
        }
    }
}

const createAccessToken = (payload: { id: string }) =>
    jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1d' })

const createRefreshToken = (payload: { id: string }) =>
    jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '30d' })

export default AuthControl
