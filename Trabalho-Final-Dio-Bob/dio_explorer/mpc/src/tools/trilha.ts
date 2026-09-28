/**
 * Tool: buscar_trilha
 * Busca uma trilha por tecnologia e retorna plano de estudos formatado.
 *
 * Tool: listar_trilhas
 * Lista todas as trilhas disponíveis com resumo.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buscarTrilha, listarTodasTrilhas, Trilha } from "../utils/loader.js";

function formatarPlanoEstudos(trilha: Trilha): string {
  const titulosBase = [
    "Fundamentos e Configuração do Ambiente",
    "Sintaxe e Estruturas Básicas",
    "Orientação a Objetos",
    "Coleções e Estruturas de Dados",
    "Tratamento de Erros e Exceções",
    "Acesso a Banco de Dados",
    "Desenvolvimento de APIs",
    "Testes Unitários",
    "Segurança e Autenticação",
    "Boas Práticas e Design Patterns",
    "Frameworks e Bibliotecas Populares",
    "Integração com Serviços Externos",
    "Deploy e DevOps",
    "Projeto Final Integrador",
    "Performance e Otimização",
    "Arquitetura de Software",
    "Microsserviços",
    "Monitoramento e Observabilidade",
    "CI/CD Avançado",
    "Tendências e Mercado",
  ];

  const modulos = Array.from({ length: trilha.numero_de_modulos }, (_, i) => {
    const titulo = titulosBase[i % titulosBase.length];
    return `  Módulo ${i + 1} — ${trilha.tecnologia}: ${titulo}`;
  }).join("\n");

  const badges = trilha.badges_disponiveis.join(", ");

  const lives = trilha.lives_ao_vivo
    .map((l) => `  • ${l.titulo} — ${l.data} às ${l.horario}`)
    .join("\n");

  const promo =
    trilha.promocoes.desconto !== "0%"
      ? `${trilha.promocoes.desconto} de desconto | Cupom: ${trilha.promocoes.cupom} | Válido até: ${trilha.promocoes.validade}`
      : "Sem promoção ativa no momento.";

  return `
# Plano de Estudos — ${trilha.nome}

Tecnologia : ${trilha.tecnologia}
Nível      : ${trilha.nivel}
Módulos    : ${trilha.numero_de_modulos}
XP Total   : ${trilha.xp_total} XP
Vitalício  : ${trilha.vitalicio ? "Sim" : "Não"}

## Módulos do Curso
${modulos}

## Badges Disponíveis
${badges}

## Lives ao Vivo
${lives}

## Promoção
${promo}
`.trim();
}

export function registerTrilhaTools(server: McpServer): void {
  // ---- Tool 1: buscar_trilha ------------------------------------------------
  server.registerTool(
    "buscar_trilha",
    {
      description:
        "Busca uma trilha de aprendizado pelo nome da tecnologia e retorna um plano de estudos formatado com módulos, badges, lives e promoções.",
      inputSchema: z.object({
        tecnologia: z
          .string()
          .describe(
            "Nome da tecnologia a buscar (ex: Java, Python, React, Kubernetes)"
          ),
      }),
    },
    async ({ tecnologia }) => {
      try {
        const trilha = buscarTrilha(tecnologia);

        if (!trilha) {
          const todas = listarTodasTrilhas();
          const disponiveis = todas
            .map((t) => `  • ${t.tecnologia} — ${t.nome}`)
            .join("\n");
          return {
            content: [
              {
                type: "text",
                text: `Nenhuma trilha encontrada para "${tecnologia}".\n\nTecnologias disponíveis:\n${disponiveis}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [{ type: "text", text: formatarPlanoEstudos(trilha) }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: `Erro ao buscar trilha: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ---- Tool 2: listar_trilhas -----------------------------------------------
  server.registerTool(
    "listar_trilhas",
    {
      description:
        "Lista todas as trilhas disponíveis no DIO Explorer com tecnologia, nível e XP total.",
      inputSchema: z.object({
        nivel: z
          .enum(["Básico", "Intermediário", "Avançado", "todos"])
          .optional()
          .describe("Filtrar por nível. Omita ou use 'todos' para ver todas."),
      }),
    },
    async ({ nivel }) => {
      try {
        let trilhas = listarTodasTrilhas();

        if (nivel && nivel !== "todos") {
          trilhas = trilhas.filter((t) => t.nivel === nivel);
        }

        if (trilhas.length === 0) {
          return {
            content: [
              { type: "text", text: `Nenhuma trilha encontrada para o nível "${nivel}".` },
            ],
            isError: true,
          };
        }

        const lista = trilhas
          .map(
            (t) =>
              `[${t.id}] ${t.nome}\n     Tecnologia: ${t.tecnologia} | Nível: ${t.nivel} | Módulos: ${t.numero_de_modulos} | XP: ${t.xp_total}`
          )
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text: `# Trilhas DIO disponíveis (${trilhas.length})\n\n${lista}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: `Erro ao listar trilhas: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
