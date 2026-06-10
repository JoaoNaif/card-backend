import { Router } from 'express'
import { makeCreateCharacterController } from '../controllers/Character/factories/make-create-charactere.controller'
import { makeFetchCharacterController } from '../controllers/Character/factories/make-fetch-caractere.controller'
import { authenticate } from '../middlewares/authenticate'
import { makeAcquireCharacterController } from '../controllers/Character/factories/make-acquire-character.controller'
import { makeSwapCharacterController } from '../controllers/Character/factories/make-swap-character.controller'

const characterRoutes = Router()
const createCharacterController = makeCreateCharacterController()
const fetchCharacterController = makeFetchCharacterController()
const acquireCharacterController = makeAcquireCharacterController()
const swapCharacterController = makeSwapCharacterController()

characterRoutes.post('/', authenticate, ...createCharacterController.handle)
characterRoutes.get('/', (req, res) =>
  fetchCharacterController.handle(req, res)
)
characterRoutes.patch(
  '/acquire',
  authenticate,
  ...acquireCharacterController.handle
)

characterRoutes.patch('/swap', authenticate, ...swapCharacterController.handle)

export { characterRoutes }
