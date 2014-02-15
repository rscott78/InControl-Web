
exports.list = function (req, res) {

    // Retrieve scenes from the InControl HA server    
    res.render('sceneList', { title: 'Scenes', scenes: CLIENT.scenes() });
};

///
/// Activates a scene
///
exports.activate = function (req, res) {
    console.log("Activate scene", req.params.sceneId);
    CLIENT.activateScene(req.params.sceneId);
};