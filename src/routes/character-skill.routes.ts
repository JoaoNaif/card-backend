import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { makeCreateCharacterSkillController } from '../controllers/Character-Skill/factories/make-create-character-skill.controller'

const characterSkillRoutes = Router()
const createCharacterSkillController = makeCreateCharacterSkillController()

characterSkillRoutes.post(
  '/',
  authenticate,
  ...createCharacterSkillController.handle
)

export { characterSkillRoutes }
