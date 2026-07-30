import { Router } from 'express'
import { makeRunAutoBattleController } from '../controllers/Battle/factories/make-run-auto-battle.controller'
import { makeGetMachineTeamController } from '../controllers/Battle/factories/make-get-machine-team.controller'
import { makeCreateMachineController } from '../controllers/Battle/factories/make-create-machine.controller'
import { makeFetchMachinesController } from '../controllers/Battle/factories/make-fetch-machines.controller'
import { authenticate } from '../middlewares/authenticate'

const battleRoutes = Router()
const runAutoBattleController = makeRunAutoBattleController()
const getMachineTeamController = makeGetMachineTeamController()
const createMachineController = makeCreateMachineController()
const fetchMachinesController = makeFetchMachinesController()

battleRoutes.post('/auto', ...runAutoBattleController.handle)
battleRoutes.get('/machines', (req, res) =>
  fetchMachinesController.handle(req, res)
)
battleRoutes.get('/machines/:machineId', (req, res) =>
  getMachineTeamController.handle(req, res)
)
battleRoutes.post(
  '/machines',
  authenticate,
  ...createMachineController.handle
)

export { battleRoutes }
