import 'dotenv/config'
import {
  BonusType,
  Pillar,
  Ranking,
  StatType,
  TargetType,
  UserRole,
} from '../src/generated/prisma'
import { prisma } from '../src/config/prisma'
import { BcryptHasher } from '../src/repositories/cryptography/bcrypt-hasher'

const DEMO_USER_EMAIL = 'demo@duelos.com'
const DEMO_USER_PASSWORD = 'demo1234'

async function resetDemoData() {
  await prisma.battleParticipant.deleteMany()
  await prisma.battleTeam.deleteMany()
  await prisma.battle.deleteMany()
  await prisma.machineMember.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.characterSkill.deleteMany()
  await prisma.character.deleteMany()
  await prisma.powerAwakening.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.battleFieldModifier.deleteMany()
  await prisma.battleField.deleteMany()
  await prisma.power.deleteMany()
  await prisma.trait.deleteMany()
  await prisma.user.deleteMany({ where: { email: DEMO_USER_EMAIL } })
}

async function seed() {
  await resetDemoData()

  const hasher = new BcryptHasher()
  const user = await prisma.user.create({
    data: {
      name: 'Demo Player',
      email: DEMO_USER_EMAIL,
      passwordHash: await hasher.hash(DEMO_USER_PASSWORD),
      userRole: UserRole.ADMIN,
    },
  })

  const heatResistance = await prisma.trait.create({
    data: {
      name: 'Resistência Térmica',
      description: 'Adaptado a calor extremo — prospera perto de fontes de fogo.',
    },
  })
  const heatWeakness = await prisma.trait.create({
    data: {
      name: 'Fraqueza Térmica',
      description: 'Sensível a calor extremo — sofre em ambientes ígneos.',
    },
  })
  const emotionalInstability = await prisma.trait.create({
    data: {
      name: 'Instabilidade Emocional',
      description: 'Poder oscila em intensidade conforme o estado emocional do personagem.',
    },
  })
  const intimidatingPresence = await prisma.trait.create({
    data: {
      name: 'Presença Intimidante',
      description: 'Impõe medo em inimigos próximos apenas por sua presença.',
    },
  })
  const nightVision = await prisma.trait.create({
    data: {
      name: 'Visão Noturna',
      description: 'Enxerga perfeitamente em ambientes com pouca luz.',
    },
  })

  const volcano = await prisma.battleField.create({
    data: {
      name: 'Vulcão Ativo',
      description: 'Cratera vulcânica em erupção constante. O calor favorece quem é resistente a ele.',
      modifiers: {
        create: [
          { traitId: heatResistance.id, stat: StatType.ATK, bonusType: BonusType.PERCENT, bonusValue: 25 },
          { traitId: heatWeakness.id, stat: StatType.DEF, bonusType: BonusType.PERCENT, bonusValue: -15 },
        ],
      },
    },
  })

  const fire = await prisma.power.create({
    data: { name: 'Piroquinese', description: 'Manipulação de fogo e calor.', pillar: Pillar.MATERIAL, canAwaken: true },
  })
  const magma = await prisma.power.create({
    data: { name: 'Magma', description: 'Forma desperta de Piroquinese — rocha fundida e destrutiva.', pillar: Pillar.MATERIAL, isAwakened: true },
  })
  const plasma = await prisma.power.create({
    data: { name: 'Plasma', description: 'Forma desperta de Piroquinese — energia ionizada pura.', pillar: Pillar.MATERIAL, isAwakened: true },
  })
  await prisma.powerAwakening.createMany({
    data: [
      { basePowerId: fire.id, awakenedPowerId: magma.id },
      { basePowerId: fire.id, awakenedPowerId: plasma.id },
    ],
  })

  const gravity = await prisma.power.create({
    data: { name: 'Impacto Gravitacional', description: 'Manipulação de força e movimento.', pillar: Pillar.VETORIAL },
  })
  const regeneration = await prisma.power.create({
    data: { name: 'Regeneração Celular', description: 'Adaptação e cura orgânica.', pillar: Pillar.BIOLOGICA },
  })
  const illusion = await prisma.power.create({
    data: { name: 'Ilusão Mental', description: 'Percepção e influência psíquica.', pillar: Pillar.PSIQUICA },
  })
  const time = await prisma.power.create({
    data: { name: 'Manipulação Temporal', description: 'Controle sobre o fluxo do tempo.', pillar: Pillar.FUNDAMENTAL, canAwaken: false },
  })

  const fireBurst = await prisma.skill.create({
    data: {
      name: 'Rajada de Fogo', description: 'Lança uma rajada concentrada de fogo.', limitation: 'Requer contato visual com o alvo.',
      cooldownTurns: 1, debuffStat: StatType.HP, debuffValue: 15, debuffDuration: 2,
      targetType: TargetType.SINGLE_ENEMY, damageMultiplier: 1.5, minLevel: 1, powerId: fire.id,
    },
  })
  const thermalExplosion = await prisma.skill.create({
    data: {
      name: 'Explosão Térmica', description: 'Onda de calor que atinge todos os inimigos.', limitation: 'Só pode ser usada a cada 3 turnos.',
      cooldownTurns: 3, debuffStat: StatType.HP, debuffValue: 25, debuffDuration: 2,
      targetType: TargetType.AOE_ENEMIES, damageMultiplier: 1.0, minLevel: 10, powerId: fire.id,
      appliesBattleFieldId: volcano.id, fieldDuration: 3,
    },
  })
  const infernalFury = await prisma.skill.create({
    data: {
      name: 'Fúria Ígnea', description: 'Envolve o próprio corpo em chamas, elevando a força de ataque.', limitation: 'Consome as próprias reservas de calor interno.',
      cooldownTurns: 2, debuffStat: StatType.HP, debuffValue: 10, debuffDuration: 2,
      targetType: TargetType.SELF, targetEffectStat: StatType.ATK, targetEffectValue: 15, targetEffectDuration: 3,
      minLevel: 5, powerId: fire.id,
    },
  })
  const protectiveFlame = await prisma.skill.create({
    data: {
      name: 'Chama Protetora', description: 'Envolve todos os aliados em uma camada de calor que endurece a pele.', limitation: 'Exige concentração contínua.',
      cooldownTurns: 3, debuffStat: StatType.HP, debuffValue: 15, debuffDuration: 2,
      targetType: TargetType.ALL_ALLIES, targetEffectStat: StatType.DEF, targetEffectValue: 12, targetEffectDuration: 3,
      minLevel: 8, powerId: fire.id,
    },
  })

  const vectorStrike = await prisma.skill.create({
    data: {
      name: 'Golpe Vetorial', description: 'Concentra força cinética em um golpe direto.', limitation: 'Exige alvo a curta distância.',
      cooldownTurns: 0, debuffStat: StatType.ATK, debuffValue: 8, debuffDuration: 2,
      targetType: TargetType.SINGLE_ENEMY, damageMultiplier: 1.3, minLevel: 1, powerId: gravity.id,
    },
  })
  const shockwave = await prisma.skill.create({
    data: {
      name: 'Onda de Choque', description: 'Libera uma onda de impacto em área.', limitation: 'Perde precisão em área aberta.',
      cooldownTurns: 2, debuffStat: StatType.ATK, debuffValue: 12, debuffDuration: 2,
      targetType: TargetType.AOE_ENEMIES, damageMultiplier: 0.8, minLevel: 15, powerId: gravity.id,
    },
  })
  const kineticShield = await prisma.skill.create({
    data: {
      name: 'Blindagem Cinética', description: 'Concentra força vetorial ao redor do próprio corpo, formando um escudo.', limitation: 'Reduz a própria capacidade ofensiva momentaneamente.',
      cooldownTurns: 2, debuffStat: StatType.ATK, debuffValue: 6, debuffDuration: 2,
      targetType: TargetType.SELF, targetEffectStat: StatType.DEF, targetEffectValue: 12, targetEffectDuration: 3,
      minLevel: 5, powerId: gravity.id,
    },
  })
  const gravitationalAnchor = await prisma.skill.create({
    data: {
      name: 'Ancoragem Gravitacional', description: 'Prende o alvo sob um campo gravitacional intensificado, reduzindo sua velocidade.', limitation: 'Efeito perde força fora de curto alcance.',
      cooldownTurns: 2, debuffStat: StatType.ATK, debuffValue: 6, debuffDuration: 2,
      targetType: TargetType.SINGLE_ENEMY, damageMultiplier: 0.4, targetEffectStat: StatType.SPD, targetEffectValue: -12, targetEffectDuration: 2,
      minLevel: 8, powerId: gravity.id,
    },
  })

  const adaptiveHeal = await prisma.skill.create({
    data: {
      name: 'Cura Adaptativa', description: 'Acelera a regeneração celular de um aliado.', limitation: 'Consome reserva biológica própria.',
      cooldownTurns: 2, debuffStat: StatType.SPD, debuffValue: 5, debuffDuration: 2,
      targetType: TargetType.SINGLE_ALLY, healMultiplier: 1.2, minLevel: 1, powerId: regeneration.id,
    },
  })
  const emergencyMutation = await prisma.skill.create({
    data: {
      name: 'Mutação de Emergência', description: 'Fortalece a defesa de todos os aliados temporariamente.', limitation: 'Efeito colateral debilitante.',
      cooldownTurns: 4, debuffStat: StatType.SPD, debuffValue: 10, debuffDuration: 3,
      targetType: TargetType.ALL_ALLIES, targetEffectStat: StatType.DEF, targetEffectValue: 10, targetEffectDuration: 3,
      minLevel: 20, powerId: regeneration.id,
    },
  })
  const survivalInstinct = await prisma.skill.create({
    data: {
      name: 'Instinto de Sobrevivência', description: 'Acelera drasticamente a própria regeneração celular.', limitation: 'Consome reserva biológica em excesso.',
      cooldownTurns: 3, debuffStat: StatType.SPD, debuffValue: 6, debuffDuration: 2,
      targetType: TargetType.SELF, healMultiplier: 1.0, minLevel: 6, powerId: regeneration.id,
    },
  })
  const defensiveToxin = await prisma.skill.create({
    data: {
      name: 'Toxina Defensiva', description: 'Libera esporos tóxicos que enfraquecem o ataque de todos os inimigos.', limitation: 'Efeito se dissipa rápido em ambientes ventilados.',
      cooldownTurns: 3, debuffStat: StatType.SPD, debuffValue: 8, debuffDuration: 2,
      targetType: TargetType.AOE_ENEMIES, damageMultiplier: 0.3, targetEffectStat: StatType.ATK, targetEffectValue: -10, targetEffectDuration: 2,
      minLevel: 10, powerId: regeneration.id,
    },
  })

  const sensoryDistortion = await prisma.skill.create({
    data: {
      name: 'Distorção Sensorial', description: 'Confunde os sentidos do alvo, reduzindo sua precisão.', limitation: 'Requer foco mental total.',
      cooldownTurns: 1, debuffStat: StatType.DEF, debuffValue: 10, debuffDuration: 2,
      targetType: TargetType.SINGLE_ENEMY, damageMultiplier: 0.3, targetEffectStat: StatType.ATK, targetEffectValue: -10, targetEffectDuration: 2,
      minLevel: 1, powerId: illusion.id,
    },
  })
  const collectivePanic = await prisma.skill.create({
    data: {
      name: 'Pânico Coletivo', description: 'Induz pânico em todos os inimigos, reduzindo sua velocidade.', limitation: 'Efeito enfraquece com o número de alvos.',
      cooldownTurns: 3, debuffStat: StatType.DEF, debuffValue: 15, debuffDuration: 2,
      targetType: TargetType.AOE_ENEMIES, targetEffectStat: StatType.SPD, targetEffectValue: -8, targetEffectDuration: 2,
      minLevel: 12, powerId: illusion.id,
    },
  })
  const mindVeil = await prisma.skill.create({
    data: {
      name: 'Véu da Mente', description: 'Cria uma barreira psíquica ao redor de si mesma, dificultando ser atingida.', limitation: 'Exige isolamento mental total.',
      cooldownTurns: 2, debuffStat: StatType.DEF, debuffValue: 6, debuffDuration: 2,
      targetType: TargetType.SELF, targetEffectStat: StatType.DEF, targetEffectValue: 14, targetEffectDuration: 3,
      minLevel: 5, powerId: illusion.id,
    },
  })
  const telepathicSync = await prisma.skill.create({
    data: {
      name: 'Sincronia Telepática', description: 'Conecta a mente de todos os aliados, aumentando a agressividade em conjunto.', limitation: 'Sobrecarga mental caso mantida por muito tempo.',
      cooldownTurns: 3, debuffStat: StatType.DEF, debuffValue: 10, debuffDuration: 2,
      targetType: TargetType.ALL_ALLIES, targetEffectStat: StatType.ATK, targetEffectValue: 10, targetEffectDuration: 3,
      minLevel: 10, powerId: illusion.id,
    },
  })

  const temporalDistortion = await prisma.skill.create({
    data: {
      name: 'Distorção Temporal', description: 'Desacelera o fluxo temporal ao redor do alvo.', limitation: 'Custo imprevisível sobre a própria linha temporal.',
      cooldownTurns: 2, debuffStat: StatType.HP, debuffValue: 10, debuffDuration: 1,
      targetType: TargetType.SINGLE_ENEMY, damageMultiplier: 0.5, targetEffectStat: StatType.SPD, targetEffectValue: -20, targetEffectDuration: 2,
      minLevel: 1, powerId: time.id,
    },
  })
  const rewind = await prisma.skill.create({
    data: {
      name: 'Retrocesso', description: 'Reverte o próprio corpo a um estado anterior, curando ferimentos.', limitation: 'Desgasta severamente a defesa.',
      cooldownTurns: 5, debuffStat: StatType.DEF, debuffValue: 20, debuffDuration: 3,
      targetType: TargetType.SELF, healMultiplier: 0.6, minLevel: 25, powerId: time.id,
    },
  })
  const temporalAcceleration = await prisma.skill.create({
    data: {
      name: 'Aceleração Temporal', description: 'Acelera o próprio fluxo temporal, ganhando velocidade de reação.', limitation: 'Desgasta o próprio corpo com o esforço.',
      cooldownTurns: 2, debuffStat: StatType.HP, debuffValue: 8, debuffDuration: 2,
      targetType: TargetType.SELF, targetEffectStat: StatType.SPD, targetEffectValue: 15, targetEffectDuration: 2,
      minLevel: 8, powerId: time.id,
    },
  })
  const stasisField = await prisma.skill.create({
    data: {
      name: 'Campo de Estase', description: 'Desacelera o tempo ao redor de todos os inimigos em área.', limitation: 'Exige controle temporal avançado.',
      cooldownTurns: 4, debuffStat: StatType.DEF, debuffValue: 12, debuffDuration: 2,
      targetType: TargetType.AOE_ENEMIES, damageMultiplier: 0.2, targetEffectStat: StatType.SPD, targetEffectValue: -15, targetEffectDuration: 2,
      minLevel: 15, powerId: time.id,
    },
  })

  const characters = [
    {
      // Poder despertado (awakenedPowerId setado). Kit completo: dmg single, dmg aoe + campo de batalha, buff self, buff time.
      name: 'Ignis', description: 'Piroquinésico veterano cujo poder despertou em Magma.',
      ranking: Ranking.CONTINUO, maxRanking: Ranking.CAOTICO, level: 20, xp: 0,
      baseHp: 120, baseAtk: 22, baseDef: 14, baseSpd: 16,
      powerId: fire.id, awakenedPowerId: magma.id,
      traitIds: [heatResistance.id],
      skillIds: [fireBurst.id, thermalExplosion.id, infernalFury.id, protectiveFlame.id],
    },
    {
      // Dual power (secondaryPowerId setado). Kit misto entre os dois poderes: dmg single (cada poder) + buff self (cada poder).
      name: 'Vulcana', description: 'Discípula de Ignis, começando a explorar um segundo poder.',
      ranking: Ranking.DISCRETO, maxRanking: Ranking.SINGULAR, level: 5, xp: 0,
      baseHp: 90, baseAtk: 15, baseDef: 10, baseSpd: 12,
      powerId: fire.id, secondaryPowerId: gravity.id,
      traitIds: [heatResistance.id],
      skillIds: [fireBurst.id, infernalFury.id, vectorStrike.id, kineticShield.id],
    },
    {
      // Apenas um poder, sem secondary/awaken — caso "básico" limpo. Kit completo: dmg single, dmg aoe, buff self, debuff single.
      name: 'Gravus', description: 'Especialista em impacto cinético de longo alcance.',
      ranking: Ranking.DIFERENCIAVEL, maxRanking: Ranking.NAO_LINEAR, level: 16, xp: 0,
      baseHp: 130, baseAtk: 18, baseDef: 16, baseSpd: 9,
      powerId: gravity.id, traitIds: [],
      skillIds: [vectorStrike.id, shockwave.id, kineticShield.id, gravitationalAnchor.id],
    },
    {
      name: 'Tectra', description: 'Ainda aprendendo a controlar a própria força vetorial.',
      ranking: Ranking.DISCRETO, maxRanking: Ranking.CONTINUO, level: 15, xp: 0,
      baseHp: 100, baseAtk: 12, baseDef: 12, baseSpd: 10,
      powerId: gravity.id, traitIds: [],
      skillIds: [vectorStrike.id, shockwave.id, kineticShield.id, gravitationalAnchor.id],
    },
    {
      // Kit completo: heal single ally, buff time, heal self, debuff aoe.
      name: 'Vitalis', description: 'Curandeira biológica com regeneração acelerada.',
      ranking: Ranking.CONTINUO, maxRanking: Ranking.DIVERGENTE, level: 20, xp: 0,
      baseHp: 140, baseAtk: 10, baseDef: 13, baseSpd: 11,
      powerId: regeneration.id, traitIds: [],
      skillIds: [adaptiveHeal.id, emergencyMutation.id, survivalInstinct.id, defensiveToxin.id],
    },
    {
      name: 'Symbion', description: 'Organismo simbiótico em estágio inicial de adaptação, já com potencial de cura consolidado.',
      ranking: Ranking.DISCRETO, maxRanking: Ranking.SINGULAR, level: 20, xp: 0,
      baseHp: 110, baseAtk: 9, baseDef: 11, baseSpd: 10,
      powerId: regeneration.id, traitIds: [],
      skillIds: [adaptiveHeal.id, emergencyMutation.id, survivalInstinct.id, defensiveToxin.id],
    },
    {
      // Vários traits — cobre o caso de personagem carregado de traits. Kit completo: debuff single, debuff aoe, buff self, buff time.
      name: 'Mentis', description: 'Manipuladora de percepção, sensível a calor e emoções intensas.',
      ranking: Ranking.DIFERENCIAVEL, maxRanking: Ranking.CAOTICO, level: 12, xp: 0,
      baseHp: 95, baseAtk: 16, baseDef: 12, baseSpd: 14,
      powerId: illusion.id,
      traitIds: [heatWeakness.id, emotionalInstability.id, intimidatingPresence.id, nightVision.id],
      skillIds: [sensoryDistortion.id, collectivePanic.id, mindVeil.id, telepathicSync.id],
    },
    {
      // Kit completo: dmg single + debuff, heal self, buff self, debuff aoe.
      name: 'Chronos', description: 'Guardião do fluxo temporal — poder que nunca desperta.',
      ranking: Ranking.NAO_LINEAR, maxRanking: Ranking.SINGULAR, level: 25, xp: 0,
      baseHp: 105, baseAtk: 17, baseDef: 15, baseSpd: 18,
      powerId: time.id, traitIds: [heatWeakness.id],
      skillIds: [temporalDistortion.id, rewind.id, temporalAcceleration.id, stasisField.id],
    },
  ]

  for (const c of characters) {
    await prisma.character.create({
      data: {
        name: c.name, description: c.description, userId: user.id,
        ranking: c.ranking, maxRanking: c.maxRanking, level: c.level, xp: c.xp,
        baseHp: c.baseHp, baseAtk: c.baseAtk, baseDef: c.baseDef, baseSpd: c.baseSpd,
        powerId: c.powerId,
        secondaryPowerId: c.secondaryPowerId ?? null,
        awakenedPowerId: c.awakenedPowerId ?? null,
        traits: { connect: c.traitIds.map((id) => ({ id })) },
        skills: { create: c.skillIds.map((skillId) => ({ skillId })) },
      },
    })
  }

  // Time da máquina "M1" (sem dono) — usado para testar POST /battle/auto
  // contra um oponente fixo, sem depender de nível de dificuldade ainda.
  // Persistido via Machine + MachineMember (criável só por ADMIN em POST /battle/machines).
  const machineM1Characters = [
    {
      id: 'machine-m1-char-1', name: 'M1 - Sentinela Ígnea', description: 'Guardiã de treino equipada com poder de fogo básico.',
      ranking: Ranking.DISCRETO, maxRanking: Ranking.CONTINUO, level: 10, xp: 0,
      baseHp: 90, baseAtk: 14, baseDef: 10, baseSpd: 10,
      powerId: fire.id, skillIds: [fireBurst.id, infernalFury.id, thermalExplosion.id, protectiveFlame.id],
      positionRow: 0, positionCol: 0,
    },
    {
      id: 'machine-m1-char-2', name: 'M1 - Sentinela Vetorial', description: 'Guardiã de treino equipada com poder cinético básico.',
      ranking: Ranking.DISCRETO, maxRanking: Ranking.CONTINUO, level: 15, xp: 0,
      baseHp: 95, baseAtk: 13, baseDef: 11, baseSpd: 9,
      powerId: gravity.id, skillIds: [vectorStrike.id, kineticShield.id, shockwave.id, gravitationalAnchor.id],
      positionRow: 0, positionCol: 1,
    },
    {
      id: 'machine-m1-char-3', name: 'M1 - Sentinela Biológica', description: 'Guardiã de treino equipada com poder de regeneração básico.',
      ranking: Ranking.DISCRETO, maxRanking: Ranking.CONTINUO, level: 20, xp: 0,
      baseHp: 100, baseAtk: 9, baseDef: 12, baseSpd: 9,
      powerId: regeneration.id, skillIds: [adaptiveHeal.id, survivalInstinct.id, emergencyMutation.id, defensiveToxin.id],
      positionRow: 1, positionCol: 0,
    },
    {
      id: 'machine-m1-char-4', name: 'M1 - Sentinela Psíquica', description: 'Guardiã de treino equipada com poder de percepção básico.',
      ranking: Ranking.DISCRETO, maxRanking: Ranking.CONTINUO, level: 12, xp: 0,
      baseHp: 85, baseAtk: 12, baseDef: 10, baseSpd: 11,
      powerId: illusion.id, skillIds: [sensoryDistortion.id, mindVeil.id, collectivePanic.id, telepathicSync.id],
      positionRow: 1, positionCol: 1,
    },
  ]

  for (const c of machineM1Characters) {
    await prisma.character.create({
      data: {
        id: c.id, name: c.name, description: c.description, userId: null,
        ranking: c.ranking, maxRanking: c.maxRanking, level: c.level, xp: c.xp,
        baseHp: c.baseHp, baseAtk: c.baseAtk, baseDef: c.baseDef, baseSpd: c.baseSpd,
        powerId: c.powerId,
        skills: { create: c.skillIds.map((skillId) => ({ skillId })) },
      },
    })
  }

  const machineM1 = await prisma.machine.create({
    data: {
      label: 'M1',
      name: 'Sentinelas de Treino',
      members: {
        create: machineM1Characters.map((c) => ({
          characterId: c.id,
          positionRow: c.positionRow,
          positionCol: c.positionCol,
        })),
      },
    },
  })

  console.log('Seed concluído:')
  console.log(`  Usuário demo (ADMIN): ${DEMO_USER_EMAIL} / ${DEMO_USER_PASSWORD}`)
  console.log(`  ${characters.length} personagens no roster (userId: ${user.id})`)
  console.log(`  Campo de batalha: "${volcano.name}" (com modificadores de trait)`)
  console.log(`  Máquina "${machineM1.label}": ${machineM1Characters.length} personagens para GET /battle/machines/${machineM1.label}`)
}

seed()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
