import {EventEmitter} from "events";
import dispatcher from "../dispatcher";

class BuildingStore extends EventEmitter {

    constructor() {
        super();
        this.building = {};
        this.fetching = false;
    }

    receiveBuilding(building) {
        this.building = building;
        this.fetching = false;
        this.emit("change");
    }
    createRoom(room) {
        this.building.rooms.push(room);
        this.emit("change");
    }

    getBuilding() {
        return this.building;
    }

    isFetching = () => {
        return this.fetching;
    };

    fetchBuilding() {
        console.log("called");
        this.fetching = true;
        this.emit("change");
    }

    handleActions(action) {
        switch (action.type) {
            case "FETCH_BUILDING":
                this.fetchBuilding();
                break;
            case "DELETE_BUILDING":
                this.deleteBuilding(action.id);
                break;
            case "RECEIVE_BUILDING":
                this.receiveBuilding(action.building);
                break;
            case "CREATE_ROOM":
                this.createRoom(action.room);
                break;
        }
    }


}

const store = new BuildingStore();

dispatcher.register(store.handleActions.bind(store));
export default store;
