import dispatcher from "../dispatcher";
import * as buildingService from "../services/buildingService";

export function createBuilding(name) {
    dispatcher.dispatch({
        type: "FETCH_BUILDINGS"
    });

    buildingService.createBuilding(name).then(building => {
        dispatcher.dispatch({
            type: "CREATE_BUILDING",
            building
        })
    }).catch(err => {
        dispatcher.dispatch({
            type: "ERROR_CREATE_BUILDING",
            err
        })
    });
}

export function receiveBuilding(id) {
    dispatcher.dispatch({
        type: "FETCH_BUILDING"
    });

    buildingService.getBuilding(id).then(building => {
        dispatcher.dispatch({
            type: "RECEIVE_BUILDING",
            building
        })
    }).catch(err => {
        dispatcher.dispatch({
            type: "ERROR_RECEIVE_BUILDING",
            err
        })
    });

}

export function receiveBuildings() {

    buildingService.getBuildings()
      .then(buildings => {
          dispatcher.dispatch({
              type: "RECEIVE_BUILDINGS",
              buildings
          })
      }).catch(error => {
        dispatcher.dispatch({
            type: "ERROR_RECEIVE_BUILDINGS",
            error
        })
    });
}

export function deleteBuilding(id) {
    buildingService.deleteBuilding(id).then(() => {
        dispatcher.dispatch({
            type: "DELETE_BUILDING",
            id
        });
    }).catch(error => {
        dispatcher.dispatch({
            type: "ERROR_DELETE_BUILDING",
            error
        });
    });
}
