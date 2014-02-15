
exports.list = function (req, res) {

    // Retrieve devices from the InControl HA server    
    res.json({ status: 'ok', messages: CLIENT.messages() });
};