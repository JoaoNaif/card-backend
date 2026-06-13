export interface DtoSkillRaw {
  id: string
  name: string
  description: string
  limitation: string
  cost: number
  minLevel: number
  powerId: string
  appliesBattleFieldId?: string | null
  fieldDuration?: number | null
  createdAt: Date
}
