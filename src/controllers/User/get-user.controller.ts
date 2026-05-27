import type { GetUserUseCase } from "../../use-cases/User/get-user";
import type { Request, Response } from "express";

export class GetUserController {
    constructor(private getUserUseCase: GetUserUseCase) { }

    async handle(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        try {
            const { user } = await this.getUserUseCase.execute({ id: String(id) });
            return res.status(200).json(user);
        } catch (error: any) {
            return res.status(400).json({
                message: error.message || 'Unexpected error.'
            });
        }
    }
}