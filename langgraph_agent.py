"""
LangGraph Agent Server for FreshFold
Stateful agent with multi-turn conversations, tool-use, and memory
"""

import json
import uuid
from datetime import datetime
from typing import Any, Optional, TypedDict, List, Annotated
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import threading

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode


# ═══════════════════════════════════════════════════════════════════════════
# STATE & MEMORY
# ═══════════════════════════════════════════════════════════════════════════

class AgentState(TypedDict):
    """LangGraph state for conversation and context"""
    messages: List[BaseMessage]
    context: dict
    tools_used: List[str]
    session_id: str
    timestamp: str


# In-memory conversation storage (in production: PostgreSQL + LangGraph checkpoints)
CONVERSATIONS = {}
ORDERS_DB = {}
STAFF_DB = {
    "ramesh": {"name": "Ramesh Kumar", "score": 92, "pickups": 48},
    "suresh": {"name": "Suresh Patel", "score": 82, "pickups": 41},
    "anil": {"name": "Anil Sharma", "score": 75, "pickups": 35},
    "priya": {"name": "Priya Menon", "score": 95, "pickups": 89},
}
INVENTORY_DB = {
    "detergent": {"name": "Liquid Detergent", "quantity": 50, "unit": "L", "days_left": 6},
    "fabric_softener": {"name": "Fabric Softener", "quantity": 30, "unit": "L", "days_left": 10},
    "oxygen_bleach": {"name": "Oxygen Bleach", "quantity": 25, "unit": "kg", "days_left": 8},
}


# ═══════════════════════════════════════════════════════════════════════════
# TOOL DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════════

@tool
def create_order(customer_name: str, service_type: str, quantity: int, pickup_date: str) -> dict:
    """Create a new laundry order"""
    order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    order = {
        "id": order_id,
        "customer": customer_name,
        "service": service_type,
        "quantity": quantity,
        "pickup": pickup_date,
        "status": "scheduled",
        "created": datetime.now().isoformat()
    }
    ORDERS_DB[order_id] = order
    return {"success": True, "order_id": order_id, "message": f"Order {order_id} created for {customer_name}"}


@tool
def update_staff_performance(staff_member: str, ai_score: int, note: str = "") -> dict:
    """Update staff member's AI score and performance notes"""
    staff_key = staff_member.lower()
    if staff_key in STAFF_DB:
        STAFF_DB[staff_key]["score"] = min(100, max(0, ai_score))
        if note:
            STAFF_DB[staff_key]["note"] = note
        return {"success": True, "message": f"Updated {STAFF_DB[staff_key]['name']}'s score to {ai_score}"}
    return {"success": False, "message": f"Staff member '{staff_member}' not found"}


@tool
def check_inventory(item_name: str) -> dict:
    """Check current inventory levels"""
    item_key = item_name.lower()
    if item_key in INVENTORY_DB:
        item = INVENTORY_DB[item_key]
        return {
            "item": item["name"],
            "quantity": item["quantity"],
            "unit": item["unit"],
            "days_left": item["days_left"],
            "status": "low" if item["days_left"] < 7 else "good"
        }
    return {"success": False, "message": f"Item '{item_name}' not found"}


@tool
def get_staff_analytics() -> dict:
    """Get analytics for all staff members"""
    stats = {
        "total_staff": len(STAFF_DB),
        "avg_score": sum(s["score"] for s in STAFF_DB.values()) / len(STAFF_DB),
        "staff_list": list(STAFF_DB.values())
    }
    return stats


@tool
def create_recommendation(title: str, description: str, priority: str = "medium") -> dict:
    """Create an AI recommendation"""
    rec_id = f"REC-{uuid.uuid4().hex[:8].upper()}"
    return {
        "recommendation_id": rec_id,
        "title": title,
        "description": description,
        "priority": priority,
        "timestamp": datetime.now().isoformat()
    }


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1 WORKFLOW TOOLS
# ═══════════════════════════════════════════════════════════════════════════

@tool
def create_order_workflow(customer_name: str, phone: str, service_type: str, weight_kg: float, pickup_date: str, delivery_date: str) -> dict:
    """Create a new order in the workflow system and call backend API"""
    import requests
    
    try:
        # Call backend API to create order
        backend_url = "http://localhost:3000/api/orders"
        
        customer_data = {
            "name": customer_name,
            "phone": phone,
            "address": "Customer Address",
            "city": "Bangalore"
        }
        
        items = [{
            "itemType": "Clothes",
            "quantity": 1,
            "weightKg": weight_kg,
            "price": weight_kg * 50  # Basic pricing
        }]
        
        dates = {
            "pickupDate": pickup_date,
            "deliveryDate": delivery_date
        }
        
        payload = {
            "customerData": customer_data,
            "items": items,
            "serviceType": service_type,
            "dates": dates,
            "specialInstructions": ""
        }
        
        response = requests.post(backend_url, json=payload, timeout=10)
        
        if response.status_code == 201:
            result = response.json()
            return {
                "success": True,
                "order_id": result["order"]["orderId"],
                "message": f"Order {result['order']['orderId']} created successfully for {customer_name}"
            }
        else:
            return {
                "success": False,
                "error": f"Backend error: {response.status_code}",
                "details": response.text
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "fallback": f"Order created locally for {customer_name} (sync pending)"
        }


@tool
def assign_pickup_staff(order_id: str, staff_name: str) -> dict:
    """Assign a pickup driver to an order"""
    import requests
    
    try:
        # Get staff by name (simplified)
        staff_mapping = {
            "ramesh": "ramesh_uuid",
            "suresh": "suresh_uuid",
            "anil": "anil_uuid"
        }
        
        staff_id = staff_mapping.get(staff_name.lower())
        if not staff_id:
            return {
                "success": False,
                "error": f"Staff member '{staff_name}' not found"
            }
        
        # Call backend API to assign staff
        backend_url = f"http://localhost:3000/api/orders/{order_id}/assign"
        
        payload = {
            "staffId": staff_id,
            "taskType": "pickup",
            "notes": f"Assigned to {staff_name}"
        }
        
        response = requests.post(backend_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            return {
                "success": True,
                "message": f"Pickup staff {staff_name} assigned to order {order_id}"
            }
        else:
            return {
                "success": False,
                "error": f"Backend error: {response.status_code}"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@tool
def update_order_status(order_id: str, new_status: str, notes: str = "") -> dict:
    """Update order status in the workflow"""
    import requests
    
    try:
        backend_url = f"http://localhost:3000/api/orders/{order_id}/status"
        
        payload = {
            "newStatus": new_status,
            "notes": notes
        }
        
        response = requests.put(backend_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "message": f"Order {order_id} status updated to {new_status}"
            }
        else:
            return {
                "success": False,
                "error": f"Backend error: {response.status_code}"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@tool
def get_available_staff(role: str = "driver") -> dict:
    """Get list of available staff for assignment"""
    import requests
    
    try:
        backend_url = f"http://localhost:3000/api/staff/role/{role}"
        
        response = requests.get(backend_url, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            staff_list = []
            for staff in result.get("staff", []):
                staff_list.append({
                    "id": staff["id"],
                    "name": staff["name"],
                    "performance_score": staff["performanceScore"],
                    "status": staff["status"]
                })
            
            return {
                "success": True,
                "staff": staff_list,
                "count": len(staff_list)
            }
        else:
            return {
                "success": False,
                "error": f"Backend error: {response.status_code}"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ═══════════════════════════════════════════════════════════════════════════
# LANGGRAPH AGENT
# ═══════════════════════════════════════════════════════════════════════════

TOOLS = [
    create_order, 
    update_staff_performance, 
    check_inventory, 
    get_staff_analytics, 
    create_recommendation,
    create_order_workflow,
    assign_pickup_staff,
    update_order_status,
    get_available_staff
]
OLLAMA_API = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "mistral"


def build_agent():
    """Build LangGraph agent with tools and Ollama"""
    
    def should_use_tools(state: AgentState) -> str:
        """Route: decide if tools are needed"""
        print(f"[ROUTE] Message count: {len(state['messages'])}, tools_used: {state['tools_used']}")
        
        # Check iteration count to prevent infinite loops
        if len(state['messages']) > 8:  # Max 8 messages to prevent infinite loops
            print(f"[ROUTE] Max iterations reached, going to END")
            return "end"
        
        last_message = state["messages"][-1]
        
        # Only process tools if there's a specific action request and it's from the user or first response
        # Skip if we've already called tools in this conversation
        if isinstance(last_message, AIMessage) and len(state['tools_used']) == 0:
            content = last_message.content.lower()
            # Very specific checks for actual tool needs
            if any(phrase in content for phrase in ["i will create order", "i'll create order", "creating order", "i will update staff", "i'll update staff"]):
                print(f"[ROUTE] Tools needed - found action phrase")
                return "tools"
        
        print(f"[ROUTE] No tools needed - going to END")
        return "end"
    
    
    def call_ollama(state: AgentState) -> AgentState:
        """Call Ollama LLM for reasoning"""
        messages_str = "\n".join([
            f"User: {m.content}" if isinstance(m, HumanMessage) else f"Assistant: {m.content}"
            for m in state["messages"][-5:]  # Last 5 messages for context
        ])
        
        system_prompt = """You are FreshFold AI Assistant - an intelligent laundry management system.
You have access to tools to:
- Create orders
- Update staff performance 
- Check inventory levels
- Get staff analytics
- Create recommendations

When user asks for actions, use the appropriate tools. 
Be helpful, specific, and actionable."""
        
        prompt = f"""{system_prompt}

Conversation history:
{messages_str}

        Based on the conversation, provide a response. If you need to take an action, call the appropriate tool.
Just respond naturally without JSON formatting."""
        
        # Call Ollama
        import requests
        try:
            print(f"[OLLAMA] Calling Ollama API with prompt length: {len(prompt)}")
            resp = requests.post(OLLAMA_API, json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "temperature": 0.6
            }, timeout=30)
            
            print(f"[OLLAMA] Response status: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                response_text = data.get("response", "I'm thinking...")
                
                # Try to parse JSON response if it contains JSON
                try:
                    if response_text.strip().startswith('{'):
                        parsed = json.loads(response_text)
                        response_text = parsed.get("response", response_text)
                except:
                    pass  # Not JSON, use as-is
                
                print(f"[OLLAMA] Got response: {response_text[:50]}")
                
                # Extract AI message
                ai_message = AIMessage(content=response_text)
                state["messages"].append(ai_message)
                state["timestamp"] = datetime.now().isoformat()
            else:
                print(f"[OLLAMA] Error response: {resp.text[:100]}")
                state["messages"].append(AIMessage(content="I'm having trouble processing your request."))
        except Exception as e:
            print(f"[OLLAMA] Exception: {str(e)}")
            state["messages"].append(AIMessage(content=f"Error: {str(e)}"))
        
        return state
    
    
    def process_tools(state: AgentState) -> AgentState:
        """Process tool calls from AI"""
        last_message = state["messages"][-1]
        
        # Simple tool detection from message content
        content = last_message.content.lower()
        
        if "create order" in content or "new order" in content:
            result = create_order("Customer", "Standard Wash", 5, "2026-05-21")
            state["messages"].append(ToolMessage(content=str(result), tool_use_id="create_order"))
            state["tools_used"].append("create_order")
        
        elif "check inventory" in content or "stock" in content:
            result = check_inventory("detergent")
            state["messages"].append(ToolMessage(content=str(result), tool_use_id="check_inventory"))
            state["tools_used"].append("check_inventory")
        
        elif "staff" in content and "score" in content:
            result = get_staff_analytics()
            state["messages"].append(ToolMessage(content=str(result), tool_use_id="get_staff_analytics"))
            state["tools_used"].append("get_staff_analytics")
        
        return state
    
    
    # Build the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("llm", call_ollama)
    workflow.add_node("tools", process_tools)
    
    # Add edges
    workflow.add_edge(START, "llm")
    workflow.add_conditional_edges("llm", should_use_tools, {
        "tools": "tools",
        "end": END
    })
    workflow.add_edge("tools", "llm")
    
    return workflow.compile()


# ═══════════════════════════════════════════════════════════════════════════
# API SERVER
# ═══════════════════════════════════════════════════════════════════════════

agent = build_agent()


class AgentRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST requests"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body)
            path = urlparse(self.path).path
            
            if path == '/api/conversation':
                response = self._handle_conversation(data)
            elif path == '/api/tools':
                response = self._handle_tools(data)
            else:
                response = {"error": "Unknown endpoint"}
            
            self._send_json_response(response)
        except Exception as e:
            self._send_json_response({"error": str(e)}, 500)
    
    
    def do_GET(self):
        """Handle GET requests"""
        path = urlparse(self.path).path
        
        if path == '/api/conversations':
            response = {"conversations": list(CONVERSATIONS.keys())}
            self._send_json_response(response)
        elif path == '/api/health':
            response = {"status": "ok", "agent": "ready"}
            self._send_json_response(response)
        else:
            self._send_json_response({"error": "Unknown endpoint"}, 404)
    
    
    def _handle_conversation(self, data: dict) -> dict:
        """Handle conversation messages"""
        session_id = data.get("session_id", str(uuid.uuid4()))
        user_message = data.get("message", "")
        
        print(f"[CONVERSATION] Session {session_id}, Message: {user_message[:50]}")
        
        # Initialize or get conversation
        if session_id not in CONVERSATIONS:
            CONVERSATIONS[session_id] = {
                "messages": [],
                "tools_used": [],
                "created": datetime.now().isoformat()
            }
        
        conv = CONVERSATIONS[session_id]
        
        # Build agent state
        state = AgentState(
            messages=[HumanMessage(content=m["content"]) if m["role"] == "user" 
                     else AIMessage(content=m["content"]) 
                     for m in conv["messages"]] + [HumanMessage(content=user_message)],
            context={"session_id": session_id, "page": data.get("page", "unknown")},
            tools_used=conv["tools_used"],
            session_id=session_id,
            timestamp=datetime.now().isoformat()
        )
        
        # Run agent
        try:
            print(f"[AGENT] Invoking agent...")
            result_state = agent.invoke(state)
            print(f"[AGENT] Agent completed")
            
            # Extract response
            last_ai_message = None
            for msg in reversed(result_state["messages"]):
                if isinstance(msg, AIMessage):
                    last_ai_message = msg.content
                    break
            
            response_text = last_ai_message or "I couldn't generate a response."
            
            # Store conversation
            conv["messages"] = [{"role": "user" if isinstance(m, HumanMessage) else "assistant", 
                                "content": m.content}
                               for m in result_state["messages"]]
            conv["tools_used"] = result_state["tools_used"]
            
            return {
                "session_id": session_id,
                "response": response_text,
                "tools_used": result_state["tools_used"],
                "timestamp": result_state["timestamp"],
                "message_count": len(result_state["messages"])
            }
        except Exception as e:
            return {"error": str(e), "session_id": session_id}
    
    
    def _handle_tools(self, data: dict) -> dict:
        """Handle direct tool calls"""
        tool_name = data.get("tool", "")
        params = data.get("params", {})
        
        tools_map = {
            "create_order": create_order,
            "update_staff": update_staff_performance,
            "check_inventory": check_inventory,
            "get_staff_analytics": get_staff_analytics,
            "create_recommendation": create_recommendation
        }
        
        if tool_name in tools_map:
            try:
                result = tools_map[tool_name](**params)
                return {"success": True, "result": result, "tool": tool_name}
            except Exception as e:
                return {"success": False, "error": str(e), "tool": tool_name}
        
        return {"error": f"Unknown tool: {tool_name}"}
    
    
    def _send_json_response(self, data: dict, status_code: int = 200):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    
    def log_message(self, format, *args):
        """Suppress logging"""
        pass


def start_agent_server(port: int = 3002):
    """Start the LangGraph agent server"""
    server = HTTPServer(('localhost', port), AgentRequestHandler)
    print(f"🤖 LangGraph Agent Server running on http://localhost:{port}")
    print(f"📚 Endpoints:")
    print(f"   POST /api/conversation - Send message to agent")
    print(f"   GET /api/conversations - List all sessions")
    print(f"   GET /api/health - Health check")
    print(f"   POST /api/tools - Direct tool calls")
    server.serve_forever()


if __name__ == "__main__":
    start_agent_server()
