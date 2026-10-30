export type ModalidadeKey =
  | 'pub_ampla'
  | 'pub_proximidade'
  | 'part_ampla'
  | 'part_proximidade'
  | 'pcd';

export interface ModalidadeInfo {
  key: ModalidadeKey;
  label: string;
  shortLabel: string;
  description: string;
  origemEscola: 'publica' | 'particular' | 'ambas';
  vagasTipicas: string;
  badgeColor: string;
}

export interface ModalidadeStats {
  vagas: number;
  nota_corte: number;
  maior_nota: number;
  media_modalidade: number;
  inscritos?: number;
}

export interface AnoData {
  ano: number;
  modalidades: Record<ModalidadeKey, ModalidadeStats>;
}

export interface CursoData {
  id: string;
  nome: string;
  categoria: string;
  cor: string;
  corHex: string;
  icone: string;
  descricao: string;
  perfilProfissional: string;
  mercadoTrabalhoCeara: string;
  estagioSupervisionado: string;
  disciplinasDestaque: string[];
  total_vagas: number;
  historico: AnoData[];
  notaHistorico?: string;
}

export interface EscolaEEEP {
  id: string;
  nome: string;
  municipio: string;
  crede: string;
  endereco: string;
  telefone: string;
  bairrosProximidade: string[];
  cursos: CursoData[];
  tipoBase: 'oficial' | 'estimativa';
  descricaoBase?: string;
}

export interface ChanceResult {
  curso: CursoData;
  escola?: EscolaEEEP;
  modalidade: ModalidadeKey;
  notaAluno: number;
  cortesPorAno: Record<number, number>;
  corteMaisRecente: number;
  anoMaisRecente: number;
  corteProjetado: number;
  delta: number;
  probabilidade: number;
  probabilidadePrimeiraChamada?: number;
  probabilidadeListaEspera?: number;
  metodoEstimativa?: 'monte_carlo';
  simulacoesExecutadas?: number;
  faixa: 'muito_alta' | 'disputa' | 'espera' | 'baixa';
  faixaTitulo: string;
  faixaDescricao: string;
  faixaCor: string;
  badgeVariant: 'success' | 'warning' | 'orange' | 'danger';
  recomendacao: string;
  isCidadeDoAluno: boolean;
  volatilidadeEfetiva: number;
  anosHistoricosValidos: number;
  alertaCorteRecenteSuperior: boolean;
  diferencaRecenteProjetado: number;
  statusPillText: string;
  statusPillBg: string;
  statusPillColor: string;
  statusPillBorder: string;
}

export interface EscolaSimulationResult {
  escola: EscolaEEEP;
  modalidadeEfetiva: ModalidadeKey;
  isProximidadeAplicada: boolean;
  cursosResults: ChanceResult[];
  melhorCurso: ChanceResult;
  isCidadeDoAluno: boolean;
}

export type DisciplinaKey =
  | 'portugues'
  | 'matematica'
  | 'ciencias'
  | 'historia'
  | 'geografia'
  | 'ingles'
  | 'artes'
  | 'educacao_fisica'
  | 'ensino_religioso';

export interface DisciplinaConfig {
  key: DisciplinaKey;
  label: string;
  short: string;
}

export type AnoEscolarKey = '6ano' | '7ano' | '8ano' | '9ano';

export type BoletimCompleto = Record<AnoEscolarKey, Record<DisciplinaKey, number | null>>;

export type MunicipioResidencia = 'cascavel' | 'beberibe' | 'pindoretama' | 'outro';

export interface PerfilAluno {
  origemEscola: 'publica' | 'particular';
  municipioResidencia: MunicipioResidencia;
  moraProximidade: boolean;
  bairroSelecionado?: string;
  isPCD: boolean;
  modalidadeSelecionada: ModalidadeKey;
  escolasSelecionadas: string[];
  escolaProximidadeOverrides: Record<string, boolean>;
  planoCursos: string[];
  modoNota: 'rapido' | 'boletim';
  notaRapida: number | string;
  dataNascimento?: string;
  nome?: string;
}

export interface SimulationSummary {
  mediaFinal: number;
  notasPreenchidas: number;
  totalNotas: number;
  isCompleto: boolean;
}
