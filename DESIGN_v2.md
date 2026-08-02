# Design — Sistema de Aquisição de Personagens (Leilão em Tempo Real)

> Este documento substitui a versão anterior do `DESIGN_v2.md` (rankings, pilares, debuff, dual power, despertar), que já está totalmente implementada no schema atual — ver `CLAUDE.md`, item 4 do roadmap (✅ Schema v2). A partir daqui o arquivo passa a documentar a próxima frente de design: **como um jogador adquire um personagem**.

---

## 1. Contexto e Problema

Hoje não existe nenhum caminho para um `Character` sair do "estoque" (`userId: null`) e passar a pertencer a um `User`. O admin cria personagens, mas eles ficam sem dono para sempre. Como cada personagem é **único** (`name @unique`, sem duplicatas), qualquer forma de aquisição precisa lidar com concorrência: só um jogador pode ficar com aquele personagem.

## 2. Ideia Central: Leilão em Tempo Real

O admin cria um personagem e o disponibiliza em leilão. Jogadores dão lances em tempo real durante uma janela de tempo definida. Ao final, quem deu o maior lance fica com o personagem; o valor é debitado da sua carteira e os lances perdedores são devolvidos.

**Por que tempo real (WebSocket) em vez de só REST com timestamp de fechamento:** além de ser mais fiel à experiência de leilão (ver lances subindo ao vivo, reagir na hora), é um exercício de aprendizado que antecipa a Fase 6C (PvP), que já está no roadmap com Socket.io. Implementar o leilão primeiro é uma forma de validar essa infraestrutura de WebSocket num contexto mais simples (sem a complexidade de um motor de batalha) antes de usá-la no PvP.

## 3. Escopo Restrito por Ranking

Leilão vale **só para os rankings mais altos** — reforça a escassez que o próprio sistema de `Ranking` já define, em vez de criar uma escassez paralela.

| Ranking | Via leilão? |
|---|---|
| Discreto / Contínuo / Diferenciável / Não-Linear | Não — forma de aquisição a definir em outro momento (compra direta, recompensa de progressão, etc.) |
| Singular / Divergente / Caótico | **Sim** |

A forma de aquisição dos ranks baixos fica fora do escopo deste documento.

## 4. Pré-requisitos (bloqueadores atuais)

Nenhum destes existe hoje — precisam ser resolvidos **antes** de detalhar schema e use cases do leilão:

1. **Sistema de moeda** — não há `Wallet`/saldo em nenhum lugar do schema. Precisa existir uma entidade de saldo por `User` e um jeito transacional de debitar/creditar.
2. **Sistema de recompensa** — de onde a moeda nasce. O candidato natural é o **Auto Battle (Fase 6A)**, ainda não implementado: batalhas vencidas geram moeda. Sem isso, a economia do leilão não tem fonte.

Ou seja: o leilão depende, na prática, da Fase 6A já estar de pé.

## 5. Conceito de Funcionamento (rascunho)

1. Admin cria um `AuctionListing` para um `Character` (rank Singular/Divergente/Caótico), define lance inicial e duração.
2. Leilão abre — jogadores se conectam via WebSocket à sala do leilão.
3. Jogador envia lance (`bid:place`); servidor valida:
   - saldo suficiente na carteira
   - lance maior que o lance atual (+ incremento mínimo, a definir)
4. Servidor confirma o lance a todos os conectados (`bid:update`) e reserva o valor do saldo do jogador (escrow), liberando a reserva anterior do jogador que foi superado.
5. Ao expirar o tempo, servidor fecha o leilão (`auction:closed`): transfere o `Character` para o vencedor (`userId`), debita definitivamente o saldo dele, devolve as reservas de todos os outros lances.

## 6. Perguntas em Aberto (a decidir antes de implementar)

- **Anti-sniping:** lance nos últimos N segundos estende o leilão automaticamente? (comum em leilões reais para evitar lance de última hora sem chance de resposta)
- **Incremento mínimo de lance:** valor fixo ou percentual sobre o lance atual?
- **Escrow:** reservar o saldo no momento do lance (mais seguro, evita lance sem fundo) ou só validar/debitar no fechamento?
- **Auto-bid** (jogador define um teto e o sistema cobre automaticamente até esse valor): fica para uma iteração futura ou entra já na v1?
- **Leilão sem lances:** o que acontece? Volta pro estoque? Reabre com lance inicial menor?
- **Concorrência no servidor:** lances quase simultâneos precisam de lock/transação atômica no banco para não haver dois "maiores lances" ao mesmo tempo.

## 7. Esboço de Schema (rascunho — não implementar ainda)

```prisma
model Wallet {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  balance   Int      @default(0)
  updatedAt DateTime @updatedAt
}

model AuctionListing {
  id           String        @id @default(cuid())
  characterId  String        @unique
  character    Character     @relation(fields: [characterId], references: [id])
  startingBid  Int
  currentBid   Int
  currentBidUserId String?
  status       AuctionStatus @default(OPEN) // OPEN | CLOSED | CANCELLED
  opensAt      DateTime
  closesAt     DateTime
  bids         Bid[]
  createdAt    DateTime      @default(now())
}

model Bid {
  id        String         @id @default(cuid())
  auctionId String
  auction   AuctionListing @relation(fields: [auctionId], references: [id])
  userId    String
  amount    Int
  createdAt DateTime       @default(now())
}
```

Isso é só um ponto de partida para discussão — nomes, campos e a necessidade de uma tabela de "reserva" separada do `Bid` histórico ainda precisam ser validados quando formos implementar de fato.

## 8. Ordem Sugerida de Implementação (alto nível, a refinar)

1. **Sistema de moeda** (`Wallet` + operações transacionais de crédito/débito)
2. **Sistema de recompensa** ligado à Fase 6A (Auto Battle) — batalha vencida gera moeda
3. **Leilão** propriamente dito — listings, lances via WebSocket, fechamento e transferência de personagem

## 9. Fora de Escopo por Ora

- Leilão para ranks baixos (Discreto até Não-Linear)
- Auto-bid
- Qualquer forma de troca/marketplace entre jogadores (personagem trocado diretamente, sem leilão)

---

**Status:** 🟡 Ideia validada. Falta resolver os pré-requisitos (moeda + recompensa) antes de fechar o schema e os use cases definitivos do leilão.
