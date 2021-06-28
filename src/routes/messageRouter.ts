import { Router } from 'express'
import MessageControl from '../controllers/MessageControl'
import auth from '../middlewares/auth'

const router = Router()
const messageCtrl = new MessageControl()
router.post('/message', auth, messageCtrl.createMessage)

router.get('/conversations', auth, messageCtrl.getConversations)

router.get('/message/:id', auth, messageCtrl.getMessages)

router.delete('/message/:id', auth, messageCtrl.deleteMessages)

router.delete('/conversation/:id', auth, messageCtrl.deleteConversation)

export default router
