import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { makeCreateBattleFieldController } from '../controllers/Battle-Field/factories/make-create-battle-field.controller'

const battleFieldRoutes = Router()
const createBattleFieldontroller = makeCreateBattleFieldController()

battleFieldRoutes.post('/', authenticate, ...createBattleFieldontroller.handle)

export { battleFieldRoutes }
