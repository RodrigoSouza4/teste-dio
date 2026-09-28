/**
 * Tool: gerar_certificado
 * Gera um certificado fictício em markdown com nome do aluno e trilha concluída.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buscarTrilha } from "../utils/loader.js";
import { randomBytes } from "crypto";

function gerarCodigo(): string {
  return "DIO-" + randomBytes(5).toString("hex").toUpperCase();
}

function dataHoje(): string {
  const d = new Date();
  return d.toLocaleDateString("pt-BR");
}

export function registerCertificadoTools(server: McpServer): void {
  server.registerTool(
    "gerar_certificado",
    {
      description:
        "Gera um certificado fictício de conclusão de trilha em markdown, com nome do aluno, trilha concluída, badges, XP e código de verificação único.",
      inputSchema: z.object({
        nome: z.string().describe("Nome completo do aluno"),
        trilha: z
          .string()
          .describe(
            "Nome da trilha concluída ou tecnologia (ex: Java, Python, React)"
          ),
      }),
    },
    async ({ nome, trilha: trilhaNome }) => {
      try {
        const trilha = buscarTrilha(trilhaNome);
        const codigo = gerarCodigo();
        const hoje = dataHoje();

        let badges: string;
        let modulos: string;
        let xp: string;
        let nivel: string;
        let nomeTrilha: string;

        if (trilha) {
          badges = trilha.badges_disponiveis
            .map((b) => `  ✅ ${b}`)
            .join("\n");
          modulos = `${trilha.numero_de_modulos} de ${trilha.numero_de_modulos}`;
          xp = `${trilha.xp_total} XP`;
          nivel = trilha.nivel;
          nomeTrilha = trilha.nome;
        } else {
          // Fallback para trilha não encontrada no JSON
          badges = "  ✅ Desenvolvedor Certificado";
          modulos = "N/A";
          xp = "N/A";
          nivel = "N/A";
          nomeTrilha = trilhaNome;
        }

        const output = `
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║                CERTIFICADO DE CONCLUSÃO — DIO                   ║
║               Digital Innovation One                             ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

# Certificado de Conclusão

**Este certificado é conferido a:**

## ${nome}

**pela conclusão com êxito da trilha:**

## ${nomeTrilha}

---

📅 Data de Conclusão : ${hoje}
🆔 Código            : ${codigo}
🌐 Verificar em      : https://www.dio.me/certificate/${codigo}

---

## Competências Certificadas

${badges}

---

## Desempenho

| Métrica             | Resultado      |
|---------------------|----------------|
| Módulos Concluídos  | ${modulos}     |
| XP Conquistado      | ${xp}          |
| Nível               | ${nivel}       |
| Status              | ✅ CONCLUÍDO   |

---

> "A jornada de mil milhas começa com um único passo."
> Continue aprendendo, continue crescendo. 🚀

---

Assinado digitalmente por:
DIO — Digital Innovation One | www.dio.me

⚠️ Certificado fictício gerado para fins de demonstração.
`.trim();

        return { content: [{ type: "text", text: output }] };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: `Erro ao gerar certificado: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
