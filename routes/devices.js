﻿
exports.list = function (req, res) {

    // Retrieve devices from the InControl HA server
    var devices = CLIENT.devices();
    var rooms = CLIENT.rooms();

    res.render('deviceList', { title: 'Devices', devices: devices, rooms: rooms });
};

exports.setRoom = function (req, res) {
    var toRoomId = req.body.roomId;
    var deviceId = req.params.deviceId;

    console.log(toRoomId);
    CLIENT.assignRoom(deviceId, toRoomId);
};