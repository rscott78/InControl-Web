// Change these 3 values to match your setup
var server = "chumad.homeip.net";
var serverPort = 8711;
var serverPassword = "getindemo";

exports.getServer = function () {
    return server;
};

exports.getPort = function () {
    return serverPort;
};

exports.getPassword = function () {
    return serverPassword;
};