
exports.list = function (req, res) {
    // Retrieve scenes from the InControl HA server    
    res.render('eventList', { title: 'Events', events: CLIENT.events() });
};
