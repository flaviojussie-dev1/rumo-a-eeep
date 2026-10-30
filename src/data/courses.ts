import {
  CursoData,
  DisciplinaConfig,
  EscolaEEEP,
  ModalidadeInfo,
  ModalidadeKey,
} from '../types/eeep';
import { loadAllEscolasFromData } from './schoolLoader';

export const MODALIDADES_CONFIG: Record<ModalidadeKey, ModalidadeInfo> = {
  pub_ampla: {
    key: 'pub_ampla',
    label: 'Escola Pública — Ampla Concorrência',
    shortLabel: 'Pública Ampla',
    description: 'Estudantes que cursaram o Ensino Fundamental em escola pública.',
    origemEscola: 'publica',
    vagasTipicas: '23 a 25 vagas (55%)',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  },
  pub_proximidade: {
    key: 'pub_proximidade',
    label: 'Escola Pública — Cota de Proximidade',
    shortLabel: 'Pública Proximidade',
    description: 'Estudantes de escola pública residentes no município/bairros vizinhos da EEEP.',
    origemEscola: 'publica',
    vagasTipicas: '10 a 12 vagas (25%)',
    badgeColor: 'bg-teal-500/15 text-teal-700 border-teal-500/30',
  },
  part_ampla: {
    key: 'part_ampla',
    label: 'Escola Particular — Ampla Concorrência',
    shortLabel: 'Particular Ampla',
    description: 'Estudantes oriundos da rede privada de ensino em concorrência geral.',
    origemEscola: 'particular',
    vagasTipicas: '6 a 7 vagas (15%)',
    badgeColor: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  },
  part_proximidade: {
    key: 'part_proximidade',
    label: 'Escola Particular — Cota de Proximidade',
    shortLabel: 'Particular Proximidade',
    description: 'Estudantes de rede privada residentes no município/bairros adjacentes à EEEP.',
    origemEscola: 'particular',
    vagasTipicas: '2 a 3 vagas (5%)',
    badgeColor: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
  },
  pcd: {
    key: 'pcd',
    label: 'Pessoa com Deficiência (PCD)',
    shortLabel: 'Cota PCD',
    description: 'Vagas reservadas para estudantes com deficiência comprovada por laudo médico.',
    origemEscola: 'ambas',
    vagasTipicas: '2 vagas (5%)',
    badgeColor: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
  },
};

export const DISCIPLINAS_CONFIG: DisciplinaConfig[] = [
  { key: 'portugues', label: 'Língua Portuguesa', short: 'Português' },
  { key: 'matematica', label: 'Matemática', short: 'Matemática' },
  { key: 'ciencias', label: 'Ciências', short: 'Ciências' },
  { key: 'historia', label: 'História', short: 'História' },
  { key: 'geografia', label: 'Geografia', short: 'Geografia' },
  { key: 'ingles', label: 'Língua Inglesa', short: 'Inglês' },
  { key: 'artes', label: 'Artes', short: 'Artes' },
  { key: 'educacao_fisica', label: 'Educação Física', short: 'Ed. Física' },
  { key: 'ensino_religioso', label: 'Ensino Religioso', short: 'Ens. Religioso' },
];

export const ANOS_ESCOLARES: { key: '6ano' | '7ano' | '8ano' | '9ano'; label: string; short: string }[] = [
  { key: '6ano', label: '6º Ano Fundamental', short: '6º Ano' },
  { key: '7ano', label: '7º Ano Fundamental', short: '7º Ano' },
  { key: '8ano', label: '8º Ano Fundamental', short: '8º Ano' },
  { key: '9ano', label: '9º Ano Fundamental', short: '9º Ano' },
];

// All schools are dynamically discovered and computed from the JSONs in the /data directory!
export const ESCOLAS_EEEP: EscolaEEEP[] = loadAllEscolasFromData();

// Flat list of all courses across all schools
export const CURSOS_EEEP: CursoData[] = ESCOLAS_EEEP.flatMap((e) => e.cursos);
