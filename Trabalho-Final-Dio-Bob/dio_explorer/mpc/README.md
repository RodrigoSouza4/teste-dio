# DIO Explorer — MCP Server

Servidor MCP (Model Context Protocol) que expõe as trilhas, desafios e certificados do **DIO Explorer** como tools consumíveis por qualquer cliente MCP, incluindo o **IBM Bob**.

---

## Tools disponíveis

| Tool | Descrição | Parâmetros |
|------|-----------|------------|
| `buscar_trilha` | Busca uma trilha por tecnologia e retorna plano de estudos completo | `tecnologia: string` |
| `listar_trilhas` | Lista todas as trilhas com resumo | `nivel?: "Básico" \| "Intermediário" \| "Avançado" \| "todos"` |
| `gerar_desafio` | Gera um desafio de código para tecnologia e nível | `tecnologia: string`, `nivel: enum` |
| `gerar_certificado` | Gera um certificado fictício de conclusão | `nome: string`, `trilha: string` |

---

## Modos de execução

### 1. Modo stdio — uso local com Bob (padrão)

```bash
npm install
npm run build
node build/index.js
```

Registre no Bob via `mcp.json` (ver seção abaixo).

---

### 2. Modo HTTP — acesso remoto via HTTPS / API

```bash
MCP_TRANSPORT=http node build/index.js
```

Variáveis de ambiente opcionais:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `MCP_TRANSPORT` | `stdio` | `stdio` ou `http` |
| `MCP_PORT` | `3000` | Porta do servidor HTTP |
| `MCP_HOST` | `0.0.0.0` | Interface de rede |
| `MCP_API_KEY` | _(vazio)_ | Se definida, exige autenticação por API Key |

Endpoints HTTP:

```
POST   /mcp      — MCP Streamable HTTP Transport (endpoint principal)
GET    /mcp      — SSE para notificações servidor→cliente
DELETE /mcp      — Encerrar sessão
GET    /health   — Health check
GET    /         — Informações da API
```

---

## Autenticação

### API Key

Quando `MCP_API_KEY` estiver definida, todas as chamadas a `/mcp` exigem:

```
Header:       X-Api-Key: <sua-chave>
   ou
Query param:  ?api_key=<sua-chave>
```

Exemplo com curl:

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: minha-chave-secreta" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

### SSO / OAuth (extensão futura)

O middleware em `src/auth/apikey.ts` está preparado para ser estendido com validação de tokens JWT ou introspection OAuth. Exemplo de cabeçalho para Bearer token:

```
Authorization: Bearer <jwt-token>
```

---

## Registrar no Bob (mcp.json)

### Modo stdio (local)

Adicione ao arquivo `.bob/mcp.json` na raiz do projeto:

```json
{
  "mcpServers": {
    "dio-explorer": {
      "command": "node",
      "args": ["${workspaceFolder}/Trabalho-Final-Dio-Bob/dio_explorer/mpc/build/index.js"]
    }
  }
}
```

### Modo HTTP (remoto)

```json
{
  "mcpServers": {
    "dio-explorer-remote": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "X-Api-Key": "${env:MCP_API_KEY}"
      }
    }
  }
}
```

---

## Estrutura do projeto

```
mpc/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts               — entry point (stdio + HTTP)
    ├── auth/
    │   └── apikey.ts          — middleware API Key (extensível para SSO/OAuth)
    ├── tools/
    │   ├── trilha.ts          — tools: buscar_trilha, listar_trilhas
    │   ├── desafio.ts         — tool:  gerar_desafio
    │   └── certificado.ts     — tool:  gerar_certificado
    └── utils/
        └── loader.ts          — loader do trilhas_dio.json (tipado + cache)
```

---

## Build e execução rápida

```bash
# Instalar dependências
cd dio_explorer/mpc
npm install

# Compilar TypeScript → JavaScript
npm run build

# Rodar em modo stdio (para Bob)
npm start

# Rodar em modo HTTP na porta 3000
MCP_TRANSPORT=http npm start

# Rodar em modo HTTP com API Key e porta customizada
MCP_TRANSPORT=http MCP_PORT=8080 MCP_API_KEY=minha-chave npm start
```

---

## Dependências

| Pacote | Uso |
|--------|-----|
| `@modelcontextprotocol/sdk` | SDK oficial MCP (stdio + HTTP streamable) |
| `express` | Servidor HTTP para modo remoto |
| `zod` | Validação de schemas dos inputs das tools |

---

*DIO Explorer MCP Server — v0.1.0*
