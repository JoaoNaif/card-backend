import { Router } from "express";
import { makeCreateSkillController } from "../controllers/Skill/factories/make-create-skill.controller";
import { makeFetchSkillController } from "../controllers/Skill/factories/make-fetch-skill.controller";

const skillRoutes = Router();
const createSkillController = makeCreateSkillController();
const fetchSkillController = makeFetchSkillController();

skillRoutes.post('/', (req, res) => createSkillController.handle(req, res));
skillRoutes.get('/', (req, res) => fetchSkillController.handle(req, res));

export { skillRoutes };