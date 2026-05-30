import type { Request, Response } from "express"
import type { FetchCharacterUseCase, FetchCharacterUseCaseRequest } from "../../use-cases/Character/fetch-character"

export class FetchCharacterController {
    constructor(private fetchCharacterUseCase: FetchCharacterUseCase) { }

    async handle(req: Request, res: Response): Promise<Response> {
        const { search, page, limit } = req.query

        const requestData: FetchCharacterUseCaseRequest = {}

        if (search) {
            requestData.search = String(search)
        }

        if (page) {
            const parsedPage = Number(page)
            if (!isNaN(parsedPage)) {
                requestData.page = parsedPage
            }
        }

        if (limit) {
            const parsedLimit = Number(limit)
            if (!isNaN(parsedLimit)) {
                requestData.limit = parsedLimit
            }
        }

        const { characters } = await this.fetchCharacterUseCase.execute(requestData)

        return res.status(200).json(characters)
    }
}