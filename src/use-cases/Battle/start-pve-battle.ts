import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { Battle, BattleMode, BattleStatus } from '../../entities/battle'
import { BattleParticipant } from '../../entities/battle-participant'
import { BattleTeam } from '../../entities/battle-team'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'
import type { IBattleParticipantRepository } from '../../repositories/interface/battle-participant-repository'
import type { IBattleRepository } from '../../repositories/interface/battle-repository'
import type { IBattleTeamRepository } from '../../repositories/interface/battle-team-repository'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IMachineMemberRepository } from '../../repositories/interface/machine-member-repository'
import type { IMachineRepository } from '../../repositories/interface/machine-repository'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import { DEFAULT_MAX_TURNS } from './engine/battle-engine'
import { buildCombatantState } from './engine/build-combatant'
import { createPveSession, type PveCombatant } from './engine/pve-engine'
import {
  buildSkillNames,
  buildStateDto,
  flattenActions,
  type PveStateDto,
} from './engine/pve-response'
import { toSkillSnapshot } from './engine/skill-snapshot'
import type { ActionLog, SkillLike } from './engine/types'
import { InvalidTeamCompositionError } from './err/invalid-team-composition-error'
import { validateTeamComposition, type TeamMemberInput } from './run-auto-battle'

interface StartPveBattleUseCaseRequest {
  userId: string
  machineId: string
  playerTeam: TeamMemberInput[]
  battleFieldId?: string
  maxTurns?: number
}

interface StartPveBattleUseCaseResponse {
  battleId: string
  skillNames: Record<string, string>
  actions: ActionLog[]
  state: PveStateDto
}

type StartPveBattleResponse = Either<
  ResourceNotFoundError | UnauthorizedError | InvalidTeamCompositionError,
  StartPveBattleUseCaseResponse
>

export class StartPveBattleUseCase {
  constructor(
    private battleRepository: IBattleRepository,
    private battleTeamRepository: IBattleTeamRepository,
    private battleParticipantRepository: IBattleParticipantRepository,
    private characterRepository: ICharacterRepository,
    private skillRepository: ISkillRepository,
    private battleFieldRepository: IBattleFieldRepository,
    private machineRepository: IMachineRepository,
    private machineMemberRepository: IMachineMemberRepository
  ) {}

  async execute({
    userId,
    machineId,
    playerTeam,
    battleFieldId,
    maxTurns,
  }: StartPveBattleUseCaseRequest): Promise<StartPveBattleResponse> {
    const playerTeamError = validateTeamComposition(playerTeam, 'Player team')
    if (playerTeamError) return left(playerTeamError)

    const machine =
      (await this.machineRepository.findByLabel(machineId)) ??
      (await this.machineRepository.findById(machineId))
    if (!machine) return left(new ResourceNotFoundError('Machine'))

    const machineMembers = await this.machineMemberRepository.findAllByMachineId(
      machine.id.toString()
    )
    const machineTeam: TeamMemberInput[] = machineMembers.map((m) => ({
      characterId: m.characterId,
      positionRow: m.positionRow,
      positionCol: m.positionCol,
    }))

    const machineTeamError = validateTeamComposition(machineTeam, 'Machine team')
    if (machineTeamError) return left(machineTeamError)

    const battleField = battleFieldId
      ? await this.battleFieldRepository.findById(battleFieldId)
      : await this.battleFieldRepository.findRandom()
    if (!battleField) return left(new ResourceNotFoundError('Battle Field'))

    const allCharacterIds = [
      ...playerTeam.map((m) => m.characterId),
      ...machineTeam.map((m) => m.characterId),
    ]
    const characters = await this.characterRepository.findManyByIds(allCharacterIds)

    for (const member of playerTeam) {
      const char = characters.find((c) => c.id.toString() === member.characterId)
      if (!char) return left(new ResourceNotFoundError('Character'))
      if (char.userId !== userId) return left(new UnauthorizedError())
    }
    for (const member of machineTeam) {
      if (!characters.find((c) => c.id.toString() === member.characterId)) {
        return left(new ResourceNotFoundError('Character'))
      }
    }

    const skillsByCharacter =
      await this.skillRepository.findManyByCharacterIds(allCharacterIds)

    const skillsMap: Record<string, SkillLike> = {}
    for (const skills of Object.values(skillsByCharacter)) {
      for (const skill of skills) {
        skillsMap[skill.id.toString()] = toSkillSnapshot(skill)
      }
    }

    const buildTeam = (
      members: TeamMemberInput[],
      teamNumber: 1 | 2,
      controlledBy: 'PLAYER' | 'AI'
    ): PveCombatant[] =>
      members.map((member) => {
        const char = characters.find((c) => c.id.toString() === member.characterId)!
        const skills = skillsByCharacter[member.characterId] ?? []
        return {
          ...buildCombatantState(char, member, skills, battleField, teamNumber),
          controlledBy,
          ...(controlledBy === 'AI'
            ? { aiDifficulty: machine.difficulty, aiPersonality: machine.personality }
            : {}),
        }
      })

    const combatants = [
      ...buildTeam(playerTeam, 1, 'PLAYER'),
      ...buildTeam(machineTeam, 2, 'AI'),
    ]

    const { state, completedRounds } = createPveSession(
      combatants,
      skillsMap,
      maxTurns ?? DEFAULT_MAX_TURNS
    )

    const battle = Battle.create({
      mode: BattleMode.PVE,
      status: state.status === 'FINISHED' ? BattleStatus.COMPLETED : BattleStatus.ACTIVE,
      battleFieldId: battleField.id.toString(),
      winnerTerm: state.winnerTeam,
      totalTurns: completedRounds.length,
      maxTurns: maxTurns ?? null,
      log: completedRounds.map((round) => JSON.stringify(round)),
      sessionState: state.status === 'FINISHED' ? null : [JSON.stringify(state)],
    })
    await this.battleRepository.create(battle)

    const teamInputs: { teamNumber: 1 | 2; userId: string | null; members: TeamMemberInput[] }[] = [
      { teamNumber: 1, userId, members: playerTeam },
      { teamNumber: 2, userId: null, members: machineTeam },
    ]

    for (const teamInput of teamInputs) {
      const battleTeam = BattleTeam.create({
        battleId: battle.id.toString(),
        teamNumber: teamInput.teamNumber,
        userId: teamInput.userId,
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
      skillNames: buildSkillNames(state),
      actions: flattenActions(completedRounds, state),
      state: buildStateDto(state, {
        id: battleField.id.toString(),
        name: battleField.name,
        description: battleField.description,
        modifiers: battleField.modifiers,
      }),
    })
  }
}
