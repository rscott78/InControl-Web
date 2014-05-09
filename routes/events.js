
exports.list = function (req, res) {

    // Send a request for new events from the server
    CLIENT.refreshEvents();

    // Retrieve scenes from the InControl HA server    
    res.render('eventList', { title: 'Events', events: CLIENT.events() });
};
