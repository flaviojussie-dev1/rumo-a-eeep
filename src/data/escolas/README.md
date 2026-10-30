# Base de Dados das Escolas EEEP (Oráculo Rumo à EEEP)

Esta pasta `src/data/escolas/` é o **cérebro documental** do aplicativo. O sistema possui um **motor dinâmico inteligente** (`schoolLoader.ts`) que descobre automaticamente as pastas e arquivos JSON das escolas, calcula as estatísticas e popula o aplicativo sem que você precise digitar uma única nota ou corte no código TypeScript.

---

## 📁 Estrutura de Pastas

Cada escola possui sua própria pasta dentro de `src/data/escolas/`:

```text
src/data/
├── courses.ts                <-- Exportações unificadas
├── schoolLoader.ts           <-- Carregador e motor dinâmico
└── escolas/
    ├── edson_queiroz/            <-- Pasta da Escola (ex: EEEP Edson Queiroz)
    │   ├── escola.json           <-- Metadados da Escola (Nome, Município, etc.)
    │   ├── 2024.json             <-- Processo Seletivo 2024 (Classificados brutos)
    │   ├── 2025.json             <-- Processo Seletivo 2025
    │   └── 2026.json             <-- Processo Seletivo 2026
    ├── pedro_queiroz/            <-- EEEP Pedro de Queiroz Lima (Beberibe)
    │   ├── escola.json
    │   └── cursos_estimados.json <-- (Usado enquanto aguarda os JSONs reais dos anos)
    └── jose_carlos_reboucas/     <-- EEEP Prof. José Carlos Rebouças (Pindoretama)
        ├── escola.json
        └── cursos_estimados.json
```

---

## 🚀 Como Adicionar Uma Nova Escola em 2 Passos

### Passo 1: Criar a pasta e o `escola.json`
Crie uma pasta com o ID da escola (ex: `data/eeep_maranguape/`) e adicione o arquivo `escola.json`:

```json
{
  "id": "eeep_maranguape",
  "nome": "EEEP Salaberga Torquato Gomes de Matos",
  "municipio": "Maranguape",
  "crede": "CREDE 01 - Maracanaú",
  "endereco": "Rua Mundica Paula, s/n - Maranguape - CE",
  "telefone": "(85) 3369-1234",
  "bairrosProximidade": [
    "Centro",
    "Outra Banda",
    "Guabiraba"
  ]
}
```

> 💡 **Dica de Inteligência Automática:** Se você não preencher `bairrosProximidade`, o sistema extrai automaticamente todos os bairros dos alunos da cota `pub_proximidade` dos JSONs!

### Passo 2: Jogar os JSONs dos anos dentro da pasta
Você pode jogar os arquivos de cada ano (ex: `2024.json`, `2025.json`, `2026.json`, `historico_eeep_2026.json`) ou um arquivo único multi-ano (`historico_notas_completo.json`).

O formato de cada ano é o mesmo que a SEDUC gera nos relatórios:

```json
{
  "enfermagem": {
    "nome_oficial": "1º Enfermagem 2026",
    "modalidades": {
      "pub_ampla": [
        { "posicao": 1, "aluno": "MARIA SILVA", "media": 9.72 },
        { "posicao": 2, "aluno": "JOAO SANTOS", "media": 9.50 },
        { "posicao": 24, "aluno": "ANA LIMA", "media": 9.30 }
      ],
      "pub_proximidade": [ ... ],
      "part_ampla": [ ... ],
      "part_proximidade": [ ... ],
      "pcd": [ ... ]
    }
  },
  "informatica": { ... }
}
```

---

## 🧠 O que o Sistema Faz Automaticamente:

1. **Calcula as Notas de Corte e Médias**:
   - `nota_corte` = menor nota classificada naquela cota
   - `maior_nota` = nota mais alta da turma
   - `media_modalidade` = média aritmética de todos os aprovados
   - `vagas` = total real de alunos classificados
2. **Identifica o Tipo da Base**:
   - Se houver JSONs de anos reais na pasta, a escola ganha o selo oficial `Base 100% Real Auditada`.
   - Se for uma escola nova apenas com `escola.json` e `cursos_estimados.json`, recebe o selo `Estimativa Regional`.
3. **Catálogo de Cursos Automático**:
   - O sistema reconhece automaticamente os cursos (`enfermagem`, `informatica`, `agroindustria`, `guia_turismo`, `turismo`, `meio_ambiente`, `logistica`, `administracao`, etc.), aplicando cores, ícones, mercado de trabalho no Ceará e grade curricular.
   - Para cursos novos (ex: `edificacoes`, `quimica`), gera automaticamente um perfil formatado com paleta harmoniosa.
4. **Atualização Instantânea**:
   - Basta colar o arquivo JSON na pasta que o Vite atualiza a aplicação em tempo real!

---

## 🔒 Pseudonimização dos Nomes (LGPD)

Os arquivos `<ano>.json` derivam de editais públicos da SEDUC-CE, mas **não republicam nomes de candidatos**: cada campo `aluno` é substituído por um identificador pseudônimo determinístico `CANDIDATO_<hash SHA-256 de 8 caracteres>` (mesmo nome → mesmo código, permitindo auditoria longitudinal sem reversibilidade).

- Campos preservados integralmente: `posicao`, `media`, `concorrencia`, `bairro` — todos os cálculos do motor (notas de corte, vagas, probabilidades Monte Carlo) dependem apenas deles.
- **Ao ingerir novos anos/edições, aplicar a mesma pseudonimização antes de commitar.**
