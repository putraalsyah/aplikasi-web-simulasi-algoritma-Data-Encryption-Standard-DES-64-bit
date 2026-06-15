"""
DES Simulator — Python Flask Server (Opsional)
Jika ingin menjalankan via server Python lokal atau deploy ke VPS.
Seluruh logika DES ada di JavaScript (sisi klien), server ini hanya menyajikan file statis.
"""

from flask import Flask, send_from_directory, send_file
import os

app = Flask(__name__, static_folder='static', static_url_path='/static')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def index():
    return send_file(os.path.join(BASE_DIR, 'index.html'))

@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory(BASE_DIR, filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    print(f"🔐 DES Simulator berjalan di http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
