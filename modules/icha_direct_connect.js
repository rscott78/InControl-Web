var WebSocket = require('ws');

function DirectConnectClient(serverHost, serverPort, messageReceivedCallback, connectedCallback) {
    
    this.messageReceivedCallback = messageReceivedCallback;
    this.connectedCallback = connectedCallback;

    var ws = new WebSocket('ws://' + serverHost + ':' + serverPort);
    
    ws.on('open', function () {
        // Request the device list
        console.log('Connected to server!');
        if (connectedCallback) {
            connectedCallback();
        }
    });

    ws.on('message', function (data, flags) {
        // flags.binary will be set if a binary data is received
        // flags.masked will be set if the data was masked
        // console.log(data);

        var message = JSON.parse(data);
        
        if (messageReceivedCallback) {
            messageReceivedCallback(message);
        }
    });

    ws.on('close', function () {
        console.log('Disconnected from server!');
    });

    ws.on('error', function () {
        console.log('Error connecting to server!');
    });

    this.send = function (json) {
        ws.send(JSON.stringify(json), function (error) {
            if (error) {
                console.log("Something went wrong: ", error);
            } else {
                console.log("Message sent", json);
            }
        });
    };
}

// This gives node access to the object
module.exports = DirectConnectClient;
