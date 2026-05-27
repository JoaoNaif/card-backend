import type { CreateSkillUseCase } from "../../use-cases/Skill/create-skill"
import type { Request, Response } from "express"

export class CreateSkillController {
    constructor(private createSkillUseCase: CreateSkillUseCase) { }

    async handle(req: Request, res: Response): Promise<Response> {
        const { name, description, cost, limitation, powerId } = req.body

        if (!name || !description || !cost || !limitation || !powerId) {
            return res.status(400).json({ message: 'All fields are required.' })
        }

        try {
            const { skill } = await this.createSkillUseCase.execute({ name, description, cost, limitation, powerId })
            return res.status(201).json(skill)
        } catch (error: any) {
            return res.status(400).json({
                message: error.message || 'Unexpected error.'
            })
        }
    }
}