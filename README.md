<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🧭 Rumo à EEEP — Simulador de Vagas

Simulador de chances de aprovação e calculadora de média de histórico escolar para o processo seletivo das **Escolas Estaduais de Educação Profissional (EEEPs)** do Ceará.

Desenvolvido especialmente para estudantes do 9º ano do Ensino Fundamental, famílias e orientadores pedagógicos da CREDE 09 (Cascavel, Beberibe, Pindoretama e região).

---

## 🚀 Funcionalidades Principais

- **🎯 Oráculo Inteligente de Candidatura**: Compara as notas do aluno com as séries históricas reais de notas de corte (2023, 2025, 2026).
- **📍 Priorização da Cidade Natal**: Destaca automaticamente os cursos da cidade de residência do aluno sem fechar as portas para outras escolas da região.
- **📊 Cálculo Oficial de Média**: Suporte a cálculo rápido (média geral) ou detalhado (matriz completa de 36 notas do 6º ao 9º ano com pesos oficiais).
- **🏫 Motor Dinâmico Multiescolas**: Lê pastas e JSONs diretamente em `src/data/escolas/` sem necessidade de código estático.
- **📱 PWA 100% Offline**: Funciona sem internet após o primeiro acesso e pode ser instalado na tela inicial do celular ou tablet.

---

## 🛠️ Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (porta 3000)
npm run dev

# 3. Compilar para produção
npm run build
```

---

## 🏛️ Dados & Conformidade

- **Fontes**: Editais públicos e listas de classificação da SEDUC-CE (EEEP Edson Queiroz, EEEP Pedro de Queiroz Lima, EEEP Prof. José Carlos Rebouças).
- **Privacidade**: 100% em conformidade com a LGPD — nenhum dado pessoal do estudante é transmitido para servidores externos.
- **Autoria & Concepção Pedagógica**: Desenvolvido por **Prof. Me. Flávio Jussiê**.

