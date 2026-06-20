# Contexto do Projeto: Duelos 4x4 & Worldbuilding

Backend de um sistema de batalhas estratégicas 4v4 com gerenciamento de personagens, poderes e habilidades. O projeto serve tanto como aprendizado quanto portfólio, mas com arquitetura pensada para produção (Clean Architecture, testes, etc.).

---

## Stack e Tecnologias

- **Runtime**: Node.js com TypeScript (ESM, `"type": "module"`)
- **Framework**: Express 5
- **ORM**: Prisma 7 com PostgreSQL
- **Banco local**: PostgreSQL via Docker (`docker-compose.yml`, container `origin-pg`)
- **Testes**: Vitest (unit + E2E com Supertest)
- **Validação**: Zod + zod-validation-error
- **Auth**: JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) — login ainda não implementado, planejado
- **Dev server**: `tsx watch`

---

## Arquitetura

Clean Architecture em três camadas principais:

```
src/
├── core/           # Utilitários compartilhados (Either, Entity base, erros)
├── entities/       # Entidades de domínio (puras, sem dependência de infra)
├── use-cases/      # Regras de negócio — uma pasta por domínio
├── repositories/
│   ├── interface/  # Contratos (interfaces TypeScript)
│   ├── prisma/     # Implementações com Prisma (produção)
│   └── test/       # In-memory repositories (testes unitários)
├── controllers/    # HTTP handlers — uma pasta por domínio
│   └── _pipe/      # Zod validation pipe compartilhado
├── routes/         # Definição de rotas Express
└── config/         # Configuração do Prisma client
```

### Injeção de Dependência

Cada controller tem uma factory em `controllers/<Dominio>/factories/` que instancia as dependências manualmente (sem container IoC). Exemplo:

```
make-create-user-controller.ts → instancia PrismaUserRepository + BcryptHasher + CreateUserUseCase + CreateUserController
```

---

## Padrões e Convenções

### Either Pattern
Todos os use cases **devem** retornar `Either<ErroEsquerdo, SucessoDireito>` — não use `throw` para erros de negócio. O tipo está em `src/core/either.ts`.

### Nomenclatura de Arquivos
- Kebab-case para arquivos: `create-user.ts`, `make-create-user-controller.ts`
- PascalCase para classes: `CreateUserUseCase`, `PrismaUserRepository`
- Specs junto ao arquivo alvo: `create-user.spec.ts` ao lado de `create-user.ts`

### Erros de Domínio
Ficam em `src/core/error/err/`. Erros existentes:
- `ResourceAlreadyExistError` — recurso já existe
- `NotFoundError` — recurso não encontrado

---

## Domínio do Jogo

### Modelos Principais

| Entidade   | Descrição                                                 |
|------------|-----------------------------------------------------------|
| `User`     | Jogador com email/senha. Tem até 8 personagens no roster  |
| `Character`| Personagem com ranking, poder e dono (User opcional)      |
| `Power`    | Poder base de um personagem, agrupa Skills                |
| `Skill`    | Habilidade associada a um Power (tem custo e limitação)   |

### Ranking (enum `Ranking`)
```
DISCRETO → CONTINUO → DIFERENCIAVEL → NAO_LINEAR → SINGULAR → DIVERGENTE → CAOTICO
```
Ranking = **potencial**, não poder. Define apenas o teto de nível — não a força atual.

| Ranking | Nível Máximo |
|---|---|
| DISCRETO | 20 |
| CONTINUO | 40 |
| DIFERENCIAVEL | 60 |
| NAO_LINEAR | 80 |
| SINGULAR / DIVERGENTE / CAOTICO | 100 |

### XP e Nível
- XP necessário = `nível atual × 100` — XP excedente transborda para o próximo nível
- Taxa de crescimento **uniforme para todos os rankings**: `base + floor(base × GROWTH_RATE × (level - 1))`
- `GROWTH_RATE` é constante global na engine (valor inicial sugerido: 0.10 — calibrar com testes)
- Ao atingir o teto do ranking, XP é descartado até o personagem ascender de ranking

### Pilares de Poder (enum `Pillar`)
Cada `Power` pertence a um pilar que define o stat consumido pelas suas skills:

| Pilar | Stat consumido pela skill |
|---|---|
| MATERIAL | HP |
| VETORIAL | ATK |
| BIOLOGICA | SPD |
| PSIQUICA | DEF |
| FUNDAMENTAL | Qualquer stat — definido por skill (pode ser múltiplos) |

### Custo de Skill como Debuff
Skills não custam energia. Usar uma skill impõe debuff temporário no próprio personagem:
- `debuffStat` — qual stat é reduzido
- `debuffValue` — quanto é reduzido (valor absoluto)
- `debuffDuration` — quantos turnos dura o debuff

### Dual Power
- Personagem pode ter até 2 poderes (`powerId` + `secondaryPowerId`)
- Multiplicador global: todos os debuffs de skill custam **1.25×** para personagens com dual power
- Validado no use case: máximo 2 poderes por personagem

### Sistema de Despertar
- Definido no `Power`: `canAwaken: Boolean` — não todo poder desperta (ex: Tempo não desperta)
- Janela: nível 20+, verificado a cada 5 níveis (20, 25, 30...)
- Chance aleatória por verificação (valor a calibrar, sugestão: 15%)
- Forma despertada sorteada entre as possíveis (`PowerAwakening` table)
- Exemplo: Fogo → Magma ou Plasma (sorteado)
- Despertar é permanente, desbloqueia skills exclusivas, pilar não muda

### Regras de Negócio Planejadas
- Roster limitado a **8 personagens** por usuário ✅
- Engine de combate 4v4 em memória com log de turnos
- Campos de batalha com buffs/debuffs baseados em traits dos personagens

### Regras de Campo de Batalha (Confirmadas)
- Toda batalha começa com um **BattleField padrão aleatório** — sem limite de turno, dura até o fim da batalha
- Skills podem mudar o campo ativo mid-battle via `appliesBattleFieldId` + `fieldDuration` (em turnos)
- Quando `fieldDuration` expira, retorna ao campo anterior (a definir: campo inicial ou o padrão?)
- **Eliminação:** personagem com 0 HP está derrotado e sai permanentemente da batalha
- `breakthroughAttempts` existe no schema mas a mecânica ainda não foi definida — não implementar por ora

---

## Testes

### Estratégia
| Tipo   | Escopo           | Repositório    | Ferramenta          |
|--------|------------------|----------------|---------------------|
| Unit   | Use cases        | In-memory      | Vitest              |
| E2E    | Controllers/HTTP | Banco real (PG)| Vitest + Supertest  |

### Executar testes
```bash
npm test           # roda todos uma vez
npm run test:watch # modo watch
```

O arquivo `.env.test` é carregado automaticamente pelo `vitest.config.ts`.

---

## Comandos Úteis

```bash
npm run dev          # servidor de desenvolvimento (porta padrão 3333)
npm test             # vitest run
npm run db:migrate   # aplica migrations no banco
npm run db:reset     # reseta banco e reaplica migrations
npm run db:generate  # gera o Prisma Client (após alterar schema.prisma)
```

### Docker (banco local)
```bash
docker compose up -d   # sobe o PostgreSQL na porta 5432
```
Credenciais: `postgres/docker`, banco: `origin`

---

## Roadmap (PROJECT_PLAN.md)

1. ✅ Clean Architecture + Vitest + Docker
2. ✅ Regras de personagens (roster, XP/level up, Either em todos os use cases)
3. ✅ Campos de batalha (traits em personagens, modificadores de cenário)
4. ⬜ Schema v2 (ranking renomeado, pilares, debuff, dual power, despertar) → depois engine de combate 4v4 + endpoints `/battles`
5. ⬜ Autenticação JWT (rota `/auth/login`, middleware de proteção de rotas)
