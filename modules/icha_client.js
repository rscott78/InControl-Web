var DirectConnect = require('./icha_direct_connect.js');

var DeviceTypeEnum = {
	StandardSwitch: 0,
	DimmerSwitch: 1,
	PowerOutlet: 2,
	Thermostat: 3,
	Controller: 4,
	Unknown: 5,
	BinarySensor: 6,
	ZonePlayer: 7,
	MotionSensor: 8,
	MultiLevelSensor: 9,
	EntryControl: 10,
	LevelDisplayer: 11,
	NotLicensed: 12,
	IpCamera: 13,
	EnergyMonitor: 14,
	Alarm: 15,
	Fan: 16
};

var password = "";
var devices = [];
var scenes = [];
var messages = [];
var events = [];
var rooms = [];

// For direct-connect client; if we ever wanted to, this is where a cloud connector could go as well
var connector; 

function startServer() {
	password = SERVERCONFIG.getPassword();
	connector = new DirectConnect(SERVERCONFIG.getServer(), SERVERCONFIG.getPort(), processMessage, connected);
}

/// 
/// Processes messages received from the connector
/// 
function processMessage(jsonMessage) {
	switch (jsonMessage.commandType) {
		case "device":
		case "devices":			
			parseDevices(jsonMessage.commandData);
			break;
		case "scenes":
			parseScenes(jsonMessage.commandData);
			break;
		case "sceneActivated":
			sendMessage("Scene " + jsonMessage.commandData.sceneName + " has been activated.");			
			break;
		case "rooms":
			parseRooms(jsonMessage.commandData);
			break;
		case "events":
			parseEvents(jsonMessage.commandData);
			break;
		default:
			console.log("Unprocessed command", jsonMessage.commandType);
			break;
	}
}

///
/// Parses the device list and updates any local device that has changed
/// 
function parseDevices(deviceJson) {
	var rDevices = deviceJson.devices;
	for (var i = 0; i < rDevices.length; i++) {

		// This retrieves the device from the raw list that just came from the server
		var rDevice = rDevices[i];

		// Retrieve the device from the local version
		var device = getDevice(rDevice.deviceId);
		if (!device) {
			
			// Add a function for retrieving the image
			// TODO: This should be better abstracted
			rDevice.deviceImage = getDeviceImage(rDevice);
			rDevice.status = getDeviceStatus(rDevice);

			// Device doesn't exist, so add this to the list
			devices.push(rDevice);

		} else {
			// Device exists, update some key properties that tend to change often
			device.name = rDevice.name;
			device.level = rDevice.level;
			device.lastLevelUpdate = rDevice.lastLevelUpdate;
			device.roomId = rDevice.roomId;
			device.sr = rDevice.sr;
			device.deviceType = rDevice.deviceType;

			// Update status & image
			device.deviceImage = getDeviceImage(device);
			device.status = getDeviceStatus(device);

			// Send out the changed device to the listening clients
			SOCKETIO.sockets.emit('device', {
			    deviceId: device.deviceId,
			    lastLevelUpdate: device.lastLevelUpdate,
				deviceImage: device.deviceImage,
				level: device.level,
				name: device.name,
                roomId: device.roomId
			});
			
		}
	}

}

///
/// Parses the room list
///
function parseRooms(roomJson) {
	rooms = roomJson.rooms;
}

///
/// Parses the scene list
/// 
function parseScenes(sceneJson) {	
	scenes = sceneJson.scenes;
}

///
/// Parses event list from the server
///
function parseEvents(eventJson) {
	events = eventJson.events;
}

///
/// Retrieves the device by the deviceId
///
function getDevice(deviceId) {
	for (var i = 0; i < devices.length; i++) {
		if (devices[i].deviceId == deviceId) {
			return devices[i];
		}
	}
}

///
/// This is called by the connector when the connection is established. It'll work as our bootstrap
///
function connected() {
	getDevices();
	getScenes();
	getEvents();
	getRooms();
}

///
/// Stores a message to display to the client
/// 
function sendMessage(message) {
	messages.push({ message: message });
}

///
/// Sends the command to request devices from the server
/// 
function getDevices() {
	sendCommand("getDevices", {});
}

///
/// Sends the command to request scenes from the server
/// 
function getScenes() {
	sendCommand("getScenes", {});
}

///
/// Sends the command to request events from the server
///
function getEvents() {
	sendCommand("getEvents", {});
}

function getRooms() {
	sendCommand("getRooms", {});
}

/// 
/// Prepares a command to send to the server
/// 
function sendCommand(commandType, commandData) {
	var json = {
		password: password,
		commandData: commandData,
		commandType: commandType
	};
	sendJson(json);
}

///
/// Function assigned to the device object; used to retrieve the current device image
/// TODO: Should probably be elsewhere to keep this module cleaner
///
function getDeviceImage(device) {
	var imageName = "icon_list_alarm_{0}.png";

	switch (device.deviceType) {
		case DeviceTypeEnum.StandardSwitch:
			imageName = "icon_list_switch_{0}.png";
			break;
		case DeviceTypeEnum.DimmerSwitch:
			imageName = "icon_list_dimmer_{0}.png";
			break;
		case DeviceTypeEnum.BinarySensor:
			imageName = "icon_list_contact_{0}.png";
			break;
		case DeviceTypeEnum.MotionSensor:
			imageName = "icon_list_motion_{0}.png";
			break;
		case DeviceTypeEnum.PowerOutlet:
			imageName = "icon_list_outlet_{0}.png";
			break;
		case DeviceTypeEnum.IpCamera:
			imageName = "icon_list_camera_on.png";
			break;
		case DeviceTypeEnum.Thermostat:
			imageName = "icon_list_thermostat_on.png";
			break;
	}

	return imageName.replace("{0}", device.level > 0 ? "on" : "off");	
}

///
/// DO NOT USE THIS! It's being moved client-side
///
function getDeviceStatus(device) {

	var status = "";

	switch (device.deviceType) {
		case DeviceTypeEnum.StandardSwitch:
		case DeviceTypeEnum.DimmerSwitch:
		case DeviceTypeEnum.PowerOutlet:
			status = "turned {onOff} {timeAgo}";
			break;		
		case DeviceTypeEnum.BinarySensor:
			status = "{openClosed} {timeAgo}";
			break;
		case DeviceTypeEnum.MotionSensor:
			status = "{motionState} {timeAgo}";
			break;
		case DeviceTypeEnum.IpCamera:
			status = "Doing the camera thing";
			break;
		case DeviceTypeEnum.Thermostat:
			status = "";
			break;
		case DeviceTypeEnum.EntryControl:
			status = "{locked} {timeAgo}";
			break;
	}

	// Replace texts
	status = status.replace("{onOff}", device.level > 0 ? "on" : "off");
	status = status.replace("{locked}", device.level > 0 ? "locked" : "unlocked");
	status = status.replace("{openClosed}", device.level > 0 ? "opened" : "closed");
	status = status.replace("{motionState}", device.level > 0 ? "" : "");
	status = status.replace("{timeAgo}", MOMENT(device.lastLevelUpdate).fromNow());

	return status;
}

/// 
/// Transmits the json command to the server
/// 
function sendJson(json) {
	connector.send(json);
}

///
/// Gets all local known devices
///
exports.devices = function () {
	return devices;
};

///
/// Gets all local scenes
///
exports.scenes = function () {	
	return scenes;
};

///
/// Gets all local events
///
exports.events = function () {
	return events;
}

exports.rooms = function() {
	return rooms;
}

/// 
/// For external methods to request the device list
/// 
exports.requestDevices = function (req, res) {
	getDevices();
};

///
/// Starts the server
///
exports.startServer = function () {
	startServer();
}

///
/// Sends an scene activation command to InControl
///
exports.activateScene = function (sceneId) {
	sendCommand("activateScene", { sceneId: sceneId });
}

exports.messages = function () {	
	var msgs = messages;

	// Clear the messages
	messages = [];

	// Return the temp variable
	return msgs;
}

exports.assignRoom = function (deviceId, roomId) {
    sendCommand("assignRoom", {
        deviceId: deviceId,
        roomId: roomId
    });
}