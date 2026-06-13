# Design v2 — Sistema de Batalha, Poderes e Rankings

Este documento detalha todas as mudanças de design decididas para a segunda fase do projeto, com o objetivo de criar batalhas estratégicas onde ranking é potencial, não poder absoluto.

---

## 1. Rankings — Novos Nomes e Nova Filosofia

### Novos nomes (enum `Ranking`)

```
Discreto → Contínuo → Diferenciável → Não-Linear → Singular → Divergente → Caótico
```

### Filosofia: Ranking = Potencial, não Poder

**Regra central:** todos os rankings têm a **mesma taxa de crescimento de stat por nível**. O que diferencia os rankings é exclusivamente o **teto de nível máximo**.

| Ranking | Nível Máximo |
|---|---|
| Discreto | 20 |
| Contínuo | 40 |
| Diferenciável | 60 |
| Não-Linear | 80 |
| Singular | 100 |
| Divergente | 100 |
| Caótico | 100 |

**Taxa de crescimento uniforme:** `base + floor(base × GROWTH_RATE × (level - 1))`  
A constante `GROWTH_RATE` é a mesma para todos os rankings — valor exato a calibrar em testes, sugestão inicial: `0.10` (10% por nível).

**Consequência prática:** um personagem Discreto nível 20 tem os mesmos stats efetivos que um Caótico nível 20. O Caótico apenas pode continuar crescendo até 100.

---

## 2. Pilares de Poder

Cada `Power` pertence a um dos 5 pilares. O pilar define o **tipo de custo** que as skills daquele poder impõem ao usuário.

| Pilar | Descrição | Stat que a skill consome |
|---|---|---|
| **Material** | Manipulação de matéria e energia física | HP |
| **Vetorial** | Manipulação de força, impacto e movimento | ATK |
| **Biológica** | Adaptação, mutação e regeneração orgânica | SPD |
| **Psíquica** | Percepção, emoção, ilusão e influência mental | DEF |
| **Fundamental** | Tempo, Alma, Antimatéria — estruturas profundas da realidade | Definido por skill (qualquer stat, podendo ser múltiplos) |

O custo de cada skill é fixo e definido pelo admin no momento da criação. O pilar indica qual "categoria" de stat será consumida, mas o valor exato depende da skill.

---

## 3. Sistema de Custo como Debuff

Skills não custam mana nem energia. Em vez disso, usar uma skill **impõe um debuff temporário de stat** no próprio personagem.

### Campos na skill

| Campo | Tipo | Descrição |
|---|---|---|
| `debuffStat` | `StatType` | Qual stat é reduzido (HP, ATK, DEF, SPD) |
| `debuffValue` | `Float` | Quanto é reduzido (valor absoluto) |
| `debuffDuration` | `Int` | Quantos turnos o debuff dura |

### Exemplo

```
Skill: "Pulso de Calor" (Material)
debuffStat: HP
debuffValue: 30
debuffDuration: 2
```

Ao usar, o personagem perde 30 de HP imediatamente por 2 turnos (após esses turnos, o HP retorna ao valor anterior ao debuff).

### Skills Fundamentais

O admin define explicitamente quais stats são consumidos. Uma skill Fundamental pode consumir múltiplos stats ao mesmo tempo — é o único pilar com essa capacidade, refletindo o custo imprevisível de manipular a lógica da realidade.

---

## 4. Dual Power — Dois Poderes por Personagem

Um personagem pode ter até **2 poderes** simultaneamente.

### Regra de custo

Personagens com dual power pagam um **multiplicador global de 1.25×** em todos os seus custos de debuff.

**Exemplo:**
- Skill "Pulso de Calor" normalmente custa 30 HP por 2 turnos
- Em um personagem com dual power: `30 × 1.25 = 37.5` → arredondado para 38 HP por 2 turnos

O multiplicador é aplicado na engine em runtime — não muda o valor base da skill no banco.

### Validação

- Máximo 2 poderes por personagem (validado no use case)
- `powerId` = poder primário (obrigatório)
- `secondaryPowerId` = poder secundário (opcional)

---

## 5. Sistema de Despertar

Personagens podem despertar seu poder primário em uma forma mais avançada.

### Quem pode despertar

Definido no modelo `Power` com o campo `canAwaken: Boolean`. Exemplo:
- Fogo → pode despertar
- Tempo → não pode despertar

### Como funciona

1. O personagem atinge o **nível 40**
2. A cada nível múltiplo de 5 a partir daí (40, 45, 50, 55...) há uma **chance de despertar**
3. A chance % é fixa e calibrada depois (sugestão inicial: 15%)
4. Se despertar: o sistema escolhe **aleatoriamente** uma das formas possíveis do poder

**Exemplo:** Fogo pode despertar para Magma ou Plasma. O resultado é sorteado na hora.

### O que muda com o despertar

- O personagem ganha acesso a **skills exclusivas** da forma despertada
- Skills anteriores do poder base **permanecem disponíveis**
- O pilar **não muda** (Fogo é Material → Magma continua sendo Material)
- A forma despertada é **permanente** — não há como reverter

### Modelo de dados

```
Power (Fogo) → canAwaken: true
  └── PowerAwakening → awakenedPower: Power (Magma)
  └── PowerAwakening → awakenedPower: Power (Plasma)

Character
  └── powerId: "fogo-id"
  └── awakenedPowerId: null        ← antes do despertar
  └── awakenedPowerId: "magma-id"  ← após o despertar
```

---

## 6. Campos de Batalha (Resumo — já implementado)

- Toda batalha começa com um **BattleField aleatório** que dura até o fim
- Skills podem ativar um novo campo mid-battle via `appliesBattleFieldId` + `fieldDuration` (turnos)
- Quando `fieldDuration` expira, retorna ao campo anterior
- `BattleFieldModifier` aplica buffs/debuffs de stat baseados nas traits dos personagens

---

## 7. Mudanças no Schema

### Enum `Ranking` — renomear valores

```prisma
enum Ranking {
  DISCRETO
  CONTINUO
  DIFERENCIAVEL
  NAO_LINEAR
  SINGULAR
  DIVERGENTE
  CAOTICO
}
```

### Novo enum `Pillar`

```prisma
enum Pillar {
  MATERIAL
  VETORIAL
  BIOLOGICA
  PSIQUICA
  FUNDAMENTAL
}
```

### Model `Power` — adicionar pilar e despertar

```prisma
model Power {
  id               String           @id @default(cuid())
  name             String           @unique
  description      String
  pillar           Pillar
  canAwaken        Boolean          @default(false)
  skills           Skill[]
  primaryCharacters    Character[]  @relation("PrimaryPower")
  secondaryCharacters  Character[]  @relation("SecondaryPower")
  awakenedCharacters   Character[]  @relation("AwakenedPower")
  awakeningTargets     PowerAwakening[] @relation("BaseAwakening")
  awakeningSourceOf    PowerAwakening[] @relation("AwakenedResult")
  createdAt        DateTime         @default(now())
}
```

### Novo model `PowerAwakening`

```prisma
model PowerAwakening {
  id              String @id @default(cuid())
  basePowerId     String
  awakenedPowerId String
  basePower       Power  @relation("BaseAwakening", fields: [basePowerId], references: [id])
  awakenedPower   Power  @relation("AwakenedResult", fields: [awakenedPowerId], references: [id])

  @@unique([basePowerId, awakenedPowerId])
}
```

### Model `Skill` — substituir `cost` por campos de debuff

```prisma
model Skill {
  // remover: cost Int
  debuffStat      StatType
  debuffValue     Float
  debuffDuration  Int
  // resto permanece igual
}
```

### Model `Character` — dual power + despertar

```prisma
model Character {
  // manter powerId como poder primário
  secondaryPowerId String?
  awakenedPowerId  String?

  power          Power  @relation("PrimaryPower", fields: [powerId], references: [id])
  secondaryPower Power? @relation("SecondaryPower", fields: [secondaryPowerId], references: [id])
  awakenedPower  Power? @relation("AwakenedPower", fields: [awakenedPowerId], references: [id])

  // remover: growthRate (agora é constante global na engine)
}
```

---

## 8. Constante Global na Engine

O `GROWTH_RATE` deixa de ser por ranking e passa a ser uma constante no código da engine de batalha:

```typescript
const GROWTH_RATE = 0.10 // 10% por nível — calibrar com testes
```

Stats efetivos calculados na engine: `base + Math.floor(base * GROWTH_RATE * (level - 1))`

---

## 9. Passo a Passo de Implementação

### Fase 1 — Schema e Banco (fundação, sem lógica de negócio)

1. **Renomear enum `Ranking`** no schema e criar migration
2. **Adicionar enum `Pillar`** ao schema
3. **Atualizar model `Power`** — adicionar `pillar`, `canAwaken`, relações de despertar
4. **Criar model `PowerAwakening`** — tabela de possíveis despertares
5. **Atualizar model `Skill`** — remover `cost`, adicionar `debuffStat`, `debuffValue`, `debuffDuration`
6. **Atualizar model `Character`** — adicionar `secondaryPowerId`, `awakenedPowerId`, remover `growthRate` se existir
7. Rodar `npm run db:migrate` e `npm run db:generate`

### Fase 2 — Entidades de Domínio

8. Atualizar entidade `Character` (dual power, sem growthRate)
9. Atualizar entidade `Skill` (novos campos de debuff)
10. Atualizar entidade `Power` (pilar, canAwaken)
11. Criar entidade `PowerAwakening`

### Fase 3 — Repositórios e Mappers

12. Atualizar `prisma-character-mapper` (secondaryPowerId, awakenedPowerId)
13. Atualizar `prisma-skill-mapper` (debuffStat, debuffValue, debuffDuration)
14. Atualizar `prisma-power-mapper` (pillar, canAwaken)
15. Criar `prisma-power-awakening-repository` e mapper
16. Criar `in-memory-power-awakening-repository` (testes)
17. Atualizar repositório de Character para queries com dual power

### Fase 4 — Use Cases

18. **`create-power`** — validar que `pillar` é obrigatório
19. **`create-skill`** — usar novos campos de debuff em vez de `cost`
20. **`create-character`** — aceitar `secondaryPowerId` opcional; validar max 2 powers
21. **`gain-xp`** — adicionar lógica de verificação de despertar (nível >= 40, múltiplo de 5, `canAwaken`, chance aleatória)
22. **`awaken-character`** — use case de despertar (sorteia entre `PowerAwakening` do poder base)

### Fase 5 — Controllers e Rotas

23. Atualizar `create-character` controller (secondaryPowerId no body)
24. Atualizar `create-skill` controller (campos de debuff)
25. Atualizar `create-power` controller (pillar no body)
26. Adicionar rota e factory para `awaken-character` se necessário expor endpoint

### Fase 6 — Engine de Batalha

27. **`BattleEngine`** — serviço puro TypeScript em `src/use-cases/Battle/`
    - Calcula stats efetivos com `GROWTH_RATE` uniforme
    - Aplica modificadores do BattleField (por trait)
    - Aplica multiplicador 1.25× de dual power no debuff
    - Ordena ação por SPD efetivo
    - Seleciona skill com base na lógica de prioridade
    - Aplica debuffs e remove ao expirar
    - Retorna log turno a turno
28. **`POST /battles`** — controller que recebe team1[], team2[], battleFieldId, executa engine e retorna log
29. **`GET /characters/roster/:userId`** — lista os personagens do roster de um usuário para montar times