import { Router } from 'express';
import { makeCreateUserController } from '../controllers/User/factories/make-create-user-controller';
import { makeGetUserController } from '../controllers/User/factories/make-get-user.controller';

const userRoutes = Router();
const createUserController = makeCreateUserController();
const getUserController = makeGetUserController();

userRoutes.post('/', ...createUserController.handle);
userRoutes.get('/:id', (req, res) => getUserController.handle(req, res));

export { userRoutes };
