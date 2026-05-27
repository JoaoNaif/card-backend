import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository';
import { GetUserUseCase } from '../../../use-cases/User/get-user';
import { GetUserController } from '../get-user.controller';

export function makeGetUserController(): GetUserController {
    const userRepository = new PrismaUserRepository();
    const getUserUseCase = new GetUserUseCase(userRepository);
    const getUserController = new GetUserController(getUserUseCase);

    return getUserController;
}