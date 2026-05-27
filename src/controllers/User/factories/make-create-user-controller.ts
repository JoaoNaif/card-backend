import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository';
import { CreateUserUseCase } from '../../../use-cases/User/create-user';
import { CreateUserController } from '../create-user.controller';

export function makeCreateUserController(): CreateUserController {
    const userRepository = new PrismaUserRepository();
    const createUserUseCase = new CreateUserUseCase(userRepository);
    const createUserController = new CreateUserController(createUserUseCase);

    return createUserController;
}
