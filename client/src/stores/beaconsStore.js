import {EventEmitter} from "events";
import dispatcher from "../dispatcher";

class BeaconsStore extends EventEmitter {

    constructor() {
        super();
        this.beacons = [];
    }

    createBeacon(beacon) {
        this.beacons.push(beacon);
        this.emit("change");
    }

    receiveBeacons(beacons) {
        this.beacons = beacons;
        this.emit("change");
    }

    deleteBeacon(id) {
        console.log("heej", this.beacons);
        for (let i = 0; i < this.beacons.length; i++) {
            console.log('beacon: ', this.beacons[i]._id);
        }

        const index = this.beacons.findIndex(beacon => id === beacon._id);
        if (index >= 0) {
            this.beacons.splice(index, 1);
            console.log("index after splice", index);
            for (let i = 0; i < this.beacons.length; i++) {
                console.log('beacon: ', this.beacons[i]._id);
            }
            this.emit("change");
        }
    }

    getBeacons() {
        return this.beacons;
    }

    handleActions(action) {
        switch (action.type) {
            case "CREATE_BEACON":
                this.createBeacon(action.beacon);
                break;
            case "RECEIVE_BEACONS":
                this.receiveBeacons(action.beacons);
                break;
            case "DELETE_BEACON":
                this.deleteBeacon(action.id);
                break;
        }
    }

}

const store = new BeaconsStore();

dispatcher.register(store.handleActions.bind(store));
export default store;
