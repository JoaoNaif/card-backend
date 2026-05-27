import { Router } from 'express';
import { makeCreateUserController } from '../controllers/User/factories/make-create-user-controller';
import { makeGetUserController } from '../controllers/User/factories/make-get-user.controller';

const userRoutes = Router();
const createUserController = makeCreateUserController();
const getUserController = makeGetUserController();

// We use an arrow function to ensure that 'this' context remains bound to the controller instance
userRoutes.post('/', (req, res) => createUserController.handle(req, res));
userRoutes.get('/:id', (req, res) => getUserController.handle(req, res));

export { userRoutes };
