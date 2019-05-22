import {EventEmitter} from "events";
import dispatcher from "../dispatcher";

class BuildingsStore extends EventEmitter {

    constructor() {
        super();
        this.buildings = [];
        this.fetching = false;
    }

    createBuilding(building) {
        this.buildings.push(building);
        this.fetching = false;
        this.emit("change");
    }

    receiveBuildings(buildings) {
        console.log("called2");
        this.buildings = buildings;
        this.fetching = false;
        this.emit("change");
    }

    deleteBuilding(id) {
        const index = this.buildings.findIndex(building => id === building.id);
        this.buildings.splice(index);
        this.emit("change");
    }

    getBuildings() {
        return this.buildings;
    }

    isFetching() {
        return this.fetching;
    }

    handleActions(action) {
        switch (action.type) {
            case "FETCH_BUILDING":
                this.fetchBuilding();
                break;
            case "CREATE_BUILDING":
                this.createBuilding(action.building);
                break;
            case "RECEIVE_BUILDINGS":
                this.receiveBuildings(action.buildings);
                break;
            case "DELETE_BUILDING":
                this.deleteBuilding(action.id);
                break;
        }
    }

    fetchBuilding() {
        console.log("called");
        this.fetching = true;
        this.emit("change");
    }
}

const store = new BuildingsStore();

dispatcher.register(store.handleActions.bind(store));
export default store;
