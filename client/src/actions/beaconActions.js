import dispatcher from "../dispatcher";
import * as beaconService from "../services/beaconService";

export function createBeacon(name, uuid, buildingId) {
    dispatcher.dispatch({
        type: "FETCH_BEACONS"
    });

    beaconService.createBeacon(name, uuid, buildingId).then(beacon => {
        dispatcher.dispatch({
            type: "CREATE_BEACON",
            beacon
        })
    }).catch(err => {
        dispatcher.dispatch({
            type: "ERROR_CREATE_BEACON",
            err
        })
    });
}

export function receiveBeacon(id) {
    dispatcher.dispatch({
        type: "FETCH_BEACON"
    });

    beaconService.getBeacon(id).then(beacon => {
        dispatcher.dispatch({
            type: "RECEIVE_BEACON",
            beacon
        })
    }).catch(err => {
        dispatcher.dispatch({
            type: "ERROR_RECEIVE_BEACON",
            err
        })
    });

}

export function receiveBeacons(beaconId) {
    dispatcher.dispatch({
        type: "FETCH_BEACONS"
    });

    beaconService.getBeacons(beaconId).then(beacons => {
        dispatcher.dispatch({
            type: "RECEIVE_BEACONS",
            beacons
        })
    }).catch(error => {
        dispatcher.dispatch({
            type: "ERROR_RECEIVE_BEACONS",
            error
        })
    });
}

export function deleteBeacon(id) {
    beaconService.deleteBeacon(id).then(() => {
        console.log("success");
        dispatcher.dispatch({
            type: "DELETE_BEACON",
            id
        });
    }).catch(error => {
        dispatcher.dispatch({
            type: "ERROR_DELETE_BEACON",
            error
        });
    });
}
