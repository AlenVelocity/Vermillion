import { IUserModel } from './User'

export interface ISocketUser extends IUserModel {
    socketId: string
    call: string
}
