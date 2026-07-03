import 'dotenv/config'
import {
  BonusType,
  Pillar,
  Ranking,
  StatType,
  TargetType,
} from '../src/generated/prisma'
import { prisma } from '../src/config/prisma'
import { BcryptHasher } from '../src/repositories/cryptography/bcrypt-hasher'

const DEMO_USER_EMAIL = 'demo@duelos.com'
const DEMO_USER_PASSWORD = 'demo1234'

async function resetDemoData() {
  await prisma.battleParticipant.deleteMany()
  await prisma.battleTeam.deleteMany()
  await prisma.battle.deleteMany()
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
    data: { name: 'Magma', description: 'Forma desperta de Piroquinese — rocha fundida e destrutiva.', pillar: Pillar.MATERIAL },
  })
  const plasma = await prisma.power.create({
    data: { name: 'Plasma', description: 'Forma desperta de Piroquinese — energia ionizada pura.', pillar: Pillar.MATERIAL },
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

  const characters = [
    {
      name: 'Ignis', description: 'Piroquinésico veterano, quase imune ao próprio fogo.',
      ranking: Ranking.CONTINUO, maxRanking: Ranking.CAOTICO, level: 20, xp: 0,
      baseHp: 120, baseAtk: 22, baseDef: 14, baseSpd: 16,
      powerId: fire.id, traitIds: [heatResistance.id], skillIds: [fireBurst.id, thermalExplosion.id],
    },
    {
      name: 'Vulcana', description: 'Discípula de Ignis, começando a explorar um segundo poder.',
      ranking: Ranking.DISCRETO, maxRanking: Ranking.SINGULAR, level: 5, xp: 0,
      baseHp: 90, baseAtk: 15, baseDef: 10, baseSpd: 12,
      powerId: fire.id, secondaryPowerId: gravity.id, traitIds: [heatResistance.id], skillIds: [fireBurst.id],
    },
    {
      name: 'Gravus', description: 'Especialista em impacto cinético de longo alcance.',
      ranking: Ranking.DIFERENCIAVEL, maxRanking: Ranking.NAO_LINEAR, level: 10, xp: 0,
      baseHp: 130, baseAtk: 18, baseDef: 16, baseSpd: 9,
      powerId: gravity.id, traitIds: [], skillIds: [vectorStrike.id, shockwave.id],
    },
    {
      name: 'Tectra', description: 'Ainda aprendendo a controlar a própria força vetorial.',
      ranking: Ranking.DISCRETO, maxRanking: Ranking.CONTINUO, level: 3, xp: 0,
      baseHp: 100, baseAtk: 12, baseDef: 12, baseSpd: 10,
      powerId: gravity.id, traitIds: [], skillIds: [vectorStrike.id],
    },
    {
      name: 'Vitalis', description: 'Curandeira biológica com regeneração acelerada.',
      ranking: Ranking.CONTINUO, maxRanking: Ranking.DIVERGENTE, level: 8, xp: 0,
      baseHp: 140, baseAtk: 10, baseDef: 13, baseSpd: 11,
      powerId: regeneration.id, traitIds: [], skillIds: [adaptiveHeal.id, emergencyMutation.id],
    },
    {
      name: 'Symbion', description: 'Organismo simbiótico em estágio inicial de adaptação.',
      ranking: Ranking.DISCRETO, maxRanking: Ranking.SINGULAR, level: 4, xp: 0,
      baseHp: 110, baseAtk: 9, baseDef: 11, baseSpd: 10,
      powerId: regeneration.id, traitIds: [], skillIds: [adaptiveHeal.id],
    },
    {
      name: 'Mentis', description: 'Manipuladora de percepção, evita o calor direto.',
      ranking: Ranking.DIFERENCIAVEL, maxRanking: Ranking.CAOTICO, level: 12, xp: 0,
      baseHp: 95, baseAtk: 16, baseDef: 12, baseSpd: 14,
      powerId: illusion.id, traitIds: [heatWeakness.id], skillIds: [sensoryDistortion.id, collectivePanic.id],
    },
    {
      name: 'Chronos', description: 'Guardião do fluxo temporal — poder que nunca desperta.',
      ranking: Ranking.NAO_LINEAR, maxRanking: Ranking.SINGULAR, level: 20, xp: 0,
      baseHp: 105, baseAtk: 17, baseDef: 15, baseSpd: 18,
      powerId: time.id, traitIds: [heatWeakness.id], skillIds: [temporalDistortion.id, rewind.id],
    },
  ]

  for (const c of characters) {
    await prisma.character.create({
      data: {
        name: c.name, description: c.description, userId: user.id,
        ranking: c.ranking, maxRanking: c.maxRanking, level: c.level, xp: c.xp,
        baseHp: c.baseHp, baseAtk: c.baseAtk, baseDef: c.baseDef, baseSpd: c.baseSpd,
        powerId: c.powerId, secondaryPowerId: c.secondaryPowerId ?? null,
        traits: { connect: c.traitIds.map((id) => ({ id })) },
        skills: { create: c.skillIds.map((skillId) => ({ skillId })) },
      },
    })
  }

  console.log('Seed concluído:')
  console.log(`  Usuário demo: ${DEMO_USER_EMAIL} / ${DEMO_USER_PASSWORD}`)
  console.log(`  ${characters.length} personagens no roster (userId: ${user.id})`)
  console.log(`  Campo de batalha: "${volcano.name}" (com modificadores de trait)`)
}

seed()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
