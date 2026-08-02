# 🧭 Wayfinder AI — Agente Autônomo de Viagens e Inteligência Meteorológica

O **Wayfinder AI** é um agente inteligente de planejamento de viagens desenvolvido para demonstrar o uso prático do **Google Gemini** integrado a APIs do mundo real através do padrão **Function Calling (Tool Use)**.

O agente analisa o destino desejado pelo usuário, consulta dados meteorológicos atualizados em tempo real de forma autônoma e gera recomendações personalizadas de mala e itinerário baseadas nas condições do clima.

---

## ⚡ Principais Funcionalidades

- **🔍 Geolocalização Dinâmica (`obter_coordenadas`):** Identifica a latitude e longitude exatas de qualquer cidade do mundo.
- **🌤️ Previsão em Tempo Real (`obter_previsao_tempo`):** Extrai dados meteorológicos de temperatura, umidade, vento e condição geral via API.
- **🤖 Raciocínio Encadeado (Function Calling):** O agente decide de forma autônoma a ordem e o momento de invocar ferramentas externas antes de responder ao usuário.
- **🎒 Checklist Interativo de Mala:** Sugestões justificadas pelo clima local (ex: capa de chuva se a umidade/garoa for alta).
- **🗺️ Roteiro Adaptativo:** Atividades recomendadas e ajustadas (locais cobertos/climatizados para dias frios e chuvosos; atividades ao ar livre para dias ensolarados).

---

## 🛠️ Tecnologias Utilizadas

- **LLM / Engine de IA:** Google Gemini (Gemini 1.5 / 2.0 Flash)
- **APIs Externas:** [Open-Meteo API](https://open-meteo.com/) (Geocoding & Weather Forecast - 100% gratuita e sem necessidade de API Key)
- **Padrão de Agente:** Tool Use / Function Calling Server-Side
- **Linguagens/Stack:** Python / TypeScript (SDK `google-genai`)

---

## 📐 Arquitetura do Agente

```text
  [ Usuário ] ──> "Vou para Gramado, o que fazer?"
                       │
                       ▼
             [ Wayfinder AI (Gemini) ]
                       │
       ┌───────────────┴───────────────┐
       │ 1. Invoca Tool                │ 2. Invoca Tool
       ▼                               ▼
[ obter_coordenadas ]        [ obter_previsao_tempo ]
       │                               │
       ▼ (Open-Meteo API)              ▼ (Open-Meteo API)
 { lat, lon }                 { temp, clima, vento }
       └───────────────┬───────────────┘
                       │
                       ▼
       [ Consolidação da Resposta Final ]