import { Router } from 'express'
import { makeCreateSkillController } from '../controllers/Skill/factories/make-create-skill.controller'
import { makeFetchSkillController } from '../controllers/Skill/factories/make-fetch-skill.controller'
import { authenticate } from '../middlewares/authenticate'

const skillRoutes = Router()
const createSkillController = makeCreateSkillController()
const fetchSkillController = makeFetchSkillController()

skillRoutes.post('/', authenticate, ...createSkillController.handle)
skillRoutes.get('/', (req, res) => fetchSkillController.handle(req, res))

export { skillRoutes }
