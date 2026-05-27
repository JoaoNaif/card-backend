import type { Request, Response } from 'express';
import { CreateUserUseCase } from '../../use-cases/User/create-user';

export class CreateUserController {
    constructor(private createUserUseCase: CreateUserUseCase) { }

    async handle(req: Request, res: Response): Promise<Response> {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required.' });
        }

        try {
            const { user } = await this.createUserUseCase.execute({ name, email });
            return res.status(201).json(user);
        } catch (error: any) {
            return res.status(400).json({
                message: error.message || 'Unexpected error.'
            });
        }
    }
}