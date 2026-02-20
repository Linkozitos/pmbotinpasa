import requests
import json

SUPABASE_URL = "https://ekldzgfsounufsskwqwr.supabase.co"
SUPABASE_KEY = "sb_publishable_FzdWWmb7ojxs9NTuramiAg_o0rFditg"
EMAIL = "lincoln.pavan@inpasa.com.br"
PASSWORD = "F1i2r3e4$@"

def run_smoke_test():
    # 1. Login para obter token
    auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    auth_headers = {"apikey": SUPABASE_KEY, "Content-Type": "application/json"}
    auth_payload = {"email": EMAIL, "password": PASSWORD}
    
    auth_res = requests.post(auth_url, headers=auth_headers, json=auth_payload)
    if auth_res.status_code != 200:
        print("❌ Falha na autenticação inicial")
        return
    
    token = auth_res.json()['access_token']
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    tables = [
        "projects", "risks", "issues", "resources", 
        "budget_lines", "knowledge_items", "calculation_memories"
    ]

    results = {}

    for table in tables:
        url = f"{SUPABASE_URL}/rest/v1/{table}?select=count"
        try:
            res = requests.get(url, headers=headers)
            if res.status_code == 200:
                results[table] = "PASS"
            else:
                results[table] = f"FAIL ({res.status_code})"
        except Exception as e:
            results[table] = f"ERROR ({str(e)})"

    print("\n--- CHECKLIST FUNCIONAL (API/RLS) ---")
    for table, status in results.items():
        print(f"{table:25}: {status}")

if __name__ == "__main__":
    run_smoke_test()
