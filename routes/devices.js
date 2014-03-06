
exports.list = function (req, res) {

    // Retrieve devices from the InControl HA server
    var devices = CLIENT.devices();
    var rooms = CLIENT.rooms();

    res.render('deviceList', { title: 'Devices', devices: devices, rooms: rooms });
};