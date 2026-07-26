import { Router } from 'express'
import { makeAddTeamMemberController } from '../controllers/Team/factories/make-add-team-member.controller'
import { makeGetTeamController } from '../controllers/Team/factories/make-get-team.controller'
import { makeRemoveTeamMemberController } from '../controllers/Team/factories/make-remove-team-member.controller'
import { authenticate } from '../middlewares/authenticate'

const teamRoutes = Router()
const addTeamMemberController = makeAddTeamMemberController()
const removeTeamMemberController = makeRemoveTeamMemberController()
const getTeamController = makeGetTeamController()

teamRoutes.post('/members', authenticate, ...addTeamMemberController.handle)
teamRoutes.delete(
  '/members',
  authenticate,
  ...removeTeamMemberController.handle
)
teamRoutes.get('/', authenticate, (req, res) =>
  getTeamController.handle(req, res)
)

export { teamRoutes }
