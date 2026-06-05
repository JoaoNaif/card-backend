import { Router } from 'express'
import { makeCreatePowerController } from '../controllers/Power/factories/make-create-power.controller'
import { makeFetchPowerController } from '../controllers/Power/factories/make-fetch-power.controller'
import { authenticate } from '../middlewares/authenticate'

const powerRoutes = Router()
const createPowerController = makeCreatePowerController()
const fetchPowerController = makeFetchPowerController()

powerRoutes.post('/', authenticate, ...createPowerController.handle)
powerRoutes.get('/', (req, res) => fetchPowerController.handle(req, res))

export { powerRoutes }
