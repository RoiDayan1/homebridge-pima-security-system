import { PlatformAccessory, Service } from 'homebridge';
import { PimaSecuritySystemPlatform } from '../platform';
import { waitTimeout } from '../utils/waitTimeout';

export class SecuritySystemAccessory {
    private service: Service;

    private currentState = 3;
    private targetState = 3;

    constructor(
        private readonly platform: PimaSecuritySystemPlatform,
        private readonly accessory: PlatformAccessory,
    ) {
        // set accessory information
        this.accessory
            .getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
            .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

        this.service =
            this.accessory.getService(this.platform.Service.SecuritySystem) ||
            this.accessory.addService(this.platform.Service.SecuritySystem);

        this.service.setCharacteristic(
            this.platform.Characteristic.Name,
            accessory.context.device.displayName,
        );

        // create handlers for required characteristics
        this.service
            .getCharacteristic(this.platform.Characteristic.SecuritySystemCurrentState)
            .onGet(this.handleSecuritySystemCurrentStateGet.bind(this));

        this.service
            .getCharacteristic(this.platform.Characteristic.SecuritySystemTargetState)
            .onGet(this.handleSecuritySystemTargetStateGet.bind(this))
            .onSet(this.handleSecuritySystemTargetStateSet.bind(this));

        // let motionDetected = false;
        // setInterval(() => {
        //     motionDetected = !motionDetected;
        //
        //     if (motionDetected) {
        //         this.service
        //             .getCharacteristic(this.platform.Characteristic.SecuritySystemCurrentState)
        //             .setValue(this.platform.Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED);
        //         this.platform.log.debug('Triggered SET SecuritySystemCurrentState: ALARM_TRIGGERED');
        //     }
        // }, 30000);
    }

    handleSecuritySystemCurrentStateGet() {
        this.platform.log.debug('Triggered GET SecuritySystemCurrentState', this.currentState);
        return this.currentState;
    }

    handleSecuritySystemTargetStateGet() {
        this.platform.log.debug('Triggered GET SecuritySystemTargetState', this.targetState);
        return this.targetState;
    }

    handleSecuritySystemTargetStateSet(value) {
        this.platform.log.debug('Triggered SET SecuritySystemTargetState:', value);
        this.targetState = value;

        // call to api
        waitTimeout(3000).then(() => {
            this.setSecuritySystemState(value);
        });
    }

    setSecuritySystemState(value) {
        this.service
            .getCharacteristic(this.platform.Characteristic.SecuritySystemCurrentState)
            .setValue(value);
        this.targetState = value;
        this.currentState = value;
    }
}
