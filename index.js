var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var WebSocketServer = require('ws').Server;
var pg = require('pg');
var app = express();
var port = process.env.PORT || 5000;

// serve static assets
app.use(express.static(__dirname + "/public/"));
app.use(bodyParser.json());

// provide a heartbeat endpoint that can receive post requests
app.post('/api/heartbeat', function(req, res) {
  // Only persist packets that pass validation
  if(isPacketValid(req.body)) {
    persistTestData(req.body);
    res.send(JSON.stringify({
      type: 'heartbeat.ACK'
    }));
  }
});

var server = http.createServer(app);
server.listen(port);
console.log("http server listening on %d", port);

// allow web socket connections
var wss = new WebSocketServer({server: server});
wss.on('connection', function connection(ws) {
  ws.on('message', function(data, flags) {
    var packet = JSON.parse(data);
    // Only persist packets that pass validation
    if (isPacketValid(packet)) {
      persistTestData(packet);
      ws.send(JSON.stringify({
        type: 'heartbeat.ACK'
      }));
    }
  });
});

function isPacketValid(packet) {
  return packet.type === 'heartbeat';
}

function persistTestData(packet) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) throw err;
    client.query(
      'INSERT into testdata (test_id, battery, userAgent, connection) VALUES($1, $2, $3, $4)',
      [packet.id, packet.data.battery, packet.data.userAgent, packet.connection],
      function(err, result) {
        done();
      }
    );
  });
}