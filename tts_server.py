#!/usr/bin/env python3
"""
FreshFold Server
- TTS: Runs on port 3001 — accepts POST /speak with JSON {"text":"..."} 
  Returns WAV audio using Piper neural TTS (fully offline, no internet needed)
- AI Chat: POST /ai/chat with {"message": "...", "context": {...}}
  Uses Gemini API for FreshFold-specific guidance
"""

import io
import json
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from piper.voice import PiperVoice

MODEL_PATH  = "voices/en_US-amy-medium.onnx"
CONFIG_PATH = "voices/en_US-amy-medium.onnx.json"
PORT        = 3001
GEMINI_API_KEY = "AIzaSyAKtUsVAXv-OHCZqAGAIAM7Wy_GeyfSC88"
GEMINI_URL  = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"

print("Loading voice model... (first load may take 3-5 seconds)")
voice = PiperVoice.load(MODEL_PATH, config_path=CONFIG_PATH)
print(f"Voice ready. TTS server running on http://localhost:{PORT}")

# FreshFold system prompt for Gemini
FRESHFOLD_SYSTEM_PROMPT = """You are an expert AI assistant for FreshFold, a laundry management system. 
Your role is to guide users through specific workflows to manage their laundry business efficiently.

FreshFold Workflows:
1. **Create New Order** - Help users create customer orders with pickup/delivery details
2. **Assign Pickup** - Guide users to assign drivers and vehicles for pickups
3. **Mark as Delivered** - Help track order completion and delivery
4. **Generate Invoice** - Guide users through billing and payment processes
5. **Restock Inventory** - Help manage inventory levels and orders

When responding:
- Be concise and action-oriented
- Provide step-by-step guidance specific to FreshFold workflows
- Ask clarifying questions if needed
- Recommend the most relevant workflow based on user request
- Include emoji for visual engagement
- Keep tone professional but friendly

Context about current page/state will be provided. Use it to give relevant suggestions."""

def call_gemini_api(user_message, context_data=None):
    """Call Gemini API with FreshFold-specific context"""
    try:
        # For now, return contextual mock responses until Gemini integration is fully tested
        lower_msg = user_message.lower()
        
        # Check what the user is asking about
        if any(word in lower_msg for word in ['create', 'order', 'new']):
            return {
                'success': True,
                'message': '✨ I can help you create a new order! This workflow takes about 75 seconds and involves:\n\n1️⃣ Opening the order form\n2️⃣ Entering customer details\n3️⃣ Adding phone number\n4️⃣ Selecting service type\n5️⃣ Entering quantity\n6️⃣ Choosing pickup/delivery date\n7️⃣ Reviewing details\n8️⃣ Saving the order\n\nWould you like me to guide you through it step by step?',
                'error': None
            }
        elif any(word in lower_msg for word in ['pickup', 'assign', 'driver']):
            return {
                'success': True,
                'message': '🚗 I can help you assign a pickup! This workflow involves:\n\n1️⃣ Selecting an order\n2️⃣ Opening the assignment modal\n3️⃣ Choosing a driver\n4️⃣ Selecting a vehicle\n5️⃣ Setting pickup time\n6️⃣ Confirming assignment\n\nThis typically takes about 60 seconds. Ready to get started?',
                'error': None
            }
        elif any(word in lower_msg for word in ['delivered', 'mark', 'complete', 'finish']):
            return {
                'success': True,
                'message': '✅ Let me guide you through marking an order as delivered:\n\n1️⃣ Find the order\n2️⃣ Mark it as ready for delivery\n3️⃣ Upload delivery photo (optional)\n4️⃣ Add delivery notes (optional)\n5️⃣ Confirm completion\n\nAbout 55 seconds total. Want me to walk you through it?',
                'error': None
            }
        elif any(word in lower_msg for word in ['invoice', 'bill', 'payment']):
            return {
                'success': True,
                'message': '💰 I can help you generate an invoice! The process includes:\n\n1️⃣ Selecting the order\n2️⃣ Opening invoice generator\n3️⃣ Reviewing billing details\n4️⃣ Adding notes (optional)\n5️⃣ Sending the invoice\n\nApproximately 60 seconds. Let me guide you?',
                'error': None
            }
        elif any(word in lower_msg for word in ['restock', 'inventory', 'stock', 'supplies']):
            return {
                'success': True,
                'message': '📦 I can help you restock inventory! Follow these steps:\n\n1️⃣ Navigate to inventory\n2️⃣ Select an item to restock\n3️⃣ Open the restock form\n4️⃣ Enter quantity\n5️⃣ Enter cost\n6️⃣ Select supplier\n7️⃣ Complete the restock\n\nTakes about 55 seconds. Ready to begin?',
                'error': None
            }
        else:
            # Default helpful response
            return {
                'success': True,
                'message': '👋 Hi! I\'m your FreshFold AI assistant. I can help you with:\n\n📝 **Create New Order** - Manage customer orders\n🚗 **Assign Pickup** - Dispatch drivers\n✅ **Mark Delivered** - Track completions\n💰 **Generate Invoice** - Handle billing\n📦 **Restock Inventory** - Manage supplies\n\nWhat would you like help with?',
                'error': None
            }
        
    except Exception as e:
        print(f"[AI Error] {str(e)}")
        return {
            'success': False,
            'message': 'I encountered an error. Please try again.',
            'error': str(e)
        }

class TTSHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        print(f"[REQUEST] POST {self.path}")
        # Route to appropriate handler
        if self.path == "/speak":
            self.handle_tts_request()
        elif self.path == "/ai/chat":
            self.handle_ai_chat()
        else:
            print(f"[ERROR] Unknown path: {self.path}")
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def handle_tts_request(self):
        """Handle TTS synthesis"""
        if self.path != "/speak":
            self.send_response(404); self.end_headers(); return

        length = int(self.headers.get("Content-Length", 0))
        body   = self.rfile.read(length)
        try:
            text = json.loads(body).get("text", "").strip()
        except Exception:
            text = body.decode("utf-8", errors="ignore").strip()

        if not text:
            self.send_response(400); self.end_headers(); return

        # Generate WAV using piper — synthesize_wav sets headers automatically
        import wave as wave_mod
        buf = io.BytesIO()
        wf  = wave_mod.open(buf, 'wb')
        voice.synthesize_wav(text, wf)
        wf.close()
        wav_bytes = buf.getvalue()

        self.send_response(200)
        self.send_header("Content-Type", "audio/wav")
        self.send_header("Content-Length", str(len(wav_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(wav_bytes)

    def handle_ai_chat(self):
        """Handle AI chat requests with Gemini"""
        print("[AI Chat] Handling request...")
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        
        print(f"[AI Chat] Body length: {length}, Content: {body[:100]}")
        
        try:
            data = json.loads(body)
            user_message = data.get("message", "").strip()
            context_data = data.get("context", {})
            print(f"[AI Chat] User message: {user_message}")
        except Exception as e:
            print(f"[AI Chat] Parse error: {e}")
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid request"}).encode())
            return

        if not user_message:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Empty message"}).encode())
            return

        # Call AI function
        result = call_gemini_api(user_message, context_data)
        print(f"[AI Chat] Result: {result['success']}")
        
        response_code = 200
        self.send_response(response_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        
        response = {
            "success": result['success'],
            "message": result['message'],
            "error": result.get('error')
        }
        response_json = json.dumps(response)
        print(f"[AI Chat] Sending response: {len(response_json)} bytes")
        self.wfile.write(response_json.encode())

    def do_GET(self):
        """Handle GET requests with a status message"""
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        response = json.dumps({
            "status": "TTS Server Running",
            "message": "POST to /speak with {\"text\": \"your text here\"} to generate speech",
            "example": "curl -X POST http://localhost:3001/speak -H 'Content-Type: application/json' -d '{\"text\": \"Hello world\"}' -o output.wav"
        })
        self.wfile.write(response.encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, fmt, *args):
        print(f"[TTS] {self.address_string()} — {fmt % args}")

if __name__ == "__main__":
    server = HTTPServer(("localhost", PORT), TTSHandler)
    server.serve_forever()
