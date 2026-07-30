export interface DtoMachineMemberRaw {
  characterId: string
  positionRow: number
  positionCol: number
}

export interface DtoMachineRaw {
  id: string
  label: string
  name: string
  members: DtoMachineMemberRaw[]
}
