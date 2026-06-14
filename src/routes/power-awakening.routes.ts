import { Router } from 'express'
import { makePowerAwakeningController } from '../controllers/Power-Awakening/factories/make-create-power-awakening.controller'
import { authenticate } from '../middlewares/authenticate'

const powerAwakeningRoutes = Router()
const createPowerAwakeningController = makePowerAwakeningController()

powerAwakeningRoutes.post('/', authenticate, ...createPowerAwakeningController.handle)

export { powerAwakeningRoutes }
