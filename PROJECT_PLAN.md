# Planejamento do Projeto: Duelos 4x4 e Worldbuilding

Este documento reúne todas as decisões tomadas, regras confirmadas e o roteiro de desenvolvimento para a evolução do projeto. O objetivo principal é estruturar o backend seguindo as melhores práticas de engenharia e criar uma simulação de batalha estratégica.

---

## ✅ Passo 1: A Jornada de Engenharia e Arquitetura (Production Ready)

- Refatoração para Clean Architecture (Controllers, Use Cases, Repositories)
- Vitest configurado com testes unitários (in-memory) e E2E (Supertest + banco real)
- PostgreSQL via Docker (`docker-compose.yml`, container `origin-pg`)
- Sistema de fábricas manual em `controllers/<Dominio>/factories/`

---

## ✅ Passo 2: Regras de Negócio e Gestão de Personagens

- **Roster de 8:** validação no use case `acquire-character`
- **Swap:** troca de personagem no roster via `swap-character`
- **XP e Level Up:** `gain-xp` com curva `nível × 100`, transbordamento de XP, teto por ranking
- **Stats efetivos:** calculados em runtime — `base + floor(base × growthRate × (level - 1))`
- **Rankings e ascensão:** MORTAL → ANCESTRAL, personagem mantém nível ao ascender
- **Traits em personagens:** `assign-trait` associa traits ao personagem

> `breakthroughAttempts` está no schema mas não será implementado por ora — mecânica ainda indefinida.

---

## ✅ Passo 3: Campos de Batalha

- **Traits (`Trait`):** tags de texto com nome e descrição, associadas a personagens e skills
- **BattleField:** cenário de combate com nome e descrição (`create-battle-field`, `fetch-battle-field`)
- **BattleFieldModifier:** cada campo tem modificadores por trait — `stat` (HP/ATK/DEF/SPD), `bonusType` (PERCENT/FLAT) e `bonusValue`
- **Skills com campo:** `appliesBattleFieldId` e `fieldDuration` permitem que uma skill ative um campo durante a batalha
- **Fetch de skills:** retorna `battleField` e `fieldDuration` associados

---

## 🔄 Passo 4: Engine de Combate (4v4)

### O que precisa ser construído

1. **`BattleEngine` (serviço puro em TypeScript)**
   - Recebe dois times de 4 personagens + um `BattleField` ativo
   - Calcula stats efetivos de cada personagem (base + crescimento por ranking)
   - Aplica modificadores do campo baseado nas traits de cada personagem
   - Simula turnos ordenados por SPD (maior SPD age primeiro)
   - Skills têm custo (mana/energia) e limitação — devem ser usadas quando disponíveis
   - Retorna log detalhado turno a turno + resultado final

2. **Endpoints**
   - `POST /battles` — recebe `team1[]`, `team2[]` (IDs de personagens) e `battleFieldId`, retorna o log completo
   - `GET /characters/roster/:userId` — lista os 8 personagens do roster de um usuário (para montar times)

3. **Questões a definir antes de implementar:**
   - Como o BattleField entra na batalha? Fixo ao criar a batalha, ou pode mudar durante por skills?
   - Skills têm custo em quê? (mana, energia, turnos de recarga?) — o campo `cost: Int` existe mas a mecânica ainda não foi definida
   - Qual o critério de uso de skill por parte da engine? (Sempre que disponível? Aleatoriedade?)
   - Personagens morrem ao chegar em 0 HP ou saem de campo?

---

## ⬜ Passo 5: Autenticação JWT

- Rota `POST /auth/login` — já existe `authenticate-user` use case e controller, falta rota protegida
- Middleware `authenticate.ts` já existe em `src/middlewares/`
- Aplicar middleware nas rotas que exigem usuário autenticado (acquire, swap, battles)

---

## Fluxo de dependências do domínio

```
Trait → BattleFieldModifier → BattleField
Trait → Skill (requiredTraits)
Power → Skill → Character (via CharacterSkill)
BattleField + Character[] → BattleEngine → BattleLog
```
