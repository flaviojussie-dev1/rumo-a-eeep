import {
  AnoData,
  CursoData,
  EscolaEEEP,
  ModalidadeKey,
  ModalidadeStats,
} from '../types/eeep';

// Central metadata catalog for known EEEP courses in Ceará
interface CourseCatalogEntry {
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
  notaHistorico?: string;
}

const CATALOGO_CURSOS: Record<string, CourseCatalogEntry> = {
  enfermagem: {
    nome: 'Técnico em Enfermagem',
    categoria: 'Saúde & Cuidado',
    cor: 'rose',
    corHex: '#e11d48',
    icone: 'Activity',
    descricao: 'Formação técnica hospitalar e ambulatorial de referência para a rede pública e privada.',
    perfilProfissional: 'Atenção primária, enfermagem hospitalar, biossegurança e assistência integral ao paciente.',
    mercadoTrabalhoCeara: 'Hospitais municipais, UPAs regionais, postos de saúde da família e hospitais metropolitanos.',
    estagioSupervisionado: '6 meses de estágio hospitalar no 3º ano com bolsa remunerada pelo Governo do Estado do Ceará.',
    disciplinasDestaque: ['Anatomia e Fisiologia Humana', 'Fundamentos de Enfermagem', 'Farmacologia Básica', 'Saúde Coletiva e SUS'],
  },
  informatica: {
    nome: 'Técnico em Informática',
    categoria: 'Tecnologia & Inovação',
    cor: 'cyan',
    corHex: '#0891b2',
    icone: 'Cpu',
    descricao: 'Desenvolvimento de software web e mobile, redes de computadores e automação digital.',
    perfilProfissional: 'Lógica, programação JavaScript/Python, banco de dados, infraestrutura de redes e sistemas.',
    mercadoTrabalhoCeara: 'Empresas de TI do Ceará, polos digitais de Fortaleza/Eusébio, comércios locais e trabalho remoto.',
    estagioSupervisionado: 'Estágio curricular de 6 meses em empresas e departamentos de TI parceiros da SEDUC.',
    disciplinasDestaque: ['Lógica de Programação', 'Desenvolvimento Web Full Stack', 'Banco de Dados', 'Redes de Comunicação'],
  },
  agroindustria: {
    nome: 'Técnico em Agroindústria',
    categoria: 'Produção & Bioeconomia',
    cor: 'emerald',
    corHex: '#059669',
    icone: 'Sprout',
    descricao: 'Beneficiamento de matérias-primas agropecuárias, processamento de alimentos e controle de qualidade.',
    perfilProfissional: 'Boas Práticas de Fabricação (BPF), gestão agroindustrial, sanitização e conservação de derivados alimentícios.',
    mercadoTrabalhoCeara: 'Indústrias de alimentos, cooperativas agrícolas, laticínios e processamento de frutas da região.',
    estagioSupervisionado: 'Estágio curricular de 6 meses em plantas agroindustriais e laboratórios de análise de alimentos.',
    disciplinasDestaque: ['Tecnologia de Carnes e Laticínios', 'Microbiologia de Alimentos', 'Controle Sanitário e BPF', 'Gestão Agroindustrial'],
    notaHistorico: 'Em alguns processos seletivos anteriores a matriz correspondente era Vestuário, sendo substituída por Agroindústria.',
  },
  guia_turismo: {
    nome: 'Técnico em Guia de Turismo',
    categoria: 'Hospitalidade & Turismo',
    cor: 'amber',
    corHex: '#d97706',
    icone: 'Compass',
    descricao: 'Planejamento e condução de roteiros turísticos, hospitalidade e valorização do patrimônio regional e litorâneo.',
    perfilProfissional: 'Recepção e condução de visitantes, guiamento ecológico e cultural, hotelaria e relações públicas.',
    mercadoTrabalhoCeara: 'Pousadas e hotéis do litoral, receptivos turísticos de Fortaleza e Litoral Leste, feiras e eventos.',
    estagioSupervisionado: 'Estágio curricular de 6 meses em meios de hospedagem e agências de receptivo credenciadas.',
    disciplinasDestaque: ['Técnicas de Guiamento e Condução', 'Patrimônio Histórico e Cultural do Ceará', 'Geografia Turística', 'Inglês & Espanhol Instrumental'],
  },
  turismo: {
    nome: 'Técnico em Hospedagem & Turismo',
    categoria: 'Hospitalidade & Eventos',
    cor: 'amber',
    corHex: '#d97706',
    icone: 'Compass',
    descricao: 'Formação especializada em hotelaria, turismo de praia e eventos regionais.',
    perfilProfissional: 'Hotelaria, atendimento a visitantes, roteirização turística e organização de eventos.',
    mercadoTrabalhoCeara: 'Pousadas, resorts e hotéis da orla costeira cearense e agências de ecoturismo.',
    estagioSupervisionado: 'Estágio supervisionado em meios de hospedagem e operadoras do Litoral Leste.',
    disciplinasDestaque: ['Meios de Hospedagem', 'Ecoturismo e Roteiros', 'Inglês & Espanhol Instrumental', 'Organização de Eventos'],
  },
  meio_ambiente: {
    nome: 'Técnico em Meio Ambiente & Aquicultura',
    categoria: 'Sustentabilidade & Recursos',
    cor: 'teal',
    corHex: '#0d9488',
    icone: 'Sprout',
    descricao: 'Gestão ambiental costeira, conservação ecológica e cultivo sustentável aquícola.',
    perfilProfissional: 'Licenciamento ambiental, monitoramento ecológico, carcinicultura e educação ambiental.',
    mercadoTrabalhoCeara: 'Fazendas aquícolas, secretarias municipais de meio ambiente, ONGs e consultorias ambientais.',
    estagioSupervisionado: 'Estágio supervisionado em empreendimentos aquícolas e órgãos de gestão ambiental.',
    disciplinasDestaque: ['Gestão Ambiental Costeira', 'Cultivo de Organismos Aquáticos', 'Legislação Ambiental', 'Qualidade da Água'],
  },
  logistica: {
    nome: 'Técnico em Logística & Comércio',
    categoria: 'Gestão & Negócios',
    cor: 'blue',
    corHex: '#2563eb',
    icone: 'Compass',
    descricao: 'Gestão da cadeia de suprimentos, centros de distribuição e logística comercial integrada.',
    perfilProfissional: 'Estoque, compras, expedição, rotas de transporte e atendimento logístico.',
    mercadoTrabalhoCeara: 'Centros de distribuição ao longo de rodovias estaduais, transportadoras e atacarejos.',
    estagioSupervisionado: 'Estágio prático em operadores logísticos e centros de distribuição.',
    disciplinasDestaque: ['Gestão de Estoques e Armazenagem', 'Transporte e Distribuição', 'Custos Logísticos', 'Comércio Exterior'],
  },
  administracao: {
    nome: 'Técnico em Administração',
    categoria: 'Gestão & Negócios',
    cor: 'indigo',
    corHex: '#4f46e5',
    icone: 'Briefcase',
    descricao: 'Planejamento empresarial, finanças, gestão de pessoas e processos de negócios.',
    perfilProfissional: 'Organização, liderança, análise de processos de negócios e empreendedorismo.',
    mercadoTrabalhoCeara: 'Setor de comércio e serviços, prefeituras, órgãos públicos e empresas privadas.',
    estagioSupervisionado: 'Estágio em escritórios administrativos, órgãos municipais e empresas comerciais.',
    disciplinasDestaque: ['Gestão de Pessoas', 'Contabilidade & Finanças', 'Marketing & Vendas', 'Empreendedorismo'],
  },
  agronegocio: {
    nome: 'Técnico em Agronegócio',
    categoria: 'Produção & Gestão Rural',
    cor: 'emerald',
    corHex: '#059669',
    icone: 'Sprout',
    descricao: 'Gestão da cadeia produtiva agropecuária, comercialização e tecnologias para a produção sustentável.',
    perfilProfissional: 'Planejamento e controle da produção agropecuária, custos rurais, gestão de cooperativas e comercialização.',
    mercadoTrabalhoCeara: 'Propriedades rurais, agroindústrias, cooperativas de Pindoretama e Litoral Leste, e órgãos de extensão rural.',
    estagioSupervisionado: 'Estágio curricular supervisionado de 6 meses em empresas e propriedades agropecuárias.',
    disciplinasDestaque: ['Gestão do Agronegócio', 'Cadeias Produtivas Agropecuárias', 'Custos Rurais e Comercialização', 'Sustentabilidade no Campo'],
  },
  seguranca_do_trabalho: {
    nome: 'Técnico em Segurança do Trabalho',
    categoria: 'Saúde & Segurança Ocupacional',
    cor: 'amber',
    corHex: '#d97706',
    icone: 'ShieldCheck',
    descricao: 'Prevenção de acidentes, programas de saúde ocupacional e conformidade com Normas Regulamentadoras (NRs).',
    perfilProfissional: 'Inspeção de ambientes laborais, treinamentos de CIPA e EPIs, gestão de riscos e laudos ocupacionais.',
    mercadoTrabalhoCeara: 'Indústrias da Região Metropolitana, canteiros de obras, hospitais, cooperativas e empresas comerciais.',
    estagioSupervisionado: 'Estágio supervisionado em departamentos de Segurança do Trabalho e SESMT da região.',
    disciplinasDestaque: ['Normas Regulamentadoras (NRs)', 'Higiene e Toxicologia Ocupacional', 'Prevenção e Combate a Sinistros', 'Ergonomia'],
  },
  edificacoes: {
    nome: 'Técnico em Edificações',
    categoria: 'Infraestrutura & Construção Civil',
    cor: 'amber',
    corHex: '#d97706',
    icone: 'Building2',
    descricao: 'Planejamento e execução de obras civis, desenho técnico arquitetônico (CAD/BIM) e controle de materiais.',
    perfilProfissional: 'Leitura de projetos, topografia, orçamento de obras, medições e supervisão de canteiros de obras.',
    mercadoTrabalhoCeara: 'Construtoras do litoral e Região Metropolitana, escritórios de arquitetura, prefeituras e reformas civis.',
    estagioSupervisionado: 'Estágio curricular de 6 meses em empresas de construção civil e projetos de engenharia.',
    disciplinasDestaque: ['Desenho Arquitetônico & CAD', 'Topografia e Sondagem', 'Materiais de Construção', 'Orçamento e Planejamento de Obras'],
  },
  eletrotecnica: {
    nome: 'Técnico em Eletrotécnica',
    categoria: 'Energia & Controle',
    cor: 'amber',
    corHex: '#f59e0b',
    icone: 'Zap',
    descricao: 'Instalações elétricas prediais e industriais, automação, energia solar e redes de distribuição.',
    perfilProfissional: 'Projetos elétricos, manutenção eletromecânica, energia renovável fotovoltaica e segurança em eletricidade (NR-10).',
    mercadoTrabalhoCeara: 'Parques eólicos e solares do Ceará, Enel/prestadoras, indústrias, instaladoras e comércio elétrico.',
    estagioSupervisionado: 'Estágio curricular de 6 meses em concessionárias de energia, instaladoras solares e indústrias.',
    disciplinasDestaque: ['Circuitos Elétricos', 'Instalações Elétricas Industriais', 'Energia Solar Fotovoltaica', 'Máquinas e Acionamentos'],
  },
  hospedagem: {
    nome: 'Técnico em Hospedagem',
    categoria: 'Hospitalidade & Turismo',
    cor: 'amber',
    corHex: '#d97706',
    icone: 'Compass',
    descricao: 'Operações hoteleiras, governança, recepção, serviços de alimentos e hospitalidade litorânea.',
    perfilProfissional: 'Atendimento e recepção hoteleira, gestão de reservas, alimentos e bebidas e organização de hospitalidade.',
    mercadoTrabalhoCeara: 'Hotéis e resorts do litoral cearense (Beberibe/Morro Branco/Praia das Fontes), pousadas e eventos.',
    estagioSupervisionado: 'Estágio supervisionado em meios de hospedagem e resorts da Costa do Sol Poente e Leste.',
    disciplinasDestaque: ['Recepção e Governança Hoteleira', 'Serviços de Alimentos & Bebidas', 'Inglês & Espanhol para Hotelaria', 'Gestão de Hospitalidade'],
  },
};

// Map historical matrix alias transitions
const COURSE_KEY_ALIASES: Record<string, string> = {
  vestuario: 'agroindustria',
  turismo: 'guia_turismo',
  seguranca_trabalho: 'seguranca_do_trabalho',
  segurancadotrabalho: 'seguranca_do_trabalho',
  edificacao: 'edificacoes',
};

// Fallback for completely unknown course names
function createDefaultCourseEntry(key: string): CourseCatalogEntry {
  const formatted = key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return {
    nome: `Técnico em ${formatted}`,
    categoria: 'Educação Profissional',
    cor: 'emerald',
    corHex: '#059669',
    icone: 'Briefcase',
    descricao: `Formação técnica integrada ao Ensino Médio em ${formatted}.`,
    perfilProfissional: `Competências técnicas e formação profissional para o mercado cearense de ${formatted}.`,
    mercadoTrabalhoCeara: 'Empresas do setor produtivo do Ceará e prestação autônoma de serviços.',
    estagioSupervisionado: 'Estágio curricular supervisionado de 6 meses com bolsa do Governo do Estado.',
    disciplinasDestaque: ['Fundamentos Técnicos', 'Gestão & Empreendedorismo', 'Ética Profissional'],
  };
}

export function getCourseCatalog(key: string): CourseCatalogEntry {
  const normalizedKey = key.toLowerCase().trim();
  const canonicalKey = COURSE_KEY_ALIASES[normalizedKey] || normalizedKey;
  return CATALOGO_CURSOS[canonicalKey] || CATALOGO_CURSOS[normalizedKey] || createDefaultCourseEntry(key);
}

const MODALIDADE_KEYS: ModalidadeKey[] = [
  'pub_ampla',
  'pub_proximidade',
  'part_ampla',
  'part_proximidade',
  'pcd',
];

interface AlunoEntry {
  posicao?: number;
  aluno?: string;
  media: number;
  bairro?: string;
  obs?: string;
  concorrencia?: string;
}

interface RawModalidades {
  pub_ampla?: AlunoEntry[];
  pub_proximidade?: AlunoEntry[];
  part_ampla?: AlunoEntry[];
  part_proximidade?: AlunoEntry[];
  pcd?: AlunoEntry[];
  [key: string]: any;
}

interface RawCourseData {
  nome_oficial?: string;
  modalidades?: RawModalidades;
  [key: string]: any;
}

/**
 * Automatically loads and processes all schools and course datasets from /src/data
 * Supported structure per school directory:
 * - src/data/escolas/<schoolId>/escola.json (School metadata)
 * - src/data/escolas/<schoolId>/<year>.json (e.g. 2024.json, 2025.json, 2026.json, or historico_eeep_2026.json)
 * - src/data/escolas/<schoolId>/historico_notas_completo.json (Multi-year combined JSON)
 * - src/data/escolas/<schoolId>/cursos_estimados.json (Fallback for estimated schools without raw PDF/JSON lists)
 */
export function loadAllEscolasFromData(): EscolaEEEP[] {
  // Vite eager glob import of all JSONs under /src/data
  const allJsonModules = import.meta.glob<Record<string, any>>('/src/data/**/*.json', {
    eager: true,
  });

  // Group files by school folder
  const foldersMap = new Map<string, { [filename: string]: any }>();

  for (const [filePath, moduleContent] of Object.entries(allJsonModules)) {
    const parts = filePath.replace(/^\//, '').split('/');
    // Must be at least inside a subfolder, e.g. ["src", "data", "escolas", "edson_queiroz", "2026.json"]
    if (parts.length < 4) continue;

    // The folder immediately containing the JSON file is the school folder name
    const schoolFolder = parts[parts.length - 2];
    const filename = parts[parts.length - 1];
    const content = (moduleContent as any).default || moduleContent;

    if (!foldersMap.has(schoolFolder)) {
      foldersMap.set(schoolFolder, {});
    }
    foldersMap.get(schoolFolder)![filename] = content;
  }

  const escolas: EscolaEEEP[] = [];

  for (const [folderName, files] of foldersMap.entries()) {
    const escolaJson = files['escola.json'] || {};
    const schoolId = escolaJson.id || folderName;
    const schoolNome = escolaJson.nome || folderName.replace(/_/g, ' ').toUpperCase();
    const municipio = escolaJson.municipio || 'Cascavel';
    const crede = escolaJson.crede || 'CREDE 09 - Horizonte';
    const endereco = escolaJson.endereco || '';
    const telefone = escolaJson.telefone || '';
    let bairrosProximidade: string[] = Array.isArray(escolaJson.bairrosProximidade)
      ? [...escolaJson.bairrosProximidade]
      : [];

    // Collect year data for this school
    // Map: courseKey -> Map<year, Record<ModalidadeKey, ModalidadeStats>>
    const courseYearData = new Map<string, Map<number, Record<ModalidadeKey, ModalidadeStats>>>();
    const courseNotes = new Map<string, string>();
    const autoExtractedBairros = new Set<string>();

    let hasRawYearData = false;

    // Helper to process a single year of raw courses
    const processYearCourses = (year: number, rawCoursesObj: Record<string, RawCourseData>) => {
      hasRawYearData = true;

      // Unpack if wrapped in a container like { cursos: { ... } }
      const actualCourses = ((rawCoursesObj as any)?.cursos && typeof (rawCoursesObj as any).cursos === 'object')
        ? (rawCoursesObj as any).cursos
        : rawCoursesObj;

      for (const [rawKey, courseContent] of Object.entries(actualCourses as Record<string, any>)) {
        if (!courseContent || typeof courseContent !== 'object') continue;

        const canonicalKey = COURSE_KEY_ALIASES[rawKey.toLowerCase()] || rawKey.toLowerCase();

        if (rawKey.toLowerCase() === 'vestuario') {
          courseNotes.set(
            canonicalKey,
            'Em 2024 a matriz correspondente era o 1º Vestuário, sendo substituído por Agroindústria a partir do processo seletivo de 2025.'
          );
        } else if (rawKey.toLowerCase() === 'turismo') {
          courseNotes.set(
            canonicalKey,
            'Denominado 1º Guia de Turismo em 2024 e 2026, e 1º Turismo em 2025.'
          );
        }

        if (!courseYearData.has(canonicalKey)) {
          courseYearData.set(canonicalKey, new Map());
        }

        const yearMap = courseYearData.get(canonicalKey)!;
        const modalidadesStats = {} as Record<ModalidadeKey, ModalidadeStats>;
        const rawModalidades = courseContent.modalidades || courseContent.classificados || {};

        for (const modKey of MODALIDADE_KEYS) {
          const list: AlunoEntry[] = Array.isArray(rawModalidades[modKey])
            ? rawModalidades[modKey]
            : [];

          const validGrades = list
            .map((item) => (typeof item?.media === 'number' && !isNaN(item.media) ? item.media : null))
            .filter((g): g is number => g !== null);

          // Extract actual neighborhood names if present
          if (modKey === 'pub_proximidade' || modKey === 'part_proximidade') {
            for (const item of list) {
              if (item?.bairro && typeof item.bairro === 'string') {
                const b = item.bairro.trim();
                if (b.length > 1) {
                  // Format title case (e.g. "RIO NOVO" -> "Rio Novo")
                  const formatted = b
                    .toLowerCase()
                    .split(' ')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                  autoExtractedBairros.add(formatted);
                }
              }
            }
          }

          if (validGrades.length > 0) {
            const nota_corte = Number(Math.min(...validGrades).toFixed(2));
            const maior_nota = Number(Math.max(...validGrades).toFixed(2));
            const sum = validGrades.reduce((acc, curr) => acc + curr, 0);
            const media_modalidade = Number((sum / validGrades.length).toFixed(2));

            modalidadesStats[modKey] = {
              vagas: validGrades.length,
              nota_corte,
              maior_nota,
              media_modalidade,
              medias: [...validGrades].sort((a, b) => b - a), // p/ estimativa de colocação
            };
          } else {
            modalidadesStats[modKey] = {
              vagas: 0,
              nota_corte: 0,
              maior_nota: 0,
              media_modalidade: 0,
            };
          }
        }

        yearMap.set(year, modalidadesStats);
      }
    };

    // Scan all files in this school's folder for raw data
    for (const [filename, fileContent] of Object.entries(files)) {
      if (filename === 'escola.json' || filename === 'cursos_estimados.json') continue;

      // Case 1: Multi-year JSON (e.g. historico_notas_completo.json) with root keys "2024", "2025", etc.
      if (
        fileContent &&
        typeof fileContent === 'object' &&
        !Array.isArray(fileContent)
      ) {
        const rootKeys = Object.keys(fileContent);
        const hasYearKeys = rootKeys.some((k) => /^\d{4}$/.test(k));

        if (hasYearKeys) {
          for (const yearStr of rootKeys) {
            const yr = parseInt(yearStr, 10);
            if (!isNaN(yr) && typeof fileContent[yearStr] === 'object') {
              processYearCourses(yr, fileContent[yearStr]);
            }
          }
          continue;
        }
      }

      // Case 2: Individual Year JSON file (e.g. "2024.json" or "historico_eeep_2026.json")
      const yearMatch = filename.match(/(20\d{2})/);
      if (yearMatch && fileContent && typeof fileContent === 'object') {
        const yr = parseInt(yearMatch[1], 10);
        processYearCourses(yr, fileContent as Record<string, RawCourseData>);
      }
    }

    // If bairrosProximidade was not explicitly configured, use auto-extracted ones
    if (bairrosProximidade.length === 0 && autoExtractedBairros.size > 0) {
      bairrosProximidade = Array.from(autoExtractedBairros).sort();
    }

    let finalCursos: CursoData[] = [];

    if (hasRawYearData && courseYearData.size > 0) {
      // Build CursoData from processed real raw historical data
      for (const [courseKey, yearsMap] of courseYearData.entries()) {
        const catalog = getCourseCatalog(courseKey);
        const historicoList: AnoData[] = [];

        // Sort years ascending
        const sortedYears = Array.from(yearsMap.keys()).sort((a, b) => a - b);
        for (const yr of sortedYears) {
          historicoList.push({
            ano: yr,
            modalidades: yearsMap.get(yr)!,
          });
        }

        finalCursos.push({
          id: `${schoolId}_${courseKey}`,
          nome: catalog.nome,
          categoria: catalog.categoria,
          cor: catalog.cor,
          corHex: catalog.corHex,
          icone: catalog.icone,
          descricao: catalog.descricao,
          perfilProfissional: catalog.perfilProfissional,
          mercadoTrabalhoCeara: catalog.mercadoTrabalhoCeara,
          estagioSupervisionado: catalog.estagioSupervisionado,
          disciplinasDestaque: catalog.disciplinasDestaque,
          total_vagas: 45,
          historico: historicoList,
          notaHistorico: courseNotes.get(courseKey) || catalog.notaHistorico,
        });
      }
    } else if (Array.isArray(files['cursos_estimados.json'])) {
      // Fallback for estimated school without raw PDFs/JSONs
      finalCursos = files['cursos_estimados.json'];
    }

    const tipoBase: 'oficial' | 'estimativa' =
      escolaJson.tipoBase || (hasRawYearData ? 'oficial' : 'estimativa');

    // Dynamic year range derived directly from loaded historical files
    const schoolYears = Array.from(
      new Set(finalCursos.flatMap((c) => c.historico.map((h) => h.ano)))
    ).sort((a, b) => a - b);

    const dynamicYearText =
      schoolYears.length > 1
        ? ` (${schoolYears[0]} a ${schoolYears[schoolYears.length - 1]})`
        : schoolYears.length === 1
        ? ` (${schoolYears[0]})`
        : '';

    const descricaoBase =
      tipoBase === 'oficial'
        ? `Base Oficial SEDUC-CE${dynamicYearText}`
        : (escolaJson.descricaoBase || 'Estimativa Calibrada CREDE 09 (Aguardando edital)');

    escolas.push({
      id: schoolId,
      nome: schoolNome,
      municipio,
      crede,
      endereco,
      telefone,
      bairrosProximidade,
      cursos: finalCursos,
      tipoBase,
      descricaoBase,
    });
  }

  // Sort schools: Official first, then alphabetically
  return escolas.sort((a, b) => {
    if (a.tipoBase === 'oficial' && b.tipoBase !== 'oficial') return -1;
    if (a.tipoBase !== 'oficial' && b.tipoBase === 'oficial') return 1;
    return a.nome.localeCompare(b.nome);
  });
}
