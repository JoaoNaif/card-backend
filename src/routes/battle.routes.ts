import { Router } from 'express'
import { makeRunAutoBattleController } from '../controllers/Battle/factories/make-run-auto-battle.controller'
import { makeGetMachineTeamController } from '../controllers/Battle/factories/make-get-machine-team.controller'
import { makeCreateMachineController } from '../controllers/Battle/factories/make-create-machine.controller'
import { makeFetchMachinesController } from '../controllers/Battle/factories/make-fetch-machines.controller'
import { makeListBattleHistoryController } from '../controllers/Battle/factories/make-list-battle-history.controller'
import { makeStartPveBattleController } from '../controllers/Battle/factories/make-start-pve-battle.controller'
import { makeSubmitPveActionController } from '../controllers/Battle/factories/make-submit-pve-action.controller'
import { authenticate } from '../middlewares/authenticate'

const battleRoutes = Router()
const runAutoBattleController = makeRunAutoBattleController()
const getMachineTeamController = makeGetMachineTeamController()
const createMachineController = makeCreateMachineController()
const fetchMachinesController = makeFetchMachinesController()
const listBattleHistoryController = makeListBattleHistoryController()
const startPveBattleController = makeStartPveBattleController()
const submitPveActionController = makeSubmitPveActionController()

battleRoutes.post('/auto', ...runAutoBattleController.handle)
battleRoutes.post('/pve', authenticate, ...startPveBattleController.handle)
battleRoutes.post(
  '/pve/:battleId/turn',
  authenticate,
  ...submitPveActionController.handle
)
battleRoutes.get('/history', authenticate, (req, res) =>
  listBattleHistoryController.handle(req, res)
)
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
