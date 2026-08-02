import streamlit as st
from agent import executar_agente # Importa a lógica do seu agente

st.title("🧭 Wayfinder AI")
st.caption("Assistente de Viagens & Inteligência Meteorológica")

prompt = st.text_input("Para onde você quer viajar?")
if st.button("Planejar Viagem"):
    if prompt:
        with st.spinner("Analisando clima e buscando coordenadas..."):
            # Chama a função que já criamos
            resposta = executar_agente(prompt)
            st.markdown(resposta)