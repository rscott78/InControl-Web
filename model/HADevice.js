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
    EnergyMonitor: 14
};

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
    status = status.replace("{timeAgo}", moment(device.lastLevelUpdate).fromNow());

    return status;
}

function getDeviceShortStatus(device) {

    var status = "";

    switch (device.deviceType) {
        case DeviceTypeEnum.DimmerSwitch:
            status = "" + device.level + "%";
            break;
        case DeviceTypeEnum.StandardSwitch:        
        case DeviceTypeEnum.PowerOutlet:
            status = "{onOff}";
            break;
        case DeviceTypeEnum.BinarySensor:
            status = "{openClosed}";
            break;
        case DeviceTypeEnum.MotionSensor:
            status = "{motionState}";
            break;
        case DeviceTypeEnum.IpCamera:
            status = "";
            break;
        case DeviceTypeEnum.Thermostat:
            status = "";
            break;
        case DeviceTypeEnum.EntryControl:
            status = "{locked}";
            break;
    }

    // Replace texts
    status = status.replace("{onOff}", device.level > 0 ? "on" : "off");
    status = status.replace("{locked}", device.level > 0 ? "locked" : "unlocked");
    status = status.replace("{openClosed}", device.level > 0 ? "open" : "closed");
    status = status.replace("{motionState}", device.level > 0 ? "motion" : "");
    status = status.replace("{timeAgo}", moment(device.lastLevelUpdate).fromNow());

    return status;
}

