/**
 * Carrega e tipifica o arquivo trilhas_dio.json
 * Resolve o caminho relativo à raiz do projeto (../../data/trilhas_dio.json)
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho para: mpc/src/utils/ -> ../../data/trilhas_dio.json
const DATA_PATH = join(__dirname, "..", "..", "..", "data", "trilhas_dio.json");

export interface Promocao {
  desconto: string;
  validade: string | null;
  cupom: string | null;
}

export interface Live {
  titulo: string;
  data: string;
  horario: string;
}

export interface Trilha {
  id: number;
  nome: string;
  tecnologia: string;
  nivel: string;
  numero_de_modulos: number;
  xp_total: number;
  badges_disponiveis: string[];
  promocoes: Promocao;
  vitalicio: boolean;
  lives_ao_vivo: Live[];
}

export interface TrilhasData {
  trilhas: Trilha[];
  total_trilhas: number;
  ultima_atualizacao: string;
  fonte: string;
}

let _cache: TrilhasData | null = null;

export function loadTrilhas(): TrilhasData {
  if (_cache) return _cache;
  const raw = readFileSync(DATA_PATH, "utf-8");
  _cache = JSON.parse(raw) as TrilhasData;
  return _cache;
}

export function buscarTrilha(tecnologia: string): Trilha | undefined {
  const data = loadTrilhas();
  const termo = tecnologia.toLowerCase();
  return data.trilhas.find(
    (t) =>
      t.tecnologia.toLowerCase().includes(termo) ||
      t.nome.toLowerCase().includes(termo)
  );
}

export function listarTodasTrilhas(): Trilha[] {
  return loadTrilhas().trilhas;
}
