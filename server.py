import http.server
import socketserver
import mimetypes

PORT = 8446

# Force correct MIME types (Windows registry often maps .css to text/plain, breaking mobile browsers)
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/javascript', '.js')

Handler = http.server.SimpleHTTPRequestHandler

# Using ThreadingHTTPServer instead of TCPServer prevents the server from freezing!
# The standard server is single-threaded and hangs if a device keeps the connection alive.
class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

with ThreadedHTTPServer(("", PORT), Handler) as httpd:
    print(f"Serving robustly at port {PORT}")
    print("Multi-threading enabled (fixes freezing/timeouts)")
    print("MIME types enforced (CSS will load correctly on mobile)")
    httpd.serve_forever()
