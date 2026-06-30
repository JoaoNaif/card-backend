import { Router } from 'express'
import { makeCreateCharacterController } from '../controllers/Character/factories/make-create-charactere.controller'
import { makeFetchCharacterController } from '../controllers/Character/factories/make-fetch-caractere.controller'
import { makeGetCharacterController } from '../controllers/Character/factories/make-get-character.controller'
import { makeAcquireCharacterController } from '../controllers/Character/factories/make-acquire-character.controller'
import { makeAssignTraitController } from '../controllers/Character/factories/make-assign-trait.controller'
import { makeGainXpController } from '../controllers/Character/factories/make-gain-xp.controller'
import { makeSwapCharacterController } from '../controllers/Character/factories/make-swap-character.controller'
import { authenticate } from '../middlewares/authenticate'
import { makeFetchCharacterRosterUserController } from '../controllers/Character/factories/make-fetch-character-roster-user.controller'
import { makeEditCharacterController } from '../controllers/Character/factories/make-edit-character.controller'
import { makeRemoveCharacterController } from '../controllers/Character/factories/make-remove-character.controller'

const characterRoutes = Router()
const createCharacterController = makeCreateCharacterController()
const fetchCharacterController = makeFetchCharacterController()
const getCharacterController = makeGetCharacterController()
const acquireCharacterController = makeAcquireCharacterController()
const assignTraitController = makeAssignTraitController()
const editCharacterController = makeEditCharacterController()
const gainXpController = makeGainXpController()
const swapCharacterController = makeSwapCharacterController()
const removeCharacterController = makeRemoveCharacterController()
const fetchCharacterRosterUserController =
  makeFetchCharacterRosterUserController()

characterRoutes.post('/', authenticate, ...createCharacterController.handle)
characterRoutes.get('/', (req, res) =>
  fetchCharacterController.handle(req, res)
)
characterRoutes.get(
  '/roster-user',
  authenticate,
  ...fetchCharacterRosterUserController.handle
)
characterRoutes.get('/:characterId', (req, res) =>
  getCharacterController.handle(req, res)
)
characterRoutes.patch(
  '/acquire',
  authenticate,
  ...acquireCharacterController.handle
)
characterRoutes.patch(
  '/assign-trait',
  authenticate,
  ...assignTraitController.handle
)
characterRoutes.patch('/gain-xp', ...gainXpController.handle)
characterRoutes.patch('/swap', authenticate, ...swapCharacterController.handle)
characterRoutes.put('/update', authenticate, ...editCharacterController.handle)
characterRoutes.delete(
  '/remove',
  authenticate,
  ...removeCharacterController.handle
)

export { characterRoutes }
