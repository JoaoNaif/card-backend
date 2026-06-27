import { Router } from 'express'
import { makeRunAutoBattleController } from '../controllers/Battle/factories/make-run-auto-battle.controller'

const battleRoutes = Router()
const runAutoBattleController = makeRunAutoBattleController()

battleRoutes.post('/auto', ...runAutoBattleController.handle)

export { battleRoutes }
