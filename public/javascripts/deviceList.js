
var currentRoomId = "";

var deviceTemplate = "<div class='col-md-3 draggable' id='{deviceId}'><div class='panel panel-default'><div class='panel-body'><div class='row'><div class='col-md-3'><img id='img_{deviceId}' src='/images/{deviceImage}' style='width:50px'></div><div class='col-md-9 ellipsis' ><div style='' class='ellipsis' id='name_{deviceId}'>{deviceName}</div><span class='ellipsis' style='color:#999999;font-size:11px;' id='status_{deviceId}'>{deviceStatus}</span></div></div></div></div></div>";

var socket = io.connect('http://localhost:3000');

socket.on('connect', function (data) {
    socket.emit('message', { command: "getDevices" });
});

// Listen for changes to devices
socket.on('device', function (updatedDevice) {

    // We need to update the local device's level/name/etc with this new arriving data
    var device = getDevice(updatedDevice.deviceId);

    if (device) {

        // Update the level and last levelUpdate
        device.lastLevelUpdate = updatedDevice.lastLevelUpdate;
        device.level = updatedDevice.level;
        device.name = updatedDevice.name;
        device.roomId = updatedDevice.roomId;

        // Update the device info on the screen
        $("#name_" + device.deviceId).html(device.name);
        $("#status_" + device.deviceId).html(getDeviceStatus(device));
        $("#img_" + device.deviceId).attr("src", "/images/" + updatedDevice.deviceImage);
    }

    // console.log(device);
});

socket.on('message', function (data) {

    if (data.messageType == "devices") {
        // this is an array of devices
        devices = data.devices;
        updateDevices(currentRoomId);
    } else {
        console.log("message", data);
    }
});

socket.on('error', function (data) {
    //console.log(data);
    //alert(data);
});

$(function () {

    /// Watches for click events on the tabs and redraws devices for the room
    $('#roomTabs').bind('click', function (e) {
        var roomId = $(e.target).attr("roomId");
        currentRoomId = roomId;
        updateDevices(roomId);        
    });

    // Setup droppable room tabs
    $(".droppable").droppable({
        activeClass: "ui-state-default",
        hoverClass: "ui-state-hover",
        tolerance: 'pointer',
        drop: function (event, ui) {
            // $(this).addClass("ui-state-highlight");
            var deviceId = ui.draggable.attr('id');
            var droppedRoomId = $(this).attr('id');
            console.log("Dragged", deviceId);
            console.log("Dragged room", droppedRoomId);

            // Remove the device that was dragged
            ui.draggable.remove();

            // Notify the server that a room change should happen for the given device
            $.ajax({
                type: "POST",
                url: "/device/" + deviceId + "/setRoom/?d=" + new Date().getTime(),
                data: { roomId: droppedRoomId },
                success: function (data) {
                },
                error: function (one, two, three) {
                }
            });
        }
    });

});


// Stores all local devices
var devices = [];

///
/// Creates the initial list of devices for the given roomId
///
function updateDevices(roomId) {

    $("#deviceListRow").empty();

    for (var dIdx in devices) {
        var d = devices[dIdx];

        if (!roomId || roomId == "" || d.roomId == roomId) {

            var deviceHtml = deviceTemplate.replace("{deviceName}", d.name);
            deviceHtml = deviceHtml.replace("{deviceImage}", d.deviceImage);
            deviceHtml = deviceHtml.replace("{deviceStatus}", getDeviceStatus(d));
            deviceHtml = deviceHtml.replace(/{deviceId}/g, d.deviceId);

            $("#deviceListRow").append(deviceHtml);
        }
    }

    // Tell the devices they are draggable
    $(".draggable").draggable({
        revert: "invalid",
        opacity: 0.35,
        scroll: false
    });

    // Set height of the list
    var newHeight = $(window).height() - $("#deviceList").offset().top;
    console.log("Setting height", newHeight);

    //newHeight = 100;

    $("#all").css("height", newHeight + "px");
    //$("#deviceListRow").height(newHeight);
}

///
/// Updates the status of the devices without first clearing the list or scroll position
///
function liveUpdateStatus() {

    try {
        // Loop over all the devices and find those that match the currently selected room
        for (var dIdx in devices) {
            var d = devices[dIdx];

            if (!currentRoomId || currentRoomId == "" || d.roomId == currentRoomId) {                
                $("#status_" + d.deviceId).html(getDeviceStatus(d));
            }
        }
    } catch (Ex) {
        // Ignore errors
        console.log("Error!", Ex);
    }

    setTimeout("liveUpdateStatus();", 10000);
}

// This updates the status every 10 seconds
setTimeout("liveUpdateStatus();", 10000);

///
/// Gets a device from the local device list
///
function getDevice(deviceId) {
    for (var dIdx in devices) {
        if (devices[dIdx].deviceId == deviceId) {
            return devices[dIdx];
        }
    }
}
