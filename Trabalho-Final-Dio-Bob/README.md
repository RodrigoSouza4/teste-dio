# 🚀 DIO Explorer — Trabalho Final com IBM Bob

> Projeto desenvolvido durante o bootcamp da **DIO (Digital Innovation One)** utilizando o **IBM Bob** como assistente de IA para construção completa de um ecossistema de aprendizado interativo.

---

## 📋 Índice

1. [Visão Geral do Projeto](#visão-geral)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Prompts Utilizados](#prompts-utilizados)
4. [Slash Commands](#slash-commands)
5. [Testes Unitários](#testes-unitários)
6. [MCP Server](#mcp-server)
7. [Modos de Uso](#modos-de-uso)
8. [Dicas de Uso do IBM Bob](#dicas-de-uso-do-ibm-bob)
9. [Insights para Futuros Profissionais](#insights-para-futuros-profissionais)

---

## Visão Geral

O **DIO Explorer** é um projeto que demonstra como usar o **IBM Bob** para construir, do zero, um sistema completo de plataforma educacional com:

- 📚 **Base de dados de trilhas** em JSON com 11+ trilhas tecnológicas
- ⚡ **Slash Commands** personalizados para consultas rápidas no chat
- 🧪 **Testes unitários** automatizados em Python (45 testes, 100% aprovação)
- 🌐 **Servidor MCP** em TypeScript com suporte a stdio, HTTP, API Key e SSO

---

## Estrutura de Arquivos

```
Trabalho-Final-Dio-Bob/
├── .bobignore                          ← Arquivos ignorados pelo Bob
├── README.md                           ← Este arquivo
├── .bob/
│   ├── mcp.json                        ← Registro do servidor MCP no Bob
│   └── commands/                       ← Slash commands locais do projeto
│       ├── trilha.md                   ← /trilha <tecnologia>
│       ├── desafio.md                  ← /desafio <tecnologia> <nivel>
│       └── certificado.md              ← /certificado <nome> <trilha>
└── dio_explorer/
    ├── data/
    │   └── trilhas_dio.json            ← Base de dados (11 trilhas, 619 linhas)
    ├── tests/
    │   └── test_commands.py            ← 45 testes unitários (Python unittest)
    ├── docs/
    │   ├── output_trilha_java.md       ← Saída de exemplo /trilha Java
    │   ├── output_desafio_java.md      ← Saída de exemplo /desafio Java
    │   ├── output_certificado_java.md  ← Certificado de exemplo
    │   └── resultado_testes.txt        ← Relatório completo dos testes
    └── mpc/                            ← Servidor MCP (TypeScript/Node.js)
        ├── package.json
        ├── tsconfig.json
        ├── setup.ps1                   ← Script de instalação automática
        ├── README.md                   ← Documentação do MCP Server
        └── src/
            ├── index.ts                ← Entry point (stdio + HTTP)
            ├── auth/apikey.ts          ← Middleware autenticação
            ├── utils/loader.ts         ← Loader do JSON (tipado + cache)
            └── tools/
                ├── trilha.ts           ← Tools: buscar_trilha, listar_trilhas
                ├── desafio.ts          ← Tool: gerar_desafio
                └── certificado.ts      ← Tool: gerar_certificado
```

---

## Prompts Utilizados

Esta seção registra os prompts exatos usados com o IBM Bob durante o desenvolvimento, para que outros profissionais possam reproduzir e aprender com a abordagem.

---

### Prompt 1 — Explorar a estrutura do projeto

```
me mostre a estrutura do projeto na pasta Trabalho-Final-Dio-Bob
```

**O que aprendemos:** O Bob usa a ferramenta `list_files` internamente e retorna uma árvore visual do projeto. Útil para orientação antes de qualquer desenvolvimento.

---

### Prompt 2 — Criar Slash Commands locais

```
Bob, cria um slash command dentro do projeto que possa ser invocado pelo comando /trilha,
ou seja, toda vez que eu digitar no chat do bob o comando '/trilha' ele devera executar a
seguinte tarefa, vai receber o nome de uma tecnologia e retorna a partir do arquivo
data/trilhas.json, um plano de estudos formatado com os modulos daquela trilha.

Depois voce vai criar o mesmo slash command que possa ser invocado a partir do comando
'/desafio' e ele ao ser invocado vai gerar um desafio de codigo aleatorio baseado no nivel
e tecnologia escolhido pelo usuario.

Assim que terminar, cria outro slash comando a partir do comando '/certificado' que vai
gerar um certificado ficticio em markdown com nome do usuario e a trilha que ele completou.

Todos esses slash commands tem que ficar armazenados de forma local, para serem executados
apenas neste projeto. Mas devo visualiza-los aqui no chat do bob
```

**Técnica usada:** Um único prompt criou 3 artefatos distintos. O Bob consultou a documentação interna para descobrir que comandos locais ficam em `.bob/commands/` e que o formato é Markdown com frontmatter YAML (`description`, `argument-hint`). As variáveis `$1` e `$2` capturam os argumentos digitados pelo usuário.

**Lição:** Seja específico sobre o comportamento esperado. Descrever o formato de saída (plano com módulos, badges, lives, promoção) guia o modelo a gerar um prompt de comando muito mais rico.

---

### Prompt 3 — Invocar um slash command

```
/trilha
```

**O que aconteceu:** O Bob percebeu que o argumento estava ausente e listou todas as tecnologias disponíveis no JSON antes de pedir que o usuário escolhesse. Esse comportamento de "fallback gracioso" estava definido no prompt do comando.

**Lição:** Sempre defina no prompt do slash command o que acontece quando o argumento está ausente ou inválido.

---

### Prompt 4 — Visualizar a árvore do projeto atualizada

```
quero que me mostre em forma de arvore tudo o que existe dentro de nosso repositorio
```

**Técnica usada:** Prompt informal em português. O Bob usou PowerShell (`Get-ChildItem`) para gerar a árvore recursiva e formatou o resultado com emojis para facilitar a leitura.

---

### Prompt 5 — Criar testes unitários e relatório

```
Bob crie arquivos de testes unitários e teste este fluxo para atingir uma cobertura de
70% de aprovação. teste os comandos /trilha para consultar trilhas de JAVA, gere um
arquivo de /desafio para o aluno e um /certificado para o mesmo. Grave os resultados
em um arquivo txt para acompanharmos
```

**Técnica usada:** O Bob extraiu a lógica dos slash commands (que eram apenas prompts Markdown) para funções Python testáveis, criou 5 suítes de teste cobrindo dados, cada comando individualmente e um fluxo de integração completo. Resultado: 45/45 testes, 100% > meta de 70%.

**Lição:** Ao pedir testes, forneça a meta de cobertura. O Bob vai dimensionar a quantidade e profundidade dos testes para atingir e superar o target.

---

### Prompt 6 — Criar o servidor MCP

```
Bob gostaria que voce criasse um MCP SERVE do projeto recem clonado para que futuramente
pessoas possam vir acessar por meio de um servidor https ou sso ou via API.
Use a pasta mpc para isso
```

**Técnica usada:** O Bob ativou a skill `build-mcp-server` para carregar as instruções especializadas antes de escrever qualquer código. Criou um servidor TypeScript com dual transport (stdio para uso local no Bob + HTTP Streamable para acesso remoto), middleware de API Key pronto para extensão JWT/SSO, 4 tools MCP mapeando os slash commands, e registrou o servidor no `.bob/mcp.json`.

**Lição:** Mencionar tecnologias futuras (HTTPS, SSO, API) no prompt faz o Bob criar a infraestrutura extensível já na primeira versão, em vez de ter que refatorar depois.

---

### Prompt 7 — Documentar o projeto

```
Bob gostaria que voce documentasse todo o projeto feito ate o momento, com todos prompts
usados, modos de uso, dicas de uso e insights para futuros profissionais que vao aprender
com nosso trabalho
```

**Resultado:** Este arquivo README.md + um artefato HTML compartilhável.

---

## Slash Commands

Os slash commands ficam em `.bob/commands/` e são exclusivos deste projeto.

### `/trilha <tecnologia>`

Consulta o `trilhas_dio.json` e exibe um plano de estudos completo.

```
/trilha Java
/trilha Python
/trilha React
/trilha Kubernetes
/trilha SQL
```

**Saída inclui:** nome da trilha, nível, módulos numerados com títulos, badges disponíveis, lives ao vivo, promoção ativa.

---

### `/desafio <tecnologia> <nivel>`

Gera um desafio de código didático.

```
/desafio Java Intermediário
/desafio Python Básico
/desafio Kubernetes Avançado
```

**Saída inclui:** descrição do desafio, requisitos, dicas, entrada/saída esperada, casos de teste, critérios de avaliação, XP recompensa.

Se o nível for omitido, o Bob perguntará qual nível você deseja.

---

### `/certificado <nome> <trilha>`

Gera um certificado fictício de conclusão.

```
/certificado "João Silva" Java
/certificado "Maria Souza" Python
/certificado "Carlos Dev" React
```

**Saída inclui:** certificado visual em ASCII, código de verificação único, competências certificadas, tabela de desempenho.

---

## Testes Unitários

Arquivo: [`tests/test_commands.py`](dio_explorer/tests/test_commands.py)

### Executar os testes

```bash
# A partir de dio_explorer/
python -m unittest tests.test_commands -v
```

### Resultado esperado

```
Ran 45 tests in 0.028s
OK — 100% (45/45)
```

### Suítes cobertas

| Suite | Testes | O que valida |
|-------|--------|--------------|
| `TestCarregamentoDados` | 7 | Integridade do JSON, campos obrigatórios, tipos |
| `TestComandoTrilha` | 15 | Busca por tecnologia, dados Java, plano de estudos |
| `TestComandoDesafio` | 10 | Geração por nível, XP correto, estrutura da saída |
| `TestComandoCertificado` | 10 | Nome, trilha, data, código, badges, fallback |
| `TestIntegracao` | 3 | Fluxo completo trilha→desafio→certificado |

---

## MCP Server

O servidor MCP expõe as funcionalidades do projeto como tools consumíveis por qualquer cliente MCP.

### Tools disponíveis

| Tool | Parâmetros | Descrição |
|------|------------|-----------|
| `buscar_trilha` | `tecnologia: string` | Plano de estudos completo |
| `listar_trilhas` | `nivel?: enum` | Lista resumida de trilhas |
| `gerar_desafio` | `tecnologia, nivel` | Desafio de código estruturado |
| `gerar_certificado` | `nome, trilha` | Certificado fictício em markdown |

### Ativar o servidor (requer Node.js ≥ 18)

```powershell
cd dio_explorer/mpc
.\setup.ps1        # Instala, compila e valida automaticamente
```

### Variáveis de ambiente

| Variável | Padrão | Uso |
|----------|--------|-----|
| `MCP_TRANSPORT` | `stdio` | `stdio` (Bob local) ou `http` (remoto) |
| `MCP_PORT` | `3000` | Porta HTTP |
| `MCP_HOST` | `0.0.0.0` | Interface de rede |
| `MCP_API_KEY` | _(vazio)_ | Ativa autenticação por API Key |

---

## Modos de Uso

### Modo 1 — Chat interativo com slash commands

O modo mais simples. Abra o projeto no Bob e use os comandos diretamente:

```
/trilha Python
/desafio Python Básico
/certificado "Seu Nome" Python
```

### Modo 2 — Testes automatizados

Para validar a integridade dos dados e das funções:

```bash
python -m unittest tests.test_commands -v
```

### Modo 3 — MCP local (stdio)

Após o build, o Bob detecta o servidor via `.bob/mcp.json` e expõe as tools no painel MCP. Você pode invocar as tools diretamente de qualquer conversa no Bob.

### Modo 4 — MCP remoto (HTTP + API Key)

Para expor o servidor na rede local ou na internet:

```bash
$env:MCP_TRANSPORT="http"
$env:MCP_API_KEY="sua-chave-segura"
$env:MCP_PORT="3000"
node dio_explorer/mpc/build/index.js
```

Qualquer cliente MCP pode então se conectar em `http://seu-servidor:3000/mcp`.

---

## Dicas de Uso do IBM Bob

### 1. Use prompts descritivos e com exemplos de saída
Quanto mais você descrever o formato esperado da resposta, melhor o Bob vai estruturar o código e os comandos. Ao criar os slash commands, descrever campos como "badges", "lives" e "promoção" resultou em saídas muito mais ricas.

### 2. Ative skills antes de tarefas especializadas
O Bob possui skills para tarefas específicas (MCP Server, Office, Charts, etc.). Ao solicitar um servidor MCP, o Bob ativou automaticamente a skill `build-mcp-server` que carregou instruções especializadas — isso fez a diferença entre um código genérico e um servidor pronto para produção.

### 3. Peça o mínimo necessário por vez
Projetos grandes se beneficiam de prompts incrementais. Primeiro criamos os dados, depois os comandos, depois os testes, depois o servidor. Cada etapa constrói sobre a anterior.

### 4. Use o todo list para rastrear progresso
O Bob mantém um `update_todo_list` interno que você pode acompanhar. Ele garante que nenhuma etapa seja pulada e que tarefas concluídas sejam preservadas.

### 5. Peça validação após cada entrega
Após criar código, peça ao Bob para executá-lo e validar. "Teste este fluxo e grave os resultados" transformou slash commands em uma suite de testes real com relatório.

### 6. Especifique requisitos não-funcionais no prompt
"que futuramente pessoas possam acessar por meio de https ou sso ou via API" — essa frase fez o Bob criar dual transport, middleware extensível e `mcp.json` configurado desde o início.

### 7. Use linguagem natural em português — funciona perfeitamente
Todos os prompts deste projeto foram em português informal. O Bob entende contexto, intenção e termos técnicos independentemente do idioma.

---

## Insights para Futuros Profissionais

### Sobre Engenharia de Prompts

**Prompt Engineering não é sobre "truques"** — é sobre comunicação clara. Os melhores prompts deste projeto tinham três elementos: (1) contexto do que já existe, (2) o que deve ser feito, e (3) como deve ser o resultado.

**Pense em camadas.** Não tente criar tudo em um único prompt gigante. Crie a base de dados → crie os comandos → crie os testes → crie o servidor. Cada camada valida a anterior.

**Descreva o "porquê" junto com o "o quê".** "Para que futuramente pessoas possam acessar via API" mudou completamente a arquitetura gerada, sem precisar de um segundo pedido de refatoração.

---

### Sobre Slash Commands no Bob

Slash commands são **prompts reutilizáveis com parâmetros**. Pense neles como funções: têm nome, argumentos e um comportamento definido. O segredo está em:
- Definir o comportamento de fallback (o que fazer se o argumento está errado ou ausente)
- Descrever o formato exato da saída esperada
- Usar `$1`, `$2` como placeholders para os argumentos

---

### Sobre MCP (Model Context Protocol)

O MCP é o protocolo que permite ao Bob (e outros LLMs) chamar ferramentas externas de forma padronizada. Ao empacotar sua lógica como um servidor MCP:
- Qualquer cliente MCP pode consumir suas tools
- O servidor pode rodar localmente (stdio) ou na nuvem (HTTP)
- A autenticação é tratada na camada de transporte, não na lógica de negócio

**Pense em MCP Servers como microserviços para IA.** Assim como você expõe uma API REST para consumo humano, você expõe um MCP Server para consumo por LLMs.

---

### Sobre Testes com IA

Ao pedir testes para o Bob, você está **documentando o comportamento esperado do sistema**. Os 45 testes deste projeto funcionam como uma especificação executável: qualquer desenvolvedor que ler `test_busca_java_tem_14_modulos` entende imediatamente o que a função `buscarTrilha("Java")` deve retornar.

**Meta de cobertura é um contrato.** "70% de aprovação" foi o critério de aceite. O Bob não só atingiu como superou (100%), porque entendeu que a meta era um piso, não um teto.

---

### Sobre o Fluxo Completo Trilha → Desafio → Certificado

Este fluxo modela o ciclo de aprendizado da DIO:
1. **Descoberta** (`/trilha`) — o aluno conhece o que vai aprender
2. **Prática** (`/desafio`) — o aluno aplica o conhecimento
3. **Reconhecimento** (`/certificado`) — o aluno documenta a conquista

Esse padrão de "Descoberta → Prática → Reconhecimento" é aplicável em qualquer sistema de ensino e pode ser estendido para outras plataformas.

---

### Sobre Arquitetura Extensível

O servidor MCP foi projetado para crescer:
- **Novos dados?** Adicione trilhas ao `trilhas_dio.json`
- **Nova tool?** Crie um arquivo em `src/tools/` e registre em `index.ts`
- **Autenticação SSO?** Substitua o middleware em `src/auth/apikey.ts`
- **Novo slash command?** Adicione um `.md` em `.bob/commands/`

**Mantenha a separação de responsabilidades.** Dados, lógica, transporte e autenticação em camadas distintas — isso é o que torna um projeto de IA sustentável a longo prazo.

---

## Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **IBM Bob** | Assistente de IA para desenvolvimento |
| **Python 3.14** | Testes unitários (unittest) |
| **TypeScript / Node.js** | Servidor MCP |
| **Express.js** | HTTP transport do MCP Server |
| **Zod** | Validação de schemas das tools |
| **@modelcontextprotocol/sdk** | SDK oficial do protocolo MCP |
| **JSON** | Base de dados das trilhas |
| **Markdown** | Slash commands e documentação |

---

## Dados das Trilhas Disponíveis

| Tecnologia | Nível | Módulos | XP |
|------------|-------|---------|-----|
| Python | Básico | 8 | 4.200 |
| Java | Intermediário | 14 | 9.800 |
| React / TypeScript | Intermediário | 12 | 8.500 |
| Azure / Data Engineering | Avançado | 18 | 14.500 |
| Python / Machine Learning | Avançado | 16 | 13.200 |
| Flutter / Dart | Intermediário | 11 | 7.600 |
| DevOps / GitHub Actions | Intermediário | 10 | 7.000 |
| Kubernetes / Docker | Avançado | 15 | 12.000 |
| SQL / PostgreSQL | Básico | 7 | 3.800 |
| IA Generativa / LLM | Avançado | 20 | 17.500 |
| Node.js / Express | Intermediário | 10 | — |

---

*DIO Explorer — Trabalho Final com IBM Bob | v1.0.0*
*Desenvolvido com IBM Bob — Digital Innovation One*
