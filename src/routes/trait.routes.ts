import { Router } from 'express'
import { makeCreateTraitController } from '../controllers/Trait/factories/make-create-trait.controller'
import { authenticate } from '../middlewares/authenticate'
import { makeFetchTraitController } from '../controllers/Trait/factories/make-fetch-trait.controller'

const traitRoutes = Router()
const createTraitController = makeCreateTraitController()
const fetchTraitController = makeFetchTraitController()

traitRoutes.post('/', authenticate, ...createTraitController.handle)
traitRoutes.get('/', authenticate, (req, res) =>
  fetchTraitController.handle(req, res)
)

export { traitRoutes }
