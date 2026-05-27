import type { Request, Response } from "express"
import type { CreatePowerUseCase } from "../../use-cases/Power/create-power"

export class CreatePowerController {
    constructor(private createPowerUseCase: CreatePowerUseCase) { }

    async handle(req: Request, res: Response): Promise<Response> {
        const { name, description } = req.body

        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required.' })
        }

        try {
            const { power } = await this.createPowerUseCase.execute({ name, description })
            return res.status(201).json(power)
        } catch (error: any) {
            return res.status(400).json({
                message: error.message || 'Unexpected error.'
            })
        }
    }
}