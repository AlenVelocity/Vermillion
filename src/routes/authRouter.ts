import { Router } from 'express'
import AuthControl from '../controllers/AuthControl'

const router = Router()
const authCtrl = new AuthControl()

router.post('/register', authCtrl.register)

router.post('/login', authCtrl.login)

router.post('/logout', authCtrl.logout)

router.post('/refresh_token', authCtrl.generateAccessToken)

export default router
