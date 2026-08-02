import os
import requests
import google.generativeai as genai

# 1. Configuração da API Key do Gemini
# A chave deve ser configurada na variável de ambiente GEMINI_API_KEY
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))


# 2. Definição das Ferramentas (APIs da Open-Meteo)
def obter_coordenadas(cidade: str) -> dict:
    """Busca a latitude e longitude de uma cidade a partir de seu nome."""
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={cidade}&count=1&language=pt&format=json"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        if "results" in data and len(data["results"]) > 0:
            local = data["results"][0]
            return {
                "sucesso": True,
                "cidade": local.get("name"),
                "pais": local.get("country"),
                "latitude": local.get("latitude"),
                "longitude": local.get("longitude"),
            }
        return {"sucesso": False, "erro": "Cidade não encontrada."}
    except Exception as e:
        return {"sucesso": False, "erro": str(e)}


def obter_previsao_tempo(latitude: float, longitude: float) -> dict:
    """Obtém a previsão do tempo atual para uma coordenada geográfica."""
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        if "current_weather" in data:
            clima = data["current_weather"]
            return {
                "sucesso": True,
                "temperatura_celsius": clima.get("temperature"),
                "velocidade_vento_kmh": clima.get("windspeed"),
                "codigo_tempo": clima.get("weathercode"),
            }
        return {"sucesso": False, "erro": "Dados meteorológicos indisponíveis."}
    except Exception as e:
        return {"sucesso": False, "erro": str(e)}


# 3. Instruções do Sistema e Inicialização do Agente
system_instruction = """
Você é o "Wayfinder AI", um assistente especialista em planejamento de viagens e inteligência meteorológica.

Sua missão é ajudar usuários a planejarem seus itinerários e malas com base no clima em tempo real da cidade desejada.

Fluxo Obrigatório:
1. Quando o usuário mencionar uma cidade ou destino, NUNCA invente dados do tempo.
2. Você DEVE primeiro chamar a função `obter_coordenadas` passando o nome da cidade.
3. Após obter a latitude e a longitude, você DEVE imediatamente chamar a função `obter_previsao_tempo`.
4. Com os dados de temperatura, vento e condição retornados, construa uma resposta estruturada contendo:
   - 🌡️ Resumo do Clima: Temperatura atual, velocidade do vento e condição geral.
   - 🎒 Dicas de Mala: O que levar (sugestões adaptadas ao clima).
   - 🗺️ Roteiro Sugerido: 3 atividades recomendadas adaptadas ao clima atual.

Mantenha um tom amigável, organizado e altamente prático.
"""

# O SDK do Gemini lê a assinatura e docstrings das funções em Python para criar as Tools automaticamente
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=system_instruction,
    tools=[obter_coordenadas, obter_previsao_tempo],
)


# 4. Execução do Chat do Agente
def executar_agente(prompt_usuario: str):
    chat = model.start_chat(enable_automatic_function_calling=True)

    print(f"\n👤 Usuário: {prompt_usuario}")
    print("🤖 Wayfinder AI analisando...\n")

    response = chat.send_message(prompt_usuario)
    print("--- RESPOSTA DO AGENTE ---")
    print(response.text)


if __name__ == "__main__":
    # Teste de execução
    executar_agente("Vou passar alguns dias em Gramado. O que devo levar na mala e o que me sugere fazer?")