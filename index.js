'use strict';

require('dotenv').config()
const APIAI_TOKEN = process.env.APIAI_TOKEN;
const APIAI_SESSION_ID = process.env.APIAI_SESSION_ID;

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views')); 
app.use(express.static(__dirname + '/public'));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

const io = require('socket.io')(server);
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

io.on('connection', function(socket){
  logger.info('New client connected', { socketId: socket.id });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

const apiai = require('apiai')(APIAI_TOKEN);

// Web UI
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

io.on('connection', function(socket) {
  socket.on('chat message', async (text) => {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid input received');
      }
      
      logger.info('Received message', { socketId: socket.id, message: text });

      const apiaiReq = apiai.textRequest(text, {
        sessionId: APIAI_SESSION_ID
      });

      apiaiReq.on('response', (response) => {
        const aiText = response.result.fulfillment.speech;
        logger.info('Bot reply', { socketId: socket.id, reply: aiText });
        socket.emit('bot reply', aiText);
      });

      apiaiReq.on('error', (error) => {
        logger.error('API.ai error', { socketId: socket.id, error: error.message });
        socket.emit('bot reply', 'I apologize, but I encountered an error. Please try again.');
      });

      apiaiReq.end();
    } catch (error) {
      logger.error('Unexpected error', { socketId: socket.id, error: error.message });
      socket.emit('bot reply', 'An unexpected error occurred. Please try again.');
    }
  });
});