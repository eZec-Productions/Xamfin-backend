import requests

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("--- 1. Testing Health Check ---")
    r = requests.get(f"{BASE_URL}/health")
    print(f"Health: {r.status_code}, {r.json()}")
    assert r.status_code == 200

    print("\n--- 2. Testing Login (Normal Client) ---")
    login_payload = {
        "email": "darlene@meridiangroup.com",
        "password": "Password123!"
    }
    r = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
    print(f"Login status: {r.status_code}")
    data = r.json()
    token = data["access_token"]
    is_first_time = data["is_first_time_login"]
    print(f"Token acquired: {token[:20]}..., is_first_time_login: {is_first_time}")
    assert r.status_code == 200
    assert not is_first_time

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 3. Testing Login (First-Time Client) ---")
    login_payload_first = {
        "email": "marcus@brodyenterprises.io",
        "password": "TempPass123!"
    }
    r = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload_first)
    print(f"First-time client login: {r.status_code}, is_first_time_login: {r.json()['is_first_time_login']}")
    assert r.json()['is_first_time_login'] is True

    print("\n--- 4. Testing Dashboard Overview ---")
    r = requests.get(f"{BASE_URL}/api/dashboard/overview", headers=headers)
    print(f"Dashboard Overview status: {r.status_code}")
    dash_data = r.json()
    print(f"Has data: {dash_data['hasData']}")
    print(f"Revenue: {dash_data['metrics']['revenue']['value']}")
    print(f"Expenses: {dash_data['metrics']['expenses']['value']}")
    print(f"Net Profit: {dash_data['metrics']['netProfit']['value']}")
    print(f"Health Score: {dash_data['healthScore']}")
    assert r.status_code == 200

    print("\n--- 5. Testing Approved Reports Filtering ---")
    r = requests.get(f"{BASE_URL}/api/reports", headers=headers)
    reports = r.json()
    print(f"Approved reports count: {len(reports)}")
    for rep in reports:
        print(f"  Report: {rep['month']} {rep['year']} (Approved: {rep['is_approved']})")
        assert rep["is_approved"] is True
    # Verify unapproved draft (Sep 2026) is NOT exposed
    assert not any(rep["month"] == "September" for rep in reports)

    print("\n--- 6. Testing AI Chat Grounded in Ledger ---")
    chat_payload = {
        "message": "What is my net profit and what was our largest expense?"
    }
    r = requests.post(f"{BASE_URL}/api/chat/message", json=chat_payload, headers=headers)
    chat_res = r.json()
    print(f"Chat status: {r.status_code}")
    print(f"AI Response:\n{chat_res['ai_message']['text']}")
    print(f"Sources cited: {chat_res['ai_message']['sources']}")
    assert "Net Profit" in chat_res['ai_message']['text'] or "Gusto Payroll" in chat_res['ai_message']['text']

    print("\n--- 7. Testing Transactions Ledger & CSV Export ---")
    r = requests.get(f"{BASE_URL}/api/transactions", headers=headers)
    tx_data = r.json()
    print(f"Total transactions: {tx_data['total']}")

    r_csv = requests.get(f"{BASE_URL}/api/transactions/export-csv", headers=headers)
    print(f"CSV Export status: {r_csv.status_code}")
    print(f"CSV Content preview:\n{r_csv.text[:200]}")
    assert r_csv.status_code == 200
    assert "Date,Description,Category,Type,Amount" in r_csv.text

    print("\n--- 8. Testing Settings Profile Update ---")
    r = requests.get(f"{BASE_URL}/api/settings/profile", headers=headers)
    print(f"Current profile company: {r.json()['company_name']}")

    update_payload = {
        "company_name": "Meridian Digital Global Technologies",
        "industry": "Performance Media & AI",
        "fiscal_start_month": "January",
        "currency": "USD ($)"
    }
    r = requests.put(f"{BASE_URL}/api/settings/profile", json=update_payload, headers=headers)
    print(f"Updated profile company: {r.json()['company_name']}")
    assert r.json()['company_name'] == "Meridian Digital Global Technologies"

    print("\n==========================================")
    print(" ALL BACKEND API TESTS PASSED SUCCESSFULLY! ")
    print("==========================================")

if __name__ == "__main__":
    test_api()
