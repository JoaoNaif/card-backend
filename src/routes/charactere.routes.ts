import { Router } from "express";
import { makeCreateCharacterController } from "../controllers/Character/factories/make-create-charactere.controller";
import { makeFetchCharacterController } from "../controllers/Character/factories/make-fetch-caractere.controller";

const characterRoutes = Router();
const createCharacterController = makeCreateCharacterController();
const fetchCharacterController = makeFetchCharacterController();

characterRoutes.post('/', (req, res) => createCharacterController.handle(req, res));
characterRoutes.get('/', (req, res) => fetchCharacterController.handle(req, res));

export { characterRoutes };