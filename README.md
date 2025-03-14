# AI Chatbot

A real-time chatbot powered by API.ai (Dialogflow) with Node.js and Socket.IO.

## Features
- Real-time chat interface
- Natural language processing via API.ai
- Structured logging and error handling
- WebSocket communication

## Prerequisites
- Node.js 
- API.ai (Dialogflow) account and API key

## Setup
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file with your API.ai credentials:
```
APIAI_TOKEN=your_api_token
APIAI_SESSION_ID=your_session_id
```
## Logging
Logs are stored in:
- `error.log`: Error-level messages
- `combined.log`: All log levels
