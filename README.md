# AI Laundry Management System

A comprehensive laundry management system with AI integration, real-time order tracking, and intelligent workflow automation.

## Features

- **Order Management**: Create, track, and manage laundry orders
- **Staff Assignment**: Assign and manage staff for different tasks
- **AI Chat Integration**: Intelligent chatbot for customer support
- **Real-time Updates**: Live order status tracking
- **Text-to-Speech**: TTS support for accessibility
- **Database**: PostgreSQL backend for data persistence

## Quick Start

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Set up database:
   ```bash
   npm run setup-postgres
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open in browser:
   ```
   http://localhost:3000
   ```

## Project Structure

- `/backend` - Node.js/Express API server
- `/lib` - Shared utilities and managers
- `/database` - Database schema and migrations
- `/ai-system` - AI/ML integration modules
- `/assets` - Static assets (fonts, icons)

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **AI**: Gemini AI, LangGraph
- **TTS**: Piper TTS

## License

Proprietary - All Rights Reserved
