import os
import requests
import json

# Credenciais fornecidas pelo usuário
SUPABASE_URL = "https://ekldzgfsounufsskwqwr.supabase.co"
SUPABASE_KEY = "sb_publishable_FzdWWmb7ojxs9NTuramiAg_o0rFditg"
EMAIL = "lincoln.pavan@inpasa.com.br"
PASSWORD = "F1i2r3e4$@"

def test_login():
    print(f"Testando login para: {EMAIL}")
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "email": EMAIL,
        "password": PASSWORD
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            print("✅ Login bem-sucedido!")
            data = response.json()
            token = data.get('access_token')
            user_id = data.get('user', {}).get('id')
            print(f"User ID: {user_id}")
            return token
        else:
            print(f"❌ Falha no login: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return None

if __name__ == "__main__":
    test_login()
