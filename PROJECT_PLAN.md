# Planejamento do Projeto: Duelos 4x4 e Worldbuilding

Este documento reúne todas as decisões tomadas, regras confirmadas e o roteiro de desenvolvimento para a evolução do projeto. O objetivo principal é estruturar o backend seguindo as melhores práticas de engenharia e criar uma simulação de batalha estratégica.

---

## 🛠️ Passo 1: A Jornada de Engenharia e Arquitetura (Production Ready)

Antes de programar as mecânicas do jogo, vamos preparar a estrutura de diretórios e o ambiente de desenvolvimento do projeto:

1.  **Refatoração da Estrutura:** Garantir que o projeto siga os padrões de Clean Architecture de forma escalável (Controllers, Use Cases, Repositories).
2.  **Configuração de Testes com Vitest:**
    *   Instalar o Vitest para rodar testes rápidos em TypeScript/ESM.
    *   Criar o diretório de testes e planejar testes automatizados para as regras de negócio e de combate.
3.  **Ambiente Docker:** Utilizar o container PostgreSQL existente no `docker-compose.yml` para desenvolvimento local.
4.  **Sistema de Seeds (`prisma/seed.ts`):** Criar um script para povoar o banco local com personagens iniciais, poderes e habilidades para facilitar os testes manuais e automatizados.

---

## ⚔️ Passo 2: Regras de Negócio e Gestão de Personagens

Com a arquitetura preparada, implementaremos as regras do elenco de personagens de cada jogador:

1.  **Limite de Roster (Elenco de 8):**
    *   Cada usuário pode possuir no máximo **8 personagens** ativos em sua coleção.
    *   A validação será feita na camada de Use Case antes de associar um novo personagem a um jogador.
2.  **Níveis e Experiência (XP):**
    *   Curva de subida de nível: $\text{XP Necessário} = \text{Nível Atual} \times 100$.
    *   Subir de nível aumenta proporcionalmente os atributos: `HP`, `Ataque`, `Defesa` e `Velocidade`.
3.  **Potencial e Ascensão de Ranking:**
    *   Cada personagem começa em `MORTAL` e tem um `maxRanking` (seu potencial limite).
    *   Os rankings limitam o nível máximo: Mortal (20), Desbravador (40), Herói (60), Épico (80), Lendário+ (100).
    *   **Confirmado:** Ao realizar a ascensão para o próximo ranking, o personagem **mantém seu nível atual** (ex: continua nível 20 e agora pode subir até 40).

---

## 🗺️ Passo 3: Campos de Batalha (Características)

1.  **Características dos Personagens:** Lista de tags de texto que definem as propriedades físicas ou de combate do personagem (ex: `"Voador"`, `"Espadachim"`, `"Sombrio"`).
2.  **Modificadores de Campo:** Os cenários de combate aplicarão buffs e debuffs de atributos olhando diretamente para essas características (ex: campo montanhoso bufando personagens voadores).
3.  *Observação:* A modelagem exata de armazenamento das características (se array nativo `String[]` do Postgres ou tabela separada) e as mudanças estruturais de habilidades (`Skill.cost` para `Int`) serão definidas quando iniciarmos esta etapa.

---

## 🔌 Passo 4: Desenvolvimento da Engine de Combate (4v4)

1.  **Engine de Combate em Memória:** Criar um serviço puro em TypeScript (`BattleEngine`) que simulará o duelo turnos a turnos baseando-se na velocidade, atributos recalculados e modificadores de campo dos personagens em jogo.
2.  **Endpoints da API:**
    *   `POST /battles` - Envia dois times de 4 personagens ativos e retorna o log detalhado do combate até a vitória de um dos times.
    *   Rotas para gerenciar a coleção de 8 personagens do usuário (listar, adquirir e treinar/subir nível).
