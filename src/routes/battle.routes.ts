import { Router } from 'express'
import { makeCreateBattleController } from '../controllers/Battle/factories/make-create-battle.controller'

const battleRoutes = Router()
const createBattleController = makeCreateBattleController()

battleRoutes.post('/', ...createBattleController.handle)

export { battleRoutes }
