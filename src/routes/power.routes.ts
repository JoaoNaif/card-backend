import { Router } from 'express'
import { makeCreatePowerController } from '../controllers/Power/factories/make-create-power.controller'
import { makeFetchPowerController } from '../controllers/Power/factories/make-fetch-power.controller'
import { authenticate } from '../middlewares/authenticate'
import { makeEditPowerController } from '../controllers/Power/factories/make-edit-power.controller'
import { makeGetPowerNameController } from '../controllers/Power/factories/make-get-power-name.controller'
import { makeRemovePowerController } from '../controllers/Power/factories/make-remove-power.controller'

const powerRoutes = Router()
const createPowerController = makeCreatePowerController()
const editPowerController = makeEditPowerController()
const removePowerController = makeRemovePowerController()
const fetchPowerController = makeFetchPowerController()
const getPowerNameController = makeGetPowerNameController()

powerRoutes.post('/', authenticate, ...createPowerController.handle)
powerRoutes.put('/update', authenticate, ...editPowerController.handle)
powerRoutes.delete('/remove', authenticate, ...removePowerController.handle)
powerRoutes.get('/:name', (req, res) => getPowerNameController.handle(req, res))
powerRoutes.get('/', (req, res) => fetchPowerController.handle(req, res))

export { powerRoutes }
