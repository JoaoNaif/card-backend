import { Router } from 'express';
import indexController from '../controllers/indexController';
import { userRoutes } from './user.routes';
import { powerRoutes } from './power.routes';
import { skillRoutes } from './skill.routes';

const routes = Router();

routes.get('/', indexController.home);
routes.use('/users', userRoutes);
routes.use('/powers', powerRoutes);
routes.use('/skills', skillRoutes);

export default routes;
