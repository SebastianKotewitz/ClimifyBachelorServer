import {EventEmitter} from "events";
import dispatcher from "../dispatcher";

class RoomStore extends EventEmitter {

    constructor() {
        super();
        this.rooms = [];
    }

    createRoom(room) {
        this.rooms.push(room);
        this.emit("change")
    }

    receiveRooms(rooms) {
        this.rooms = rooms;
        this.emit("change");
    }

    getRooms() {
        console.log('roomstore rooms: ', this.rooms);
        return this.rooms;
    }



    handleActions(action) {
        switch (action.type) {
            case "CREATE_ROOM":
                this.createRoom(action.room);
                break;
            case "RECEIVE_ROOMS":
                this.receiveRooms(action.rooms);
                break;
        }
    }
}

const store = new RoomStore();
dispatcher.register(store.handleActions.bind(store));
export default store;
