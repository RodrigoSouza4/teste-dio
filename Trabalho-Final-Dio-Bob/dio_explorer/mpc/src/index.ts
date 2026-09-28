#!/usr/bin/env node
/**
 * DIO Explorer MCP Server — ponto de entrada
 *
 * Suporta dois transports:
 *   - stdio  (padrão, para uso local com Bob)
 *   - http   (para acesso remoto via HTTPS / API / SSO)
 *            ativado com: MCP_TRANSPORT=http
 *
 * Autenticação:
 *   - API Key via header  X-API-Key  ou query param  ?api_key=...
 *   - Ativada quando a variável de ambiente  MCP_API_KEY  estiver definida
 *   - SSO/OAuth: pronto para extensão via middleware Express (ver auth/apikey.ts)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { randomUUID } from "crypto";
import { registerTrilhaTools } from "./tools/trilha.js";
import { registerDesafioTools } from "./tools/desafio.js";
import { registerCertificadoTools } from "./tools/certificado.js";
import { apiKeyMiddleware } from "./auth/apikey.js";

// ---------------------------------------------------------------------------
// Cria e configura o servidor MCP
// ---------------------------------------------------------------------------

function createServer(): McpServer {
  const server = new McpServer({
    name: "dio-explorer-mcp",
    version: "0.1.0",
  });

  registerTrilhaTools(server);
  registerDesafioTools(server);
  registerCertificadoTools(server);

  return server;
}

// ---------------------------------------------------------------------------
// Transport STDIO — uso local com Bob
// ---------------------------------------------------------------------------

async function runStdio(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[dio-explorer-mcp] Servidor MCP rodando via stdio");
}

// ---------------------------------------------------------------------------
// Transport HTTP — acesso remoto via HTTPS / API / SSO
// ---------------------------------------------------------------------------

async function runHttp(): Promise<void> {
  const app = express();
  app.use(express.json());

  const port = parseInt(process.env.MCP_PORT ?? "3000", 10);
  const host = process.env.MCP_HOST ?? "0.0.0.0";

  // Mapa de sessões (stateful por sessão)
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  // Aplica autenticação via API Key (se MCP_API_KEY estiver definida)
  app.use("/mcp", apiKeyMiddleware);

  // Rota principal MCP — Streamable HTTP Transport
  app.post("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    let transport: StreamableHTTPServerTransport;

    if (sessionId && sessions.has(sessionId)) {
      // Sessão existente — reutiliza transport
      transport = sessions.get(sessionId)!;
    } else {
      // Nova sessão
      const newSessionId = randomUUID();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
        onsessioninitialized: (sid) => {
          sessions.set(sid, transport);
          console.error(`[dio-explorer-mcp] Nova sessão iniciada: ${sid}`);
        },
      });

      transport.onclose = () => {
        sessions.delete(newSessionId);
        console.error(`[dio-explorer-mcp] Sessão encerrada: ${newSessionId}`);
      };

      const server = createServer();
      await server.connect(transport);
    }

    await transport.handleRequest(req, res, req.body);
  });

  // SSE para notificações servidor→cliente (GET /mcp)
  app.get("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).json({ error: "Sessão inválida ou expirada" });
      return;
    }
    const transport = sessions.get(sessionId)!;
    await transport.handleRequest(req, res);
  });

  // Encerramento de sessão (DELETE /mcp)
  app.delete("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).json({ error: "Sessão inválida ou expirada" });
      return;
    }
    const transport = sessions.get(sessionId)!;
    await transport.handleRequest(req, res);
    sessions.delete(sessionId);
  });

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      server: "dio-explorer-mcp",
      version: "0.1.0",
      sessions: sessions.size,
      timestamp: new Date().toISOString(),
    });
  });

  // Info da API
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      name: "DIO Explorer MCP Server",
      version: "0.1.0",
      description: "Servidor MCP que expõe trilhas, desafios e certificados da DIO",
      endpoints: {
        mcp: "POST /mcp  (MCP Streamable HTTP Transport)",
        health: "GET /health",
      },
      tools: [
        "buscar_trilha    — Busca e retorna plano de estudos de uma trilha pelo nome da tecnologia",
        "listar_trilhas   — Lista todas as trilhas disponíveis com resumo",
        "gerar_desafio    — Gera um desafio de código para uma tecnologia e nível",
        "gerar_certificado — Gera um certificado fictício em markdown",
      ],
      auth: process.env.MCP_API_KEY
        ? "API Key ativa — envie header: X-Api-Key: <sua-chave>"
        : "Sem autenticação (MCP_API_KEY não definida)",
    });
  });

  app.listen(port, host, () => {
    console.error(`[dio-explorer-mcp] Servidor HTTP rodando em http://${host}:${port}`);
    console.error(`[dio-explorer-mcp] MCP endpoint: POST http://${host}:${port}/mcp`);
    console.error(`[dio-explorer-mcp] Health check: GET  http://${host}:${port}/health`);
  });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const transport = process.env.MCP_TRANSPORT ?? "stdio";

if (transport === "http") {
  runHttp().catch((err) => {
    console.error("[dio-explorer-mcp] Erro fatal (HTTP):", err);
    process.exit(1);
  });
} else {
  runStdio().catch((err) => {
    console.error("[dio-explorer-mcp] Erro fatal (stdio):", err);
    process.exit(1);
  });
}
