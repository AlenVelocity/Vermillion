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
    followers: string[]
    following: string[]
    saved: string[]
}

export interface IUserModel extends IUser, Document {}
