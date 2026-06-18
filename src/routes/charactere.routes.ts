import { Router } from 'express'
import { makeCreateCharacterController } from '../controllers/Character/factories/make-create-charactere.controller'
import { makeFetchCharacterController } from '../controllers/Character/factories/make-fetch-caractere.controller'
import { makeGetCharacterController } from '../controllers/Character/factories/make-get-character.controller'
import { makeAcquireCharacterController } from '../controllers/Character/factories/make-acquire-character.controller'
import { makeAssignTraitController } from '../controllers/Character/factories/make-assign-trait.controller'
import { makeGainXpController } from '../controllers/Character/factories/make-gain-xp.controller'
import { makeSwapCharacterController } from '../controllers/Character/factories/make-swap-character.controller'
import { authenticate } from '../middlewares/authenticate'

const characterRoutes = Router()
const createCharacterController = makeCreateCharacterController()
const fetchCharacterController = makeFetchCharacterController()
const getCharacterController = makeGetCharacterController()
const acquireCharacterController = makeAcquireCharacterController()
const assignTraitController = makeAssignTraitController()
const gainXpController = makeGainXpController()
const swapCharacterController = makeSwapCharacterController()

characterRoutes.post('/', authenticate, ...createCharacterController.handle)
characterRoutes.get('/', (req, res) => fetchCharacterController.handle(req, res))
characterRoutes.get('/:characterId', (req, res) => getCharacterController.handle(req, res))
characterRoutes.patch('/acquire', authenticate, ...acquireCharacterController.handle)
characterRoutes.patch('/assign-trait', authenticate, ...assignTraitController.handle)
characterRoutes.patch('/gain-xp', ...gainXpController.handle)
characterRoutes.patch('/swap', authenticate, ...swapCharacterController.handle)

export { characterRoutes }
