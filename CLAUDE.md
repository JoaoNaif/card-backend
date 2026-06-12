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
MORTAL → DESBRAVADOR → HEROI → EPICO → LENDARIO → MITICO → ANCESTRAL
```
Cada ranking define o nível máximo do personagem: Mortal (20), Desbravador (40), Herói (60), Épico (80), Lendário+ (100). Na ascensão, o personagem **mantém o nível atual**.

### XP e Nível
- XP necessário = `nível atual × 100` — XP excedente transborda para o próximo nível
- Base stats são imutáveis; stats efetivos calculados em runtime: `base + floor(base × growthRate × (level - 1))`
- Taxa de crescimento por ranking: Mortal 8%, Desbravador 11%, Herói 15%, Épico 20%, Lendário 26%, Mítico 33%, Ancestral 42%
- Teto de nível por ranking: Mortal 20, Desbravador 40, Herói 60, Épico 80, Lendário/Mítico/Ancestral 100
- Ao atingir o teto do ranking, XP é descartado até o personagem ascender de ranking

### Regras de Negócio Planejadas
- Roster limitado a **8 personagens** por usuário ✅
- Engine de combate 4v4 em memória com log de turnos
- Campos de batalha com buffs/debuffs baseados em traits dos personagens

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
3. 🔄 Campos de batalha (traits em personagens, modificadores de cenário)
4. ⬜ Engine de combate 4v4 + endpoints `/battles`
5. ⬜ Autenticação JWT (rota `/auth/login`, middleware de proteção de rotas)
