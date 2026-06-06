import { Router } from 'express'
import { makeCreateSkillController } from '../controllers/Skill/factories/make-create-skill.controller'
import { makeFetchSkillController } from '../controllers/Skill/factories/make-fetch-skill.controller'
import { makeGetSkillController } from '../controllers/Skill/factories/make-get-skill.controller'
import { authenticate } from '../middlewares/authenticate'

const skillRoutes = Router()
const createSkillController = makeCreateSkillController()
const fetchSkillController = makeFetchSkillController()
const getSkillController = makeGetSkillController()

skillRoutes.post('/', authenticate, ...createSkillController.handle)
skillRoutes.get('/', (req, res) => fetchSkillController.handle(req, res))
skillRoutes.get('/:skillId', (req, res) => getSkillController.handle(req, res))

export { skillRoutes }
