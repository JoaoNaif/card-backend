import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { makeCreateBattleFieldController } from '../controllers/Battle-Field/factories/make-create-battle-field.controller'
import { makeFetchBattleFieldController } from '../controllers/Battle-Field/factories/make-fetch-battle-field.controller'
import { makeEditBattleFieldController } from '../controllers/Battle-Field/factories/make-edit-battle-field.controller'
import { makeRemoveBattleFieldController } from '../controllers/Battle-Field/factories/make-remove-battle-field.controller'

const battleFieldRoutes = Router()
const createBattleFieldontroller = makeCreateBattleFieldController()
const fetchBattleFieldontroller = makeFetchBattleFieldController()
const editBattleFieldontroller = makeEditBattleFieldController()
const removeBattleFieldontroller = makeRemoveBattleFieldController()

battleFieldRoutes.post('/', authenticate, ...createBattleFieldontroller.handle)
battleFieldRoutes.delete(
  '/remove',
  authenticate,
  ...removeBattleFieldontroller.handle
)
battleFieldRoutes.put(
  '/update',
  authenticate,
  ...editBattleFieldontroller.handle
)

battleFieldRoutes.get('/', (req, res) =>
  fetchBattleFieldontroller.handle(req, res)
)

export { battleFieldRoutes }
