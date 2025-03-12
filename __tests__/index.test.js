const request = require('supertest');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const express = require('express');

describe('Chatbot Server', () => {
  let io, serverSocket, clientSocket, app, server;

  beforeAll((done) => {
    app = express();
    server = createServer(app);
    io = new Server(server);
    server.listen(() => {
      const port = server.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    server.close();
  });

  test('should serve static files', async () => {
    const response = await request(server).get('/');
    expect(response.status).toBe(200);
  });

  test('should handle chat messages', (done) => {
    clientSocket.emit('chat message', 'Hello');
    serverSocket.on('chat message', (msg) => {
      expect(msg).toBe('Hello');
      done();
    });
  });

  test('should receive bot replies', (done) => {
    clientSocket.on('bot reply', (msg) => {
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
      done();
    });
    clientSocket.emit('chat message', 'Hi');
  });
});
