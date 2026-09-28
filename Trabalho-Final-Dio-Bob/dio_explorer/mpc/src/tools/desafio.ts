/**
 * Tool: gerar_desafio
 * Gera um desafio de código para uma tecnologia e nível escolhido.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const XP_MAP: Record<string, number> = {
  Básico: 300,
  Intermediário: 700,
  Avançado: 1200,
};

const DESAFIOS: Record<string, Record<string, string>> = {
  Básico: {
    titulo: "Calculadora de IMC",
    descricao:
      "Implemente uma calculadora de Índice de Massa Corporal (IMC). O programa deve receber peso (kg) e altura (m), calcular o IMC e classificar o resultado (Abaixo do peso, Normal, Sobrepeso, Obesidade).",
    requisitos: [
      "Receber peso e altura como entrada",
      "Calcular IMC = peso / (altura * altura)",
      "Exibir a classificação correta conforme tabela da OMS",
      "Tratar entradas inválidas (valores negativos ou zero)",
    ],
    dicas: [
      "Use constantes para os limites de classificação",
      "Valide as entradas antes de calcular",
    ],
    casos: [
      "Entrada: peso=70, altura=1.75  → IMC=22.86 (Normal)",
      "Entrada: peso=100, altura=1.60 → IMC=39.06 (Obesidade Grau II)",
      "Entrada: peso=-5, altura=1.70  → Erro: valores inválidos",
    ],
    categoria: "Algoritmos / Lógica",
    tempo: "30–45 minutos",
  },
  Intermediário: {
    titulo: "Sistema de Gerenciamento de Biblioteca",
    descricao:
      "Implemente um sistema de gerenciamento de biblioteca com cadastro de livros, busca por título/autor e controle de empréstimos e devoluções. Exponha as funcionalidades via API REST.",
    requisitos: [
      "Entidade Livro: título, autor, ISBN, disponível",
      "Métodos: adicionar, buscar, emprestar, devolver",
      "Tratar livro não encontrado e livro indisponível com exceções",
      "Persistência em memória (lista ou mapa)",
      "Expor ao menos 4 endpoints REST",
    ],
    dicas: [
      "Use Optional/Maybe para o retorno da busca por ISBN",
      "Valide ISBN duplicado ao adicionar livros",
      "Separe responsabilidades em camadas (controller/service/model)",
    ],
    casos: [
      "POST /livros + dados válidos              → 201 Created",
      "POST /livros/{isbn}/emprestar (disponível) → 200 + mensagem de sucesso",
      "POST /livros/{isbn}/emprestar (indisponível) → 409 Conflict",
      "GET  /livros/ISBN-INEXISTENTE              → 404 Not Found",
    ],
    categoria: "POO / API REST",
    tempo: "45–90 minutos",
  },
  Avançado: {
    titulo: "Pipeline de Processamento Assíncrono com Filas",
    descricao:
      "Implemente um pipeline de processamento assíncrono utilizando filas de tarefas. O sistema deve receber tarefas via API, processá-las em workers concorrentes e expor o status de cada tarefa em tempo real via SSE (Server-Sent Events).",
    requisitos: [
      "API REST para submissão de tarefas: POST /tasks",
      "Fila de tarefas com pelo menos 3 workers concorrentes",
      "Estados: pending → processing → completed | failed",
      "Endpoint SSE para acompanhamento: GET /tasks/{id}/stream",
      "Retry automático em caso de falha (máximo 3 tentativas)",
      "Timeout por tarefa configurável via variável de ambiente",
    ],
    dicas: [
      "Use um executor de thread pool ou async/await com controle de concorrência",
      "Implemente backoff exponencial no retry",
      "Use UUID para identificar tarefas e evitar colisões",
    ],
    casos: [
      "POST /tasks {payload}          → 202 Accepted + taskId",
      "GET /tasks/{id}/stream (SSE)   → eventos: pending, processing, completed",
      "Task que falha 3x             → status: failed, error detalhado",
    ],
    categoria: "Concorrência / Arquitetura / Streaming",
    tempo: "90–180 minutos",
  },
};

export function registerDesafioTools(server: McpServer): void {
  server.registerTool(
    "gerar_desafio",
    {
      description:
        "Gera um desafio de código criativo e didático para uma tecnologia e nível específicos, com descrição, requisitos, dicas, casos de teste e critérios de avaliação.",
      inputSchema: z.object({
        tecnologia: z
          .string()
          .describe("Tecnologia do desafio (ex: Java, Python, Node.js, React)"),
        nivel: z
          .enum(["Básico", "Intermediário", "Avançado"])
          .describe("Nível de dificuldade do desafio"),
      }),
    },
    async ({ tecnologia, nivel }) => {
      try {
        const desafio = DESAFIOS[nivel];
        const xp = XP_MAP[nivel];

        const requisitos = desafio.requisitos
          .map((r, i) => `${i + 1}. ${r}`)
          .join("\n");

        const dicas = desafio.dicas.map((d) => `• ${d}`).join("\n");

        const casos = desafio.casos.map((c) => `  ${c}`).join("\n");

        const output = `
# Desafio DIO — ${tecnologia} | Nível: ${nivel}

> Categoria      : ${desafio.categoria}
> Tempo estimado : ${desafio.tempo}
> XP recompensa  : ${xp} XP

---

## Descrição
${desafio.descricao}

---

## Requisitos
${requisitos}

---

## Dicas
${dicas}

---

## Casos de Teste
${casos}

---

## Critérios de Avaliação
1. Funcionalidade correta de acordo com os requisitos
2. Código limpo, legível e bem nomeado
3. Tratamento adequado de casos extremos e erros
4. Boas práticas específicas de ${tecnologia}

---

Deseja receber a solução comentada ou prefere tentar sozinho primeiro?
`.trim();

        return { content: [{ type: "text", text: output }] };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: `Erro ao gerar desafio: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
