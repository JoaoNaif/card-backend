import { Router } from 'express'
import indexController from '../controllers/indexController'
import { userRoutes } from './user.routes'
import { powerRoutes } from './power.routes'
import { skillRoutes } from './skill.routes'
import { characterRoutes } from './charactere.routes'
import { characterSkillRoutes } from './character-skill.routes'
import { traitRoutes } from './trait.routes'
import { battleFieldRoutes } from './battle-field.routes'

const routes = Router()

routes.get('/', indexController.home)
routes.use('/users', userRoutes)
routes.use('/powers', powerRoutes)
routes.use('/skills', skillRoutes)
routes.use('/characters', characterRoutes)
routes.use('/character-skills', characterSkillRoutes)
routes.use('/traits', traitRoutes)
routes.use('/battle-field', battleFieldRoutes)

export default routes
