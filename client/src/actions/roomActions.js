import dispatcher from "../dispatcher";
import * as roomService from "../services/roomService";

export function createRoom(name, buildingId) {
    dispatcher.dispatch({
        type: "FETCH_ROOMS"
    });

    roomService.createRoom(name, buildingId).then(room => {
        dispatcher.dispatch({
            type: "CREATE_ROOM",
            room
        })
    }).catch(error => {
        dispatcher.dispatch({
            type: "ERROR_CREATE_ROOM",
            error
        })
    });

}

export function receiveRooms(buildingId) {

    roomService.getRooms(buildingId).then(rooms => {
        dispatcher.dispatch({
            type: "RECEIVE_ROOMS",
            rooms
        })
    }).catch(error => {
        dispatcher.dispatch({
            type: "ERROR_RECEIVE_ROOM",
            error
        })
    });
}

export function deleteRoom(id) {
    dispatcher.dispatch({
        type: "DELETE_ROOM",
        id
    })


}
