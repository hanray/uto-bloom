// REQ: FR-SV-002 (WebSocket /live stream for recent updates)

const WebSocket = require('ws');

/**
 * WebSocket /live
 * Real-time stream of sensor updates
 */
function setupLiveStream(server) {
  const wss = new WebSocket.Server({ 
    server,
    path: '/live'
  });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to live stream');
    
    ws.on('message', (message) => {
      // TODO: Handle client messages (subscribe to specific devices)
      console.log('Received:', message);
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from live stream');
    });
    
    // TODO: Implement broadcast mechanism when new readings arrive
    // TODO: Filter broadcasts by device_id subscriptions
  });
  
  return wss;
}

module.exports = { setupLiveStream };
