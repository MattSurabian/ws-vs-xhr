// If the Battery Status API isn't supported, send users to the main page where they'll be shown
// a thanks for trying message
if( !navigator.getBattery) {
  window.location = '/';
}

var TEST_ID = Math.random().toString(36).substr(2, 15);

navigator.getBattery().then(function(battery) {

  setBatteryLevel(battery.level * 100);
  setBatteryChargeState(battery.charging);

  battery.addEventListener('chargingchange', function(){
    setBatteryChargeState(battery.charging);
  });

  battery.addEventListener('levelchange', function() {
    setBatteryLevel(battery.level * 100);
  });

  if (window.TEST_MODE === 'XHR') {
    XHRTest();
  } else {
    WebSocketTest();
  }

});

var setTestStatus = function(status) {
  document.querySelector('.test-status').innerHTML = status;
};

var setBatteryChargeState = function(chargeState) {
  var batteryEl = document.querySelector('.battery');
  var chargeWarningEl = document.querySelector('.charge-warning');
  if (chargeState) {
    chargeWarningEl.innerHTML = 'It seems like your device is charging, please unplug it.';
  } else {
    chargeWarningEl.innerHTML = '';
  }
  batteryEl.setAttribute('data-battery-charging', chargeState);
};

var setBatteryLevel = function (level) {
  var batteryEl = document.querySelector('.battery');
  batteryEl.setAttribute('data-battery-level', level.toFixed(2));
  batteryEl.innerHTML = 'Battery Level: ' + level.toFixed(2);
};

var getBatteryLevel = function () {
  var batteryEl = document.querySelector('.battery');
  if (batteryEl.getAttribute('data-battery-charging') === "true") {
    return 'CHARGING';
  } else {
    return batteryEl.getAttribute('data-battery-level');
  }
};

var getPulse = function () {
  var packet = {
    type: 'heartbeat',
    connection: TEST_MODE,
    id: TEST_ID,
    data: {
      status: 'IN_TEST',
      score: Math.random() * 500000,
      battery: getBatteryLevel(),
      userAgent: navigator.userAgent
    }
  };

  return packet;
};

var XHRTest = function() {
  var request = new XMLHttpRequest();
  request.open('POST', '/api/heartbeat', true);
  request.setRequestHeader('Content-Type', 'application/json');
  setTestStatus('Sending pulse via XHR Request...');
  request.send(JSON.stringify(getPulse()));
  request.onreadystatechange = function() {
    if (request.readyState !== XMLHttpRequest.DONE) {
      return;
    }
    if (request.status !== 200) {
      setTestStatus('<strong>The test has encountered a problem</strong>');
      return;
    }
    if (JSON.parse(request.responseText).type === 'heartbeat.ACK') {
      var time = new Date();
      time.setSeconds(time.getSeconds() + 30);
      setTestStatus('Next heartbeat at: ' + time.toTimeString());
      setTimeout(XHRTest, 30000);
    }
  };
};

var WebSocketTest = function() {
  var host = location.origin.replace(/^http/, 'ws');
  var ws = new WebSocket(host);

  var sendHeartBeatWs = function () {
    setTestStatus('Sending pulse via WebSocket...');
    ws.send(JSON.stringify(getPulse()));
  };

  ws.onopen = sendHeartBeatWs;

  ws.onmessage = function (event) {
    var response = JSON.parse(event.data);
    if (response.type === 'heartbeat.ACK') {
      var time = new Date();
      time.setSeconds(time.getSeconds() + 30);
      setTestStatus('Next heartbeat at: ' + time.toTimeString());
      setTimeout(sendHeartBeatWs, 30000);
    }
  };

  ws.onerror = function() {
    setTestStatus('<strong>The test has encountered a problem</strong>')
  };

};