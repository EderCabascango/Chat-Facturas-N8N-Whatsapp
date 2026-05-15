import urllib.request
import json

url = "http://136.248.247.250:8080/webhook/set/pichincha"
data = {
    "webhook": {
        "url": "http://n8n:5678/webhook/whatsapp",
        "byEvents": False,
        "base64": True,
        "events": ["MESSAGES_UPSERT"]
    }
}
req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'))
req.add_header('apikey', 'evapi_secret_key_99')
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        print("WEBHOOK SET SUCCESSFULLY!")
        print(response.read().decode())
except Exception as e:
    print(f"Error: {e}")
