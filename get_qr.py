import urllib.request
import json
import base64

url = "http://136.248.247.250:8080/instance/connect/pichincha"
req = urllib.request.Request(url)
req.add_header('apikey', 'evapi_secret_key_99')

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        
        # Obtener el string base64, quitando el prefijo "data:image/png;base64,"
        base64_str = data['base64'].split(",")[1]
        
        # Decodificar y guardar como imagen
        with open("codigo_qr.png", "wb") as fh:
            fh.write(base64.b64decode(base64_str))
        
        print("¡ÉXITO! La imagen 'codigo_qr.png' se ha guardado en tu carpeta actual.")
except Exception as e:
    print(f"Error: {e}")
