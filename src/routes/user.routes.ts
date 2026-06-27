import { Router } from 'express'
import { makeCreateUserController } from '../controllers/User/factories/make-create-user.controller'
import { makeGetUserController } from '../controllers/User/factories/make-get-user.controller'
import { makeAutenticateUserController } from '../controllers/User/factories/make-authenticate.controller'
import { authenticate } from '../middlewares/authenticate'
import { makeEditUserController } from '../controllers/User/factories/make-edit-user.controller'
import { makeRemoveUserController } from '../controllers/User/factories/make-remove-user.controller'

const userRoutes = Router()
const createUserController = makeCreateUserController()
const getUserController = makeGetUserController()
const editUserController = makeEditUserController()
const removeUserController = makeRemoveUserController()
const authenticateUserController = makeAutenticateUserController()

userRoutes.post('/', ...createUserController.handle)
userRoutes.post('/authenticate', ...authenticateUserController.handle)
userRoutes.get('/me', authenticate, (req, res) =>
  getUserController.handle(req, res)
)
userRoutes.put('/update', authenticate, ...editUserController.handle)
userRoutes.delete('/remove', authenticate, ...removeUserController.handle)

export { userRoutes }
