import express from "express";
import path from "path";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Helper to format WMO weather code to Portuguese description & emoji icon
function getWeatherCondition(code: number): { text: string; icon: string } {
  switch (code) {
    case 0:
      return { text: "Céu limpo e ensolarado", icon: "☀️" };
    case 1:
      return { text: "Predominantemente ensolarado", icon: "🌤️" };
    case 2:
      return { text: "Parcialmente nublado", icon: "⛅" };
    case 3:
      return { text: "Nublado", icon: "☁️" };
    case 45:
    case 48:
      return { text: "Nevoeiro e névoa úmida", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { text: "Garoa leve", icon: "🌦️" };
    case 56:
    case 57:
      return { text: "Garoa congelante", icon: "🌨️" };
    case 61:
      return { text: "Chuva leve", icon: "🌧️" };
    case 63:
      return { text: "Chuva moderada", icon: "🌧️" };
    case 65:
      return { text: "Chuva forte", icon: "🌧️" };
    case 66:
    case 67:
      return { text: "Chuva congelante", icon: "❄️" };
    case 71:
    case 73:
    case 75:
    case 77:
      return { text: "Queda de neve", icon: "❄️" };
    case 80:
    case 81:
    case 82:
      return { text: "Pancadas de chuva", icon: "🌦️" };
    case 85:
    case 86:
      return { text: "Pancadas de neve", icon: "🌨️" };
    case 95:
      return { text: "Tempestade com trovoadas", icon: "🌩️" };
    case 96:
    case 99:
      return { text: "Tempestade forte com granizo", icon: "⛈️" };
    default:
      return { text: "Tempo variável", icon: "🌤️" };
  }
}

// Function 1: obter_coordenadas
async function obter_coordenadas(cidade: string) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=5&language=pt&format=json`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Erro de geocodificação: ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      throw new Error(`Cidade '${cidade}' não encontrada.`);
    }

    const first = data.results[0];
    return {
      cidade: first.name,
      pais: first.country || "",
      estado: first.admin1 || "",
      latitude: Number(first.latitude),
      longitude: Number(first.longitude),
      outrasOpcoes: data.results.slice(1, 4).map((r: any) => ({
        cidade: r.name,
        pais: r.country,
        estado: r.admin1,
        lat: r.latitude,
        lon: r.longitude
      }))
    };
  } catch (error: any) {
    return { error: error.message || "Falha ao obter coordenadas" };
  }
}

// Function 2: obter_previsao_tempo
async function obter_previsao_tempo(latitude: number, longitude: number) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Erro ao obter previsão do tempo: ${res.statusText}`);
    }
    const data = await res.json();
    const current = data.current || {};
    const daily = data.daily || {};

    const cond = getWeatherCondition(current.weather_code ?? 0);

    const dailyForecast = (daily.time || []).map((timeStr: string, idx: number) => {
      const code = daily.weather_code?.[idx] ?? 0;
      const c = getWeatherCondition(code);
      return {
        date: timeStr,
        weatherCode: code,
        conditionText: c.text,
        icon: c.icon,
        tempMax: Math.round(daily.temperature_2m_max?.[idx] ?? 0),
        tempMin: Math.round(daily.temperature_2m_min?.[idx] ?? 0),
        precipitationSum: daily.precipitation_sum?.[idx] ?? 0,
        uvIndexMax: daily.uv_index_max?.[idx] ?? 0
      };
    });

    return {
      latitude,
      longitude,
      temperaturaAtual: Math.round(current.temperature_2m ?? 0),
      sensacaoTermica: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 0),
      velocidadeVento: Math.round(current.wind_speed_10m ?? 0),
      umidadeRelativa: Math.round(current.relative_humidity_2m ?? 0),
      coberturaNuvens: Math.round(current.cloud_cover ?? 0),
      codigoMeteorologico: current.weather_code ?? 0,
      condicaoTexto: cond.text,
      condicaoIcone: cond.icon,
      ehDia: Boolean(current.is_day),
      precipitacao: current.precipitation ?? 0,
      tempMaximaHoje: Math.round(daily.temperature_2m_max?.[0] ?? current.temperature_2m ?? 0),
      tempMinimaHoje: Math.round(daily.temperature_2m_min?.[0] ?? current.temperature_2m ?? 0),
      uvIndexHoje: daily.uv_index_max?.[0] ?? 0,
      previsao7Dias: dailyForecast
    };
  } catch (error: any) {
    return { error: error.message || "Falha ao obter previsão do tempo" };
  }
}

// Tool Declarations for Gemini
const obterCoordenadasDecl: FunctionDeclaration = {
  name: "obter_coordenadas",
  description: "Obtém as coordenadas geográficas (latitude e longitude), estado e país de uma cidade ou destino.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      cidade: {
        type: Type.STRING,
        description: "Nome da cidade ou destino (ex: 'Rio de Janeiro', 'Paris', 'Tóquio', 'Gramado')"
      }
    },
    required: ["cidade"]
  }
};

const obterPrevisaoTempoDecl: FunctionDeclaration = {
  name: "obter_previsao_tempo",
  description: "Obtém a previsão do tempo e dados meteorológicos em tempo real (temperatura, vento, sensação térmica, código meteorológico e previsão de 7 dias) para uma latitude e longitude.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      latitude: {
        type: Type.NUMBER,
        description: "Latitude geográfica da localização"
      },
      longitude: {
        type: Type.NUMBER,
        description: "Longitude geográfica da localização"
      }
    },
    required: ["latitude", "longitude"]
  }
};

// Lazy initialization of Gemini SDK
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("A chave GEMINI_API_KEY é necessária nas configurações de Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Direct API Route: Geocoding
app.get("/api/weather/coordinates", async (req, res) => {
  const city = (req.query.city as string) || "";
  if (!city) {
    return res.status(400).json({ error: "Parâmetro 'city' é obrigatório" });
  }
  const result = await obter_coordenadas(city);
  return res.json(result);
});

// Direct API Route: Forecast
app.get("/api/weather/forecast", async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: "Parâmetros 'lat' e 'lon' válidos são obrigatórios" });
  }
  const result = await obter_previsao_tempo(lat, lon);
  return res.json(result);
});

// Direct API Route: Generate Full Structured Trip Plan for UI
app.post("/api/plan-trip", async (req, res) => {
  try {
    const { city } = req.body;
    if (!city || typeof city !== "string") {
      return res.status(400).json({ error: "Por favor informe a cidade desejada." });
    }

    // 1. obter_coordenadas
    const coordResult = await obter_coordenadas(city);
    if ("error" in coordResult) {
      return res.status(404).json({ error: coordResult.error });
    }

    // 2. obter_previsao_tempo
    const weatherResult = await obter_previsao_tempo(coordResult.latitude, coordResult.longitude);
    if ("error" in weatherResult) {
      return res.status(500).json({ error: weatherResult.error });
    }

    // 3. Generate tailored trip plan JSON using Gemini
    const ai = getGeminiClient();
    const prompt = `Você é o Wayfinder AI, especialista em viagens e inteligência meteorológica.
Analise estes dados meteorológicos REAIS para ${coordResult.cidade}, ${coordResult.pais}:

- Temperatura Atual: ${weatherResult.temperaturaAtual}°C (Sensação térmica: ${weatherResult.sensacaoTermica}°C)
- Temperatura Máxima Hoje: ${weatherResult.tempMaximaHoje}°C / Mínima: ${weatherResult.tempMinimaHoje}°C
- Vento: ${weatherResult.velocidadeVento} km/h
- Condição Meteorológica: ${weatherResult.condicaoTexto} (${weatherResult.condicaoIcone})
- Precipitação: ${weatherResult.precipitacao} mm
- Umidade: ${weatherResult.umidadeRelativa}%
- Índice UV: ${weatherResult.uvIndexHoje}

Gere um objeto JSON estruturado contendo:
1. "summary": { "temperatureText": "...", "windText": "...", "conditionText": "...", "overallAdvice": "..." }
2. "packingTips": array de 6 a 10 itens essenciais para a mala. Cada item deve ter:
   - "id": string única
   - "text": nome do item (ex: "Guarda-chuva resistente", "Casaco impermeável", "Óculos de sol")
   - "category": um dos valores ["roupas", "calcados", "acessorios", "essenciais"]
   - "checked": false
   - "reason": motivo baseado no clima (ex: "Devido aos ventos de ${weatherResult.velocidadeVento} km/h e chuva")
3. "suggestedItinerary": array com exatamente 3 atividades recomendadas adaptadas ao clima atual de ${coordResult.cidade}. Se estiver chovendo/frio, priorize museus, cafés, centros culturais e gastronomia coberta. Se ensolarado/agradável, priorize parques, praias, passeios ao ar livre ou mirantes.
   Cada atividade deve ter:
   - "id": string única
   - "title": título da atividade (ex: "Visita ao Museu de Arte Moderno e Café Gourmet")
   - "timeOfDay": "Manhã" | "Tarde" | "Noite"
   - "location": local/bairro específico em ${coordResult.cidade}
   - "category": "indoor" | "outdoor" | "cultural" | "gastronomia" | "lazer"
   - "description": descrição detalhada do passeio
   - "weatherNote": explicação de por que esse passeio combina perfeitamente com a condição de ${weatherResult.condicaoTexto} e ${weatherResult.temperaturaAtual}°C.

Retorne APENAS o JSON válido sem marcações markdown de código e sem texto extra.`;

    const aiRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let generatedJson: any = {};
    try {
      generatedJson = JSON.parse(aiRes.text || "{}");
    } catch {
      // Fallback
    }

    const fullPlan = {
      city: coordResult.cidade,
      country: coordResult.pais,
      latitude: coordResult.latitude,
      longitude: coordResult.longitude,
      weather: {
        city: coordResult.cidade,
        country: coordResult.pais,
        latitude: coordResult.latitude,
        longitude: coordResult.longitude,
        temperature: weatherResult.temperaturaAtual,
        apparentTemperature: weatherResult.sensacaoTermica,
        windSpeed: weatherResult.velocidadeVento,
        humidity: weatherResult.umidadeRelativa,
        weatherCode: weatherResult.codigoMeteorologico,
        conditionText: weatherResult.condicaoTexto,
        conditionIcon: weatherResult.condicaoIcone,
        isDay: weatherResult.ehDia,
        tempMax: weatherResult.tempMaximaHoje,
        tempMin: weatherResult.tempMinimaHoje,
        uvIndex: weatherResult.uvIndexHoje,
        cloudCover: weatherResult.coberturaNuvens,
        precipitation: weatherResult.precipitacao,
        dailyForecast: weatherResult.previsao7Dias
      },
      summary: generatedJson.summary || {
        temperatureText: `${weatherResult.temperaturaAtual}°C (sensação de ${weatherResult.sensacaoTermica}°C)`,
        windText: `${weatherResult.velocidadeVento} km/h`,
        conditionText: weatherResult.condicaoTexto,
        overallAdvice: `Tempo em ${coordResult.cidade}: ${weatherResult.condicaoTexto} com ${weatherResult.temperaturaAtual}°C.`
      },
      packingTips: generatedJson.packingTips || [
        { id: "1", text: "Roupa adequada ao clima", category: "roupas", checked: false, reason: weatherResult.condicaoTexto },
        { id: "2", text: "Sapatos confortáveis", category: "calcados", checked: false, reason: "Para caminhadas na cidade" },
        { id: "3", text: "Protetor solar / óculos", category: "acessorios", checked: false, reason: `Índice UV: ${weatherResult.uvIndexHoje}` },
        { id: "4", text: "Documentos e carregador", category: "essenciais", checked: false, reason: "Essencial de viagem" }
      ],
      suggestedItinerary: generatedJson.suggestedItinerary || [
        {
          id: "act-1",
          title: "Exploração cultural da cidade",
          timeOfDay: "Manhã",
          location: coordResult.cidade,
          category: weatherResult.temperaturaAtual < 18 || weatherResult.precipitacao > 0 ? "indoor" : "outdoor",
          description: "Conheça os principais atrativos da cidade adaptados ao clima atual.",
          weatherNote: `Atividade ideal para ${weatherResult.condicaoTexto}.`
        }
      ],
      generatedAt: new Date().toISOString()
    };

    return res.json(fullPlan);

  } catch (err: any) {
    console.error("Erro no /api/plan-trip:", err);
    return res.status(500).json({ error: err.message || "Erro ao gerar planejamento de viagem." });
  }
});

// Interactive Chat Endpoint with Gemini Function Calling
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Formato de mensagens inválido." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Você é o "Wayfinder AI", um assistente especialista em planejamento de viagens e inteligência meteorológica.
Sua missão é ajudar usuários a planejarem seus itinerários e malas com base no clima em tempo real da cidade desejada.

FLUXO OBRIGATÓRIO RIGOROSO:
1. Quando o usuário mencionar uma cidade ou destino, NUNCA invente dados do tempo nem assuma valores fictícios.
2. Você DEVE obrigatoriamente chamar a função \`obter_coordenadas\` passando o nome da cidade.
3. Após receber o retorno com latitude e longitude, você DEVE imediatamente chamar a função \`obter_previsao_tempo\`.
4. Com os dados reais de temperatura, vento e código meteorológico retornados pelas funções, construa uma resposta estruturada contendo exatamente:
   - 🌡️ Resumo do Clima: Temperatura atual (°C), sensação térmica, velocidade do vento (km/h) e condição geral em português.
   - 🎒 Dicas de Mala: O que levar especificamente ajustado ao clima retornado (ex: casaco pesado se frio, guarda-chuva se chuva/garoa, protetor solar e chapéu se ensolarado, calçados fechados ou abertos).
   - 🗺️ Roteiro Sugerido: Exactamente 3 atividades recomendadas adaptadas ao clima real (ex: se chovendo ou frio, priorize museus, cafés, centros culturais e gastronomia coberta; se ensolarado/agradável, priorize parques, praias, passeios ao ar livre e mirantes).

Mantenha um tom amigável, organizado, prático e motivador em português do Brasil.`;

    // Convert chat history to contents format for Gemini
    // We can run a function calling step loop server-side
    const functionCallsLog: Array<{ functionName: string; args: any; result: any }> = [];

    // Construct conversation contents
    const contentsHistory: any[] = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Step 1: Initial call with tools
    let currentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contentsHistory,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [obterCoordenadasDecl, obterPrevisaoTempoDecl] }]
      }
    });

    // Function Execution Loop (Up to 4 iterations)
    let maxLoop = 4;
    while (maxLoop > 0 && currentResponse.functionCalls && currentResponse.functionCalls.length > 0) {
      maxLoop--;
      const fc = currentResponse.functionCalls[0];
      const fnName = fc.name;
      const fnArgs = fc.args as any;

      let fnResult: any = {};
      if (fnName === "obter_coordenadas") {
        fnResult = await obter_coordenadas(fnArgs.cidade || fnArgs.city);
      } else if (fnName === "obter_previsao_tempo") {
        fnResult = await obter_previsao_tempo(Number(fnArgs.latitude || fnArgs.lat), Number(fnArgs.longitude || fnArgs.lon));
      }

      functionCallsLog.push({
        functionName: fnName,
        args: fnArgs,
        result: fnResult
      });

      // Prepare conversation history with function call & function response
      const modelContent = currentResponse.candidates?.[0]?.content;

      const functionResponsePart = {
        functionResponse: {
          name: fnName,
          response: fnResult
        }
      };

      contentsHistory.push(modelContent);
      contentsHistory.push({
        role: "user",
        parts: [functionResponsePart]
      });

      currentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contentsHistory,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [obterCoordenadasDecl, obterPrevisaoTempoDecl] }]
        }
      });
    }

    const finalText = currentResponse.text || "Desculpe, não consegui obter os dados meteorológicos no momento.";

    return res.json({
      text: finalText,
      functionCalls: functionCallsLog
    });

  } catch (err: any) {
    console.error("Erro no /api/chat:", err);
    return res.status(500).json({ error: err.message || "Erro no processamento da IA." });
  }
});

export default app;
