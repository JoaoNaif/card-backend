import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { CreateMachineUseCase } from '../../use-cases/Battle/create-machine'

const machineMemberSchema = z.object({
  characterId: z.string(),
  positionRow: z.number().int().min(0).max(2),
  positionCol: z.number().int().min(0).max(2),
})

const createMachineBodySchema = z.object({
  label: z.string().min(1),
  name: z.string().min(1),
  members: z.array(machineMemberSchema).min(1).max(4),
})

const validateBody = zodValidationPipe(createMachineBodySchema)

export class CreateMachineController {
  constructor(private createMachineUseCase: CreateMachineUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response) => {
      const userId = req.user!.sub
      const { label, name, members } = req.body

      const result = await this.createMachineUseCase.execute({
        userId,
        label,
        name,
        members,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value.machine)
    },
  ]
}
