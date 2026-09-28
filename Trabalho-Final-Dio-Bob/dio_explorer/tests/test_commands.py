"""
=============================================================
  DIO Explorer — Testes Unitários dos Slash Commands
  Cobertura alvo: 70%+
  Comandos testados: /trilha | /desafio | /certificado
=============================================================
"""

import json
import os
import re
import unittest
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# Helpers — lógica extraída dos slash commands para fins de teste
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "trilhas_dio.json"


def load_trilhas() -> dict:
    """Carrega o arquivo trilhas_dio.json."""
    with open(DATA_FILE, encoding="utf-8") as f:
        return json.load(f)


def buscar_trilha(tecnologia: str) -> dict | None:
    """Simula a lógica do /trilha: busca trilha por tecnologia (parcial)."""
    data = load_trilhas()
    termo = tecnologia.lower()
    for trilha in data["trilhas"]:
        if termo in trilha["tecnologia"].lower() or termo in trilha["nome"].lower():
            return trilha
    return None


def gerar_plano_estudos(trilha: dict) -> str:
    """Simula a saída formatada do /trilha."""
    modulos = "\n".join(
        [f"  Módulo {i+1} – {_titulo_modulo(trilha['tecnologia'], i+1)}"
         for i in range(trilha["numero_de_modulos"])]
    )
    badges = ", ".join(trilha["badges_disponiveis"])
    lives = "\n".join(
        [f"  • {l['titulo']} — {l['data']} às {l['horario']}"
         for l in trilha["lives_ao_vivo"]]
    )
    promo = trilha["promocoes"]
    promo_txt = (
        f"Desconto: {promo['desconto']} | Cupom: {promo['cupom']} | Validade: {promo['validade']}"
        if promo["desconto"] != "0%"
        else "Sem promoção ativa no momento."
    )

    return f"""# Plano de Estudos — {trilha['nome']}

Tecnologia : {trilha['tecnologia']}
Nível      : {trilha['nivel']}
Módulos    : {trilha['numero_de_modulos']}
XP Total   : {trilha['xp_total']} XP

## Módulos
{modulos}

## Badges
{badges}

## Lives ao Vivo
{lives}

## Promoção
{promo_txt}
"""


def gerar_desafio(tecnologia: str, nivel: str) -> str:
    """Simula a saída do /desafio."""
    niveis_validos = ["básico", "intermediário", "avançado"]
    nivel_norm = nivel.lower()
    if nivel_norm not in niveis_validos:
        raise ValueError(f"Nível inválido: '{nivel}'. Use: Básico, Intermediário ou Avançado.")

    xp_map = {"básico": 300, "intermediário": 700, "avançado": 1200}
    xp = xp_map[nivel_norm]

    return f"""# Desafio DIO — {tecnologia} | Nível: {nivel}

Categoria     : POO / API REST
Tempo estimado: 45–90 minutos
XP recompensa : {xp} XP

## Descrição
Implemente um sistema de gerenciamento de biblioteca em {tecnologia}.
O sistema deve permitir cadastrar livros, buscar por título/autor e controlar empréstimos.

## Requisitos
1. Classe Livro com atributos: título, autor, ISBN, disponível
2. Classe Biblioteca com métodos: adicionar, buscar, emprestar, devolver
3. Tratamento de exceções para livro não encontrado ou indisponível
4. Persistência dos dados em memória (lista/mapa)
5. Interface via terminal (menu simples)

## Dicas
- Use encapsulamento e getters/setters
- Trate o caso de ISBN duplicado
- Considere usar Optional para retorno de busca

## Casos de Teste
Caso 1 — Entrada: emprestar livro disponível    → Saída: "Empréstimo realizado com sucesso"
Caso 2 — Entrada: emprestar livro indisponível  → Saída: "Livro indisponível no momento"
Caso 3 — Entrada: buscar ISBN inexistente       → Saída: "Livro não encontrado"

## Critérios de Avaliação
[x] Funcionalidade correta
[x] Código limpo e legível
[x] Tratamento de casos extremos
[x] Boas práticas de OOP em {tecnologia}
"""


def gerar_certificado(nome: str, trilha_nome: str) -> str:
    """Simula a saída do /certificado."""
    trilha = buscar_trilha(trilha_nome)
    hoje = datetime.today().strftime("%d/%m/%Y")
    codigo = "DIO-JAVA2025AB"

    if trilha:
        badges = ", ".join(trilha["badges_disponiveis"])
        modulos = trilha["numero_de_modulos"]
        xp = trilha["xp_total"]
        nivel = trilha["nivel"]
    else:
        badges = "Desenvolvedor Certificado"
        modulos = "N/A"
        xp = "N/A"
        nivel = "N/A"

    return f"""╔══════════════════════════════════════════════════════════════════╗
║               CERTIFICADO DE CONCLUSÃO — DIO                    ║
╚══════════════════════════════════════════════════════════════════╝

# Certificado de Conclusão

Este certificado é conferido a:

## {nome}

pela conclusão com êxito da trilha:

## {trilha_nome}

Data de Conclusão : {hoje}
Código            : {codigo}
Verificar em      : https://www.dio.me/certificate/{codigo}

## Competências Certificadas
{badges}

## Desempenho
Módulos Concluídos : {modulos}
XP Conquistado     : {xp} XP
Nível              : {nivel}
Status             : CONCLUÍDO
"""


def _titulo_modulo(tecnologia: str, num: int) -> str:
    """Gera títulos de módulos genéricos para fins de saída formatada."""
    titulos_base = [
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
    ]
    idx = (num - 1) % len(titulos_base)
    return f"{tecnologia} — {titulos_base[idx]}"


# ===========================================================================
#  SUITE DE TESTES
# ===========================================================================


class TestCarregamentoDados(unittest.TestCase):
    """Testa o carregamento e integridade do arquivo JSON."""

    def test_arquivo_json_existe(self):
        self.assertTrue(DATA_FILE.exists(), "trilhas_dio.json não encontrado")

    def test_json_carrega_sem_erro(self):
        data = load_trilhas()
        self.assertIsInstance(data, dict)

    def test_chave_trilhas_presente(self):
        data = load_trilhas()
        self.assertIn("trilhas", data)

    def test_total_trilhas_positivo(self):
        data = load_trilhas()
        self.assertGreater(data["total_trilhas"], 0)

    def test_cada_trilha_tem_campos_obrigatorios(self):
        data = load_trilhas()
        campos = ["id", "nome", "tecnologia", "nivel",
                  "numero_de_modulos", "xp_total",
                  "badges_disponiveis", "promocoes", "lives_ao_vivo"]
        for trilha in data["trilhas"]:
            for campo in campos:
                self.assertIn(campo, trilha, f"Campo '{campo}' ausente na trilha id={trilha.get('id')}")

    def test_numero_de_modulos_maior_que_zero(self):
        data = load_trilhas()
        for t in data["trilhas"]:
            self.assertGreater(t["numero_de_modulos"], 0)

    def test_xp_total_maior_que_zero(self):
        data = load_trilhas()
        for t in data["trilhas"]:
            self.assertGreater(t["xp_total"], 0)


class TestComandoTrilha(unittest.TestCase):
    """Testa o slash command /trilha."""

    def test_busca_java_retorna_trilha(self):
        resultado = buscar_trilha("Java")
        self.assertIsNotNone(resultado, "/trilha Java não retornou resultado")

    def test_busca_java_nome_correto(self):
        trilha = buscar_trilha("Java")
        self.assertEqual(trilha["nome"], "Desenvolvedor Java Completo")

    def test_busca_java_tecnologia_correta(self):
        trilha = buscar_trilha("Java")
        self.assertEqual(trilha["tecnologia"], "Java")

    def test_busca_java_nivel_intermediario(self):
        trilha = buscar_trilha("Java")
        self.assertEqual(trilha["nivel"], "Intermediário")

    def test_busca_java_tem_14_modulos(self):
        trilha = buscar_trilha("Java")
        self.assertEqual(trilha["numero_de_modulos"], 14)

    def test_busca_java_xp_total(self):
        trilha = buscar_trilha("Java")
        self.assertEqual(trilha["xp_total"], 9800)

    def test_busca_java_tem_badges(self):
        trilha = buscar_trilha("Java")
        self.assertIn("Java Developer", trilha["badges_disponiveis"])
        self.assertIn("Spring Ninja", trilha["badges_disponiveis"])

    def test_busca_java_tem_promocao(self):
        trilha = buscar_trilha("Java")
        self.assertEqual(trilha["promocoes"]["desconto"], "20%")
        self.assertEqual(trilha["promocoes"]["cupom"], "JAVA20")

    def test_busca_java_tem_lives(self):
        trilha = buscar_trilha("Java")
        self.assertEqual(len(trilha["lives_ao_vivo"]), 2)

    def test_busca_case_insensitive(self):
        resultado = buscar_trilha("java")
        self.assertIsNotNone(resultado)

    def test_busca_tecnologia_inexistente_retorna_none(self):
        resultado = buscar_trilha("COBOL")
        self.assertIsNone(resultado)

    def test_plano_estudos_contem_nome_trilha(self):
        trilha = buscar_trilha("Java")
        plano = gerar_plano_estudos(trilha)
        self.assertIn("Desenvolvedor Java Completo", plano)

    def test_plano_estudos_contem_modulos(self):
        trilha = buscar_trilha("Java")
        plano = gerar_plano_estudos(trilha)
        self.assertIn("Módulo 1", plano)
        self.assertIn("Módulo 14", plano)

    def test_plano_estudos_contem_xp(self):
        trilha = buscar_trilha("Java")
        plano = gerar_plano_estudos(trilha)
        self.assertIn("9800 XP", plano)

    def test_plano_estudos_contem_badge(self):
        trilha = buscar_trilha("Java")
        plano = gerar_plano_estudos(trilha)
        self.assertIn("Java Developer", plano)


class TestComandoDesafio(unittest.TestCase):
    """Testa o slash command /desafio."""

    def test_gerar_desafio_java_intermediario(self):
        saida = gerar_desafio("Java", "Intermediário")
        self.assertIn("Java", saida)
        self.assertIn("Intermediário", saida)

    def test_desafio_contem_xp(self):
        saida = gerar_desafio("Java", "Intermediário")
        self.assertIn("700 XP", saida)

    def test_desafio_contem_requisitos(self):
        saida = gerar_desafio("Java", "Intermediário")
        self.assertIn("Requisitos", saida)

    def test_desafio_contem_casos_de_teste(self):
        saida = gerar_desafio("Java", "Intermediário")
        self.assertIn("Casos de Teste", saida)

    def test_desafio_contem_criterios(self):
        saida = gerar_desafio("Java", "Intermediário")
        self.assertIn("Critérios de Avaliação", saida)

    def test_desafio_basico_xp_correto(self):
        saida = gerar_desafio("Java", "Básico")
        self.assertIn("300 XP", saida)

    def test_desafio_avancado_xp_correto(self):
        saida = gerar_desafio("Java", "Avançado")
        self.assertIn("1200 XP", saida)

    def test_nivel_invalido_lanca_excecao(self):
        with self.assertRaises(ValueError):
            gerar_desafio("Java", "Master")

    def test_desafio_contem_descricao(self):
        saida = gerar_desafio("Java", "Intermediário")
        self.assertIn("Descrição", saida)

    def test_desafio_contem_dicas(self):
        saida = gerar_desafio("Java", "Intermediário")
        self.assertIn("Dicas", saida)


class TestComandoCertificado(unittest.TestCase):
    """Testa o slash command /certificado."""

    NOME = "João Silva"
    TRILHA = "Java"

    def setUp(self):
        self.certificado = gerar_certificado(self.NOME, self.TRILHA)

    def test_certificado_contem_nome_aluno(self):
        self.assertIn("João Silva", self.certificado)

    def test_certificado_contem_nome_trilha(self):
        self.assertIn("Java", self.certificado)

    def test_certificado_contem_codigo_verificacao(self):
        self.assertIn("DIO-", self.certificado)

    def test_certificado_contem_data(self):
        hoje = datetime.today().strftime("%d/%m/%Y")
        self.assertIn(hoje, self.certificado)

    def test_certificado_contem_badges(self):
        self.assertIn("Java Developer", self.certificado)

    def test_certificado_contem_xp(self):
        self.assertIn("9800 XP", self.certificado)

    def test_certificado_contem_nivel(self):
        self.assertIn("Intermediário", self.certificado)

    def test_certificado_contem_status_concluido(self):
        self.assertIn("CONCLUÍDO", self.certificado)

    def test_certificado_contem_url_verificacao(self):
        self.assertIn("https://www.dio.me/certificate/", self.certificado)

    def test_certificado_trilha_inexistente_gera_fallback(self):
        cert = gerar_certificado("Maria Santos", "COBOL")
        self.assertIn("Maria Santos", cert)
        self.assertIn("Desenvolvedor Certificado", cert)


class TestIntegracao(unittest.TestCase):
    """Testes de integração: fluxo completo trilha → desafio → certificado."""

    def test_fluxo_completo_java(self):
        # 1. Busca trilha
        trilha = buscar_trilha("Java")
        self.assertIsNotNone(trilha)

        # 2. Gera plano de estudos
        plano = gerar_plano_estudos(trilha)
        self.assertIn("Desenvolvedor Java Completo", plano)

        # 3. Gera desafio
        desafio = gerar_desafio(trilha["tecnologia"], trilha["nivel"])
        self.assertIn("Java", desafio)
        self.assertIn("Intermediário", desafio)

        # 4. Gera certificado
        cert = gerar_certificado("João Silva", trilha["tecnologia"])
        self.assertIn("João Silva", cert)
        self.assertIn("CONCLUÍDO", cert)

    def test_todas_trilhas_tem_badges_nao_vazias(self):
        data = load_trilhas()
        for t in data["trilhas"]:
            self.assertGreater(len(t["badges_disponiveis"]), 0,
                               f"Trilha '{t['nome']}' sem badges")

    def test_todas_trilhas_tem_pelo_menos_uma_live(self):
        data = load_trilhas()
        for t in data["trilhas"]:
            self.assertGreater(len(t["lives_ao_vivo"]), 0,
                               f"Trilha '{t['nome']}' sem lives")


# ===========================================================================
#  RUNNER COM RELATÓRIO
# ===========================================================================

if __name__ == "__main__":
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(__import__(__name__))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
