# Plano de Desenvolvimento — EEEP Orienta (PWA)

Este documento especifica a arquitetura técnica, as regras de negócio oficiais das Escolas Estaduais de Educação Profissional (EEEPs), a modelagem da base de dados bruta dos processos seletivos (2023, 2025 e 2026) e o motor estatístico client-side para simulação de chances de ingresso no ano vigente.

---

## 1. Regras de Negócio do Processo Seletivo EEEP

### 1.1. Cálculo da Média de Entrada do Candidato
Conforme as diretrizes da Secretaria da Educação do Ceará (SEDUC) para as EEEPs:
* **Período Considerado**: Todo o Ensino Fundamental II (**6º, 7º, 8º e 9º Ano**).
* **9 Disciplinas Obrigatórias**:
  1. Artes
  2. Ciências
  3. Educação Física
  4. Ensino Religioso
  5. Geografia
  6. História
  7. Inglês
  8. Matemática
  9. Língua Portuguesa
* **Cálculo da Média**:
  $$\text{Média do Ano } A = \frac{\sum_{d=1}^{9} \text{Nota}_{d, A}}{9}$$
  $$\text{Média Final do Candidato} (N) = \frac{\text{Média}_{6º} + \text{Média}_{7º} + \text{Média}_{8º} + \text{Média}_{9º}}{4} = \frac{\sum_{i=1}^{36} \text{Nota}_i}{36}$$
  *(Trabalhada com 2 casas decimais e arredondamento oficial do edital).*

### 1.2. Modos de Entrada no Aplicativo
1. **Modo Rápido**: O estudante informa diretamente sua Média Final (caso a escola já tenha emitido a declaração oficial com o cálculo consolidado).
2. **Calculadora Completa (Grade de 36 Notas)**:
   * Interface mobile-first com abas colapsáveis por ano letivo (6º, 7º, 8º e 9º).
   * Validação em tempo real (notas entre 0.00 e 10.00) e salto automático de foco entre campos para agilizar a digitação no smartphone.
   * Feedback instantâneo da média anual e geral acumulada.
3. **Modo Projeção ("O que preciso tirar no 9º Ano?")**:
   * Permite ao aluno simular notas parciais e visualizar qual média precisa atingir no restante do ano para alcançar a zona de segurança do curso desejado.

### 1.3. Mapeamento de Vagas e Modalidades de Concorrência
Em turmas padrão de **45 vagas**, a distribuição segue as cotas do edital:

| Modalidade de Concorrência | Chave no JSON | Descrição no Edital | Vagas Típicas |
| :--- | :--- | :--- | :---: |
| **Pública — Proximidade** | `pub_proximidade` | Alunos de escola pública residentes no entorno da escola | 10 a 12 |
| **Pública — Ampla** | `pub_ampla` | Demais alunos oriundos da rede pública | 23 a 28 |
| **Particular — Proximidade**| `part_proximidade`| Alunos da rede privada residentes no entorno | 1 a 3 |
| **Particular — Ampla** | `part_ampla` | Demais alunos da rede privada | 5 a 8 |
| **PCD** | `pcd` | Candidatos com deficiência comprovada (com divisão Proximidade/Ampla) | 1 a 2 |

---

## 2. Base de Dados em JSON (`historico_notas_completo.json`)

O banco opera como **repositório documental bruto**, preservando a íntegra dos candidatos classificados sem pré-calcular nem fixar cortes no arquivo. Todo o processamento estatístico ocorre no cliente.

### 2.1. Estrutura Estratificada
```json
{
  "2023": {
    "agroindustria": {
      "nome_oficial": "1º Vestuário 2023",
      "modalidades": {
        "pub_proximidade": [
          {"posicao": 1, "aluno": "LARISSE DE SOUZA SILVA", "media": 8.21, "bairro": "MUTIRÃO"}
        ],
        "pub_ampla": [...],
        "part_proximidade": [...],
        "part_ampla": [...],
        "pcd": [...]
      }
    },
    "enfermagem": { ... },
    "informatica": { ... },
    "guia_turismo": { ... }
  },
  "2025": { ... },
  "2026": { ... }
}
```

### 2.2. Consolidação da Série Histórica
* **2023**: Cursos ofertados — *1º Vestuário*, *1º Enfermagem*, *1º Informática* e *1º Guia de Turismo*.
* **2025**: Mudança da matriz para *1º Agroindústria*, além de *Enfermagem*, *Informática* e *Turismo*.
* **2026**: Discriminação explícita de cotas PCD (`PCD/PROXIMIDADE` e `PCD/ALMPLA`) e reajuste dinâmico de vagas da rede particular.

---

## 3. Motor Estatístico Client-Side para o Ano Vigente

### 3.1. Algoritmo de Extração de Métricas
Para cada curso e modalidade selecionada pelo aluno:
1. **Identificação dos Cortes Históricos ($C_t$)**:
   $$C_t = \text{última nota classificada na modalidade em } t \in \{2023, 2025, 2026\}$$
2. **Corte Projetado Ponderado ($\bar{C}_{proj}$)**:
   Aplica peso maior às seleções mais recentes para capturar a tendência do mercado escolar:
   $$\bar{C}_{proj} = 0.50 \cdot C_{2026} + 0.30 \cdot C_{2025} + 0.20 \cdot C_{2023}$$
3. **Volatilidade Local ($s$)**:
   Calcula o desvio padrão amostral $\sigma_C$ dos cortes:
   $$s = \max(\sigma_C, 0.15)$$

### 3.2. Função de Probabilidade Sigmoide Calibrada
Com a margem $\Delta = N - \bar{C}_{proj}$:
$$P(\text{Aprovação}) = \frac{100}{1 + e^{-k \cdot (\Delta / s)}}$$
*(com $k \approx 3.5$)*.
* Se $\Delta = 0 \implies P = 50\%$ (empate técnico no corte).
* Se $\Delta \ge +0.25 \implies P \ge 85\%$ (zona de segurança elevada).
* Se $\Delta \le -0.25 \implies P \le 15\%$ (zona crítica para vagas imediatas).

### 3.3. Classificação Semântica
* 🟢 **Alta Chance ($\ge 85\%$)**: Média acima do histórico recente projetado.
* 🟡 **Zona de Disputa ($50\% - 84\%$)**: Média na faixa de corte; boa chance em vagas imediatas ou 1ª chamada.
* 🟠 **Lista de Espera ($25\% - 49\%$)**: Depende de sobras, desistências e 2ª/3ª chamadas.
* 🔴 **Risco Elevado ($< 25\%$)**: Média abaixo do padrão competitivo daquela cota.

---

## 4. Arquitetura Técnica do PWA

* **Build & Bundle**: React 18+ com **TypeScript** e **Vite** (geração estática ultra-leve $< 150\text{ KB}$).
* **Estilização**: **Tailwind CSS** com suporte mobile-first e temas claro/escuro.
* **Offline First**: `vite-plugin-pwa` registrando Service Worker com cacheamento completo dos assets e do JSON de notas na primeira visita.
* **Persistência**: `localStorage` no navegador do celular (salva o boletim sem exigir login ou backend).
* **Hospedagem & CI/CD**: Deploy contínuo e gratuito via **GitHub Actions** no **GitHub Pages**.

---

## 5. Estrutura de Telas e Navegação

1. **Tela 1: Perfil de Concorrência**
   * Rede Escolar: Pública ou Particular.
   * Cota Territorial: Mora em bairro de proximidade? (Sim / Não).
   * PCD: Possui deficiência comprovada? (Sim / Não).
2. **Tela 2: Lançamento de Notas**
   * Chave Seletora: `Média Pronta` vs `Boletim Completo (36 Notas)`.
3. **Tela 3: Dashboard de Resultados (Ano Vigente)**
   * 4 Cards (Enfermagem, Informática, Guia de Turismo, Agroindústria).
   * Termômetro de Probabilidade (%) com badges coloridos.
   * Gráfico comparativo dos cortes (2023, 2025, 2026 e Projetado).
   * Destaque de recomendação de curso estratégico.
4. **Rodapé com Disclaimer Obrigatório**:
   * *"O EEEP Orienta é um simulador orientativo baseado em séries estatísticas anteriores e não substitui o edital oficial nem garante vaga homologada pela SEDUC."*