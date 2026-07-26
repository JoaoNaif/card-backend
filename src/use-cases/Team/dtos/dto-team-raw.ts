export interface DtoTeamMemberRaw {
  characterId: string
  characterName: string
  positionRow: number
  positionCol: number
}

export interface DtoTeamRaw {
  id: string | null
  members: DtoTeamMemberRaw[]
}
