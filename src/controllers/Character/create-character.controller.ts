import type { CreateCharacterUseCase } from "../../use-cases/Character/create-character"
import type { Request, Response } from "express"

export class CreateCharacterController {
    constructor(private createCharacterUseCase: CreateCharacterUseCase) { }

    async handle(req: Request, res: Response): Promise<Response> {
        const { userId, name, description, powerId, ranking } = req.body

        if (!userId || !name || !description || !powerId || !ranking) {
            return res.status(400).json({ message: 'All fields are required.' })
        }

        try {
            const { character } = await this.createCharacterUseCase.execute({
                userId,
                name,
                description,
                powerId,
                ranking
            })

            return res.status(201).json(character)
        } catch (error: any) {
            return res.status(400).json({
                message: error.message || 'Unexpected error.'
            })
        }
    }
}