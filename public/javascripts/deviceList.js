
var currentRoomId = "";

var deviceTemplate = "<div class='col-md-3 draggable' id='{deviceId}' data-toggle='modal' data-target='#deviceModal'>"
                        + "<div style='cursor: pointer; padding:4px;margin-bottom:7px;' class='panel panel-default'>"
                            //+ "<div class='panel-body'>"
                                + "<div class='row'>"
                                    + "<div class='col-md-2'>"
                                        + "<img id='img_{deviceId}' src='/images/{deviceImage}' style='width:45px'>"
                                    + "</div>"
                                    + "<div class='col-md-8 ellipsis' style=''>"
                                        + "<div class='ellipsis' id='name_{deviceId}' style='padding-top:4px;'>{deviceName}</div>"
                                        + "<span class='ellipsis' style='color:#999999;font-size:11px;' id='status_{deviceId}'>{deviceStatus}</span>"
                                    + "</div>"
                                    + "<div class='col-md-2 ellipsis' style='padding-left:0px;padding-top:2px;'>"
                                        + "<input class='knob' id='level_{deviceId}' value='{deviceLevel}'>"
                                        + "<span  id='ss_{deviceId}' style='position:absolute;top:16px;left:0px;text-align:center;width:42px;font-size:10px;'>{shortStatus}</span>"
                                    + "</div>"
                                + "</div>"
                            //+ "</div>"
                        + "</div>"
                    + "</div>";

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
        $("#level_" + device.deviceId).val(updatedDevice.level).trigger("change");
        $("#ss_" + device.deviceId).html(getDeviceShortStatus(device));
        // $("#level_" + device.deviceId).knob();

    }

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
            
            var deviceId = ui.draggable.attr('id');
            var droppedRoomId = $(this).attr('id');
            
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

    // Click to open dialog box
    $('#deviceModal').on('show.bs.modal', function (e) {
        var deviceId = $(e.relatedTarget).attr('id');
        
        var device = getDevice(deviceId);
        $('#mdTitle').html(device.name);
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
            deviceHtml = deviceHtml.replace("{deviceLevel}", d.level);
            deviceHtml = deviceHtml.replace("{deviceStatus}", getDeviceStatus(d));
            deviceHtml = deviceHtml.replace("{shortStatus}", getDeviceShortStatus(d));            
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
    
    // Set height of the list to fill the entire remaining portion of the page
    var newHeight = $(window).height() - $("#deviceList").offset().top;    
    $("#all").css("height", newHeight + "px");

    // Knobize the controls
    $(".knob").knob({
        displayInput: false,
        width: 42,
        height: 42,
        displayPrevious: true 
    });
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

    // Trigger another update in 60 seconds
    setTimeout("liveUpdateStatus();", 60000);
}

// This updates the status in 10 seconds
setTimeout("liveUpdateStatus();", 60000);

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
