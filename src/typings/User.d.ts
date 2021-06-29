import { Document } from 'mongoose'

export interface IUser {
    fullname: string
    username: string
    email: string
    password: string
    avatar: string
    role: string
    gender: 'male' | 'female' | 'other'
    mobile: string
    address: string
    story: string
    website: string
    followers: { _id: string }[]
    following: { _id: string }[]
    saved: string[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _doc: any
}

export interface IUserModel extends IUser, Document {}
