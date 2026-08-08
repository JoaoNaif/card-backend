import type { AiDifficulty, AiPersonality } from '../../../entities/machine'
import type { DtoCharacterFull } from '../../Character/dtos/dto-character-full'
import type { DtoCharacterSummary } from '../../Character/dtos/dto-character-summary'

export interface DtoMachineMemberRaw {
  characterId: string
  positionRow: number
  positionCol: number
}

export interface DtoMachineRaw {
  id: string
  label: string
  name: string
  difficulty: AiDifficulty
  personality: AiPersonality
  members: DtoMachineMemberRaw[]
}

export interface DtoMachineMemberSummary {
  characterId: string
  positionRow: number
  positionCol: number
  character: DtoCharacterSummary
}

export interface DtoMachineSummary {
  id: string
  label: string
  name: string
  difficulty: AiDifficulty
  personality: AiPersonality
  members: DtoMachineMemberSummary[]
}

export interface DtoMachineMemberFull {
  characterId: string
  positionRow: number
  positionCol: number
  character: DtoCharacterFull
}

export interface DtoMachineFull {
  id: string
  label: string
  name: string
  difficulty: AiDifficulty
  personality: AiPersonality
  members: DtoMachineMemberFull[]
}
