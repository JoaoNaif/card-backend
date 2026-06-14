import type { Pillar } from '../../../entities/power'

export interface DtoPowerRaw {
  id: string
  name: string
  description: string
  pillar: Pillar
  canAwaken: boolean
  isAwakened: boolean
  createdAt: Date
}
