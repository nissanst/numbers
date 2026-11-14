"""Local test server for the numbers game (no caching, so Safari always loads the latest version).
Run:  python3 serve.py   then open http://localhost:8123/index.html
"""
import http.server, socketserver, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("0.0.0.0", 8123), Handler) as server:
    server.serve_forever()
