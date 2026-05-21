#!/usr/bin/env python3
"""
Simple test server to verify basic HTTP functionality
"""

import json
from http.server import BaseHTTPRequestHandler, HTTPServer

PORT = 3001

class SimpleHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        print(f"[REQUEST] POST {self.path}")
        
        if self.path == "/ai/chat":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            print(f"[AI Chat] Received {length} bytes")
            
            try:
                data = json.loads(body)
                message = data.get("message", "")
                print(f"[AI Chat] Message: {message}")
                
                response = {
                    "success": True,
                    "message": f"Echo: {message}",
                    "error": None
                }
            except Exception as e:
                print(f"[ERROR] {e}")
                response = {"success": False, "message": str(e), "error": str(e)}
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            print(f"[AI Chat] Response sent")
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, fmt, *args):
        print(f"[SERVER] {fmt % args}")

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), SimpleHandler)
    print(f"Test server running on port {PORT}")
    print(f"Testing endpoints: POST /ai/chat")
    server.serve_forever()
