import { Router } from 'express'
import { makeCreateTraitController } from '../controllers/Trait/factories/make-create-trait.controller'
import { authenticate } from '../middlewares/authenticate'

const traitRoutes = Router()
const createTraitController = makeCreateTraitController()

traitRoutes.post('/', authenticate, ...createTraitController.handle)

export { traitRoutes }
