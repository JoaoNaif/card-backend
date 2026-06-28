import { Router } from 'express'
import { makeCreateSkillController } from '../controllers/Skill/factories/make-create-skill.controller'
import { makeFetchSkillController } from '../controllers/Skill/factories/make-fetch-skill.controller'
import { makeGetSkillController } from '../controllers/Skill/factories/make-get-skill.controller'
import { authenticate } from '../middlewares/authenticate'
import { makeGetSkillOptionsController } from '../controllers/Skill/factories/make-get-skill-options.controller'
import { makeSwapSkillController } from '../controllers/Skill/factories/make-swap-skill.controller'
import { makeEditSkillController } from '../controllers/Skill/factories/make-edit-skill.controller'

const skillRoutes = Router()
const createSkillController = makeCreateSkillController()
const fetchSkillController = makeFetchSkillController()
const getSkillController = makeGetSkillController()
const getSkillOptionsController = makeGetSkillOptionsController()
const swapSkillController = makeSwapSkillController()
const editSkillController = makeEditSkillController()

skillRoutes.post('/', authenticate, ...createSkillController.handle)
skillRoutes.patch('/swap', authenticate, ...swapSkillController.handle)
skillRoutes.put('/update', authenticate, ...editSkillController.handle)
skillRoutes.get('/', (req, res) => fetchSkillController.handle(req, res))
skillRoutes.get(
  '/options/:characterId',
  authenticate,
  ...getSkillOptionsController.handle
)
skillRoutes.get('/:skillId', (req, res) => getSkillController.handle(req, res))

export { skillRoutes }
