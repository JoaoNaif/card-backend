export interface DtoUserRaw {
  id: string
  name: string
  email: string
  createdAt: Date
  stats: {
    rosterCount: number
    battlesPlayed: number
    wins: number
    winRate: number
  }
}
