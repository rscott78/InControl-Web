
exports.list = function (req, res) {

    // Retrieve devices from the InControl HA server
    var devices = CLIENT.devices();

    res.render('deviceList', { title: 'Devices', devices: devices });
};