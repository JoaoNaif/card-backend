import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { makeCreateBattleFieldController } from '../controllers/Battle-Field/factories/make-create-battle-field.controller'
import { makeFetchBattleFieldController } from '../controllers/Battle-Field/factories/make-fetch-battle-field.controller'

const battleFieldRoutes = Router()
const createBattleFieldontroller = makeCreateBattleFieldController()
const fetchBattleFieldontroller = makeFetchBattleFieldController()

battleFieldRoutes.post('/', authenticate, ...createBattleFieldontroller.handle)

battleFieldRoutes.get('/', (req, res) =>
  fetchBattleFieldontroller.handle(req, res)
)

export { battleFieldRoutes }
