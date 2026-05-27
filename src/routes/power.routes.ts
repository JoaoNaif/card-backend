import { Router } from "express";
import { makeCreatePowerController } from "../controllers/Power/factories/make-create-power.controller";
import { makeFetchPowerController } from "../controllers/Power/factories/make-fetch-power.controller";

const powerRoutes = Router();
const createPowerController = makeCreatePowerController();
const fetchPowerController = makeFetchPowerController();

powerRoutes.post('/', (req, res) => createPowerController.handle(req, res));
powerRoutes.get('/', (req, res) => fetchPowerController.handle(req, res));

export { powerRoutes };