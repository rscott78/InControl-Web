var DeviceTypeEnum = {
    StandardSwitch: 1,
    DimmerSwitch: 2,
    PowerOutlet: 3,
    Thermostat: 4,
    Controller: 5,
    Unknown: 6,
    BinarySensor: 7,
    ZonePlayer: 8,
    MotionSensor: 9,
    MultiLevelSensor: 10,
    EntryControl: 11,
    LevelDisplayer: 12,
    NotLicensed: 13,
    IpCamera: 14,
    EnergyMonitor: 15
};

function HaDevice() {
    this.deviceType = DeviceTypeEnum.StandardSwitch;
}

HaDevice.prototype.someMethod = function(param1, param2) {
    // sample method call
};

module.exports = HaDevice;