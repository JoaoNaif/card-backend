import { left, right, type Either } from '../../core/either'
import { TEAM_GRID_SIZE, TEAM_MAX_MEMBERS } from '../../core/constants/team-grid'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { Battle, BattleMode, BattleStatus } from '../../entities/battle'
import { BattleParticipant } from '../../entities/battle-participant'
import { BattleTeam } from '../../entities/battle-team'
import type { Skill } from '../../entities/skill'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'
import type { IBattleParticipantRepository } from '../../repositories/interface/battle-participant-repository'
import type { IBattleRepository } from '../../repositories/interface/battle-repository'
import type { IBattleTeamRepository } from '../../repositories/interface/battle-team-repository'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import { applyFieldModifiers } from './engine/apply-field-modifiers'
import { runBattleEngine } from './engine/battle-engine'
import type { CombatantState, TurnLog } from './engine/types'
import { InvalidTeamCompositionError } from './err/invalid-team-composition-error'

export interface TeamMemberInput {
  characterId: string
  positionRow: number
  positionCol: number
}

interface TeamInput {
  userId?: string
  members: TeamMemberInput[]
}

interface RunAutoBattleUseCaseRequest {
  team1: TeamInput
  team2: TeamInput
  battleFieldId?: string
  maxTurns?: number
}

interface ParticipantInfo {
  name: string
  teamNumber: 1 | 2
  maxHp: number
}

interface RunAutoBattleUseCaseResponse {
  battleId: string
  winnerTeam: 1 | 2 | null
  totalTurns: number
  participants: Record<string, ParticipantInfo>
  skills: Record<string, string>
  log: TurnLog[]
}

type RunAutoBattleResponse = Either<
  ResourceNotFoundError | InvalidTeamCompositionError,
  RunAutoBattleUseCaseResponse
>

export function validateTeamComposition(
  members: TeamMemberInput[],
  teamLabel: string
): InvalidTeamCompositionError | null {
  if (members.length === 0 || members.length > TEAM_MAX_MEMBERS) {
    return new InvalidTeamCompositionError(
      `${teamLabel} must have between 1 and ${TEAM_MAX_MEMBERS} members.`
    )
  }

  const seenCharacters = new Set<string>()
  const seenPositions = new Set<string>()

  for (const member of members) {
    const isValidRow =
      Number.isInteger(member.positionRow) &&
      member.positionRow >= 0 &&
      member.positionRow < TEAM_GRID_SIZE
    const isValidCol =
      Number.isInteger(member.positionCol) &&
      member.positionCol >= 0 &&
      member.positionCol < TEAM_GRID_SIZE

    if (!isValidRow || !isValidCol) {
      return new InvalidTeamCompositionError(
        `${teamLabel} has a member outside the ${TEAM_GRID_SIZE}x${TEAM_GRID_SIZE} grid.`
      )
    }

    if (seenCharacters.has(member.characterId)) {
      return new InvalidTeamCompositionError(
        `${teamLabel} has a duplicate character.`
      )
    }
    seenCharacters.add(member.characterId)

    const positionKey = `${member.positionRow}-${member.positionCol}`
    if (seenPositions.has(positionKey)) {
      return new InvalidTeamCompositionError(
        `${teamLabel} has two members assigned to the same position.`
      )
    }
    seenPositions.add(positionKey)
  }

  return null
}

export class RunAutoBattleUseCase {
  constructor(
    private battleRepository: IBattleRepository,
    private battleTeamRepository: IBattleTeamRepository,
    private battleParticipantRepository: IBattleParticipantRepository,
    private characterRepository: ICharacterRepository,
    private skillRepository: ISkillRepository,
    private battleFieldRepository: IBattleFieldRepository
  ) {}

  async execute({
    team1,
    team2,
    battleFieldId,
    maxTurns,
  }: RunAutoBattleUseCaseRequest): Promise<RunAutoBattleResponse> {
    const team1Error = validateTeamComposition(team1.members, 'Team 1')
    if (team1Error) return left(team1Error)

    const team2Error = validateTeamComposition(team2.members, 'Team 2')
    if (team2Error) return left(team2Error)

    const battleField = battleFieldId
      ? await this.battleFieldRepository.findById(battleFieldId)
      : await this.battleFieldRepository.findRandom()

    if (!battleField) return left(new ResourceNotFoundError('Battle Field'))

    const allCharacterIds = [
      ...team1.members.map((m) => m.characterId),
      ...team2.members.map((m) => m.characterId),
    ]

    const characters =
      await this.characterRepository.findManyByIds(allCharacterIds)

    for (const id of allCharacterIds) {
      if (!characters.find((c) => c.id.toString() === id)) {
        return left(new ResourceNotFoundError('Character'))
      }
    }

    const skillsByCharacter =
      await this.skillRepository.findManyByCharacterIds(allCharacterIds)

    const skillsMap: Record<string, Skill> = {}
    for (const skills of Object.values(skillsByCharacter)) {
      for (const skill of skills) {
        skillsMap[skill.id.toString()] = skill
      }
    }

    const buildCombatants = (
      members: TeamMemberInput[],
      teamNumber: 1 | 2
    ): CombatantState[] =>
      members.map((member) => {
        const char = characters.find(
          (c) => c.id.toString() === member.characterId
        )!
        const skills = skillsByCharacter[member.characterId] ?? []
        const traitIds = char.traits.map((trait) => trait.id)
        const fieldModifiers = battleField.modifiersFor(traitIds)
        const { hp, atk, def, spd } = applyFieldModifiers(
          {
            hp: char.effectiveHp,
            atk: char.effectiveAtk,
            def: char.effectiveDef,
            spd: char.effectiveSpd,
          },
          fieldModifiers
        )
        return {
          characterId: member.characterId,
          teamNumber,
          currentHp: hp,
          maxHp: hp,
          baseAtk: atk,
          baseDef: def,
          baseSpd: spd,
          hasDualPower: !!char.secondaryPowerId,
          skillIds: skills.map((s) => s.id.toString()),
          skillCooldowns: {},
          activeEffects: [],
          isAlive: true,
          positionRow: member.positionRow,
          positionCol: member.positionCol,
        }
      })

    const combatants = [
      ...buildCombatants(team1.members, 1),
      ...buildCombatants(team2.members, 2),
    ]

    const result = runBattleEngine(combatants, skillsMap, maxTurns)

    const participants: Record<string, ParticipantInfo> = {}
    for (const combatant of combatants) {
      const char = characters.find(
        (c) => c.id.toString() === combatant.characterId
      )!
      participants[combatant.characterId] = {
        name: char.name,
        teamNumber: combatant.teamNumber,
        maxHp: combatant.maxHp,
      }
    }

    const skillNames: Record<string, string> = {}
    for (const skill of Object.values(skillsMap)) {
      skillNames[skill.id.toString()] = skill.name
    }

    const serializedLog = result.log.map((turn) => JSON.stringify(turn))

    const battle = Battle.create({
      mode: BattleMode.AUTO,
      status: BattleStatus.COMPLETED,
      battleFieldId: battleField.id.toString(),
      winnerTerm: result.winnerTeam,
      totalTurns: result.totalTurns,
      maxTurns: maxTurns ?? null,
      log: serializedLog,
    })

    await this.battleRepository.create(battle)

    for (const [index, teamInput] of [team1, team2].entries()) {
      const teamNumber = (index + 1) as 1 | 2

      const battleTeam = BattleTeam.create({
        battleId: battle.id.toString(),
        teamNumber,
        userId: teamInput.userId ?? null,
      })
      await this.battleTeamRepository.create(battleTeam)

      for (const member of teamInput.members) {
        const participant = BattleParticipant.create({
          battleTeamId: battleTeam.id.toString(),
          characterId: member.characterId,
          positionRow: member.positionRow,
          positionCol: member.positionCol,
        })
        await this.battleParticipantRepository.create(participant)
      }
    }

    return right({
      battleId: battle.id.toString(),
      winnerTeam: result.winnerTeam,
      totalTurns: result.totalTurns,
      participants,
      skills: skillNames,
      log: result.log,
    })
  }
}
