import { Router } from 'express'
import auth from '../middlewares/auth'
import NotifyControl from '../controllers/NotifyControl'

const router = Router()
const notifyCtrl = new NotifyControl()

router.post('/notify', auth, notifyCtrl.createNotify)

router.delete('/notify/:id', auth, notifyCtrl.removeNotify)

router.get('/notifies', auth, notifyCtrl.getNotifies)

router.patch('/isReadNotify/:id', auth, notifyCtrl.isReadNotify)

router.delete('/deleteAllNotify', auth, notifyCtrl.deleteAllNotifies)

export default router
