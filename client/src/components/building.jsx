import React, {Component} from 'react';
import buildingStore from "../stores/buildingStore";
import beaconsStore from "../stores/beaconsStore";
import feedbackStore from "../stores/feedbackStore";
import * as roomActions from "../actions/roomActions";
import * as buildingActions from "../actions/buildingActions";
import * as beaconActions from "../actions/beaconActions";
import * as feedbackActions from "../actions/feedbackActions";
import {NavLink, Route, withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import FormDialog from "./formDialog";
import Room from "./room";
import Beacon from "./beacon";
import Modal from "./common/modal";

class Building extends Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "",
            rooms: [],
            activeRoom: undefined,
            beacons: [],
            feedback: [],
            feedbackCount: 0,
            loading: true
        }
    }

    componentWillMount() {
        buildingStore.on("change", this.receiveBuilding);
        beaconsStore.on("change", this.receiveBeacons);
        feedbackStore.on("change", this.receiveFeedback);
    }

    componentWillUnmount() {
        buildingStore.removeListener("change", this.receiveBuilding);
        beaconsStore.removeListener("change", this.receiveBeacons);
        feedbackStore.removeListener("change", this.receiveFeedback);
    }


    receiveBuilding = () => {
        const loading = buildingStore.isFetching();
        console.log("loading", loading);
        if (loading) {
            this.setState({loading: true})
        } else {
            const building = buildingStore.getBuilding();
            this.setState({
                name: building.name,
                rooms: building.rooms,
                feedbackCount: building.feedbackCount,
                loading: false
            });
        }

    };

    receiveBeacons = () => {
        const beacons = beaconsStore.getBeacons();
        this.setState({
            beacons: beacons
        })
    };
    receiveFeedback = () => {
        const feedback = feedbackStore.getFeedback();

        this.setState({
            feedback: feedback
        })
    };

    componentDidMount() {
        const buildingId = this.props.match.params.id;
        buildingActions.receiveBuilding(buildingId);
        beaconActions.receiveBeacons(buildingId);
        feedbackActions.receiveBuildingFeedback(buildingId);

        // roomActions.receiveRooms(this.props.match.params.id);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.match.params.id !== this.props.match.params.id) {
            buildingActions.receiveBuilding(this.props.match.params.id);
            // roomActions.receiveRooms(this.props.match.params.id);
        }
    }

    handleSubmitNewRoom = (values) => {
        roomActions.createRoom(values[0], this.props.match.params.id);
    };

    handleReceiveFeedback = () => {
        feedbackActions.receiveBuildingFeedback(this.props.match.params.id);
    };

    createRoomItems = () => {
        // const isActive = (path, match, location) => !!(match || path === location.pathname);
        const {rooms, activeRoom, feedback} = this.state;
        let items = [];
        console.log("rooms: ", rooms);
        console.log("feed", feedback);
        if (rooms) {
            for (let i = 0; i < rooms.length; i++) {
                const roomFeedback = feedback.filter(elem => elem.room === rooms[i]._id);

                console.log('roomFeedback: ', roomFeedback.length);
                const isActive = activeRoom && activeRoom._id === rooms[i]._id;
                const badgeColor = isActive ? "badge-light" : "badge-primary";
                const buttonColor = isActive ? "btn-light" : "btn-primary";
                let path = "/buildings/" + this.props.match.params.id + "/rooms/" + rooms[i]._id;
                console.log("path", path);
                items.push(<div>
                    <NavLink key={i} onClick={() => this.openRoom(rooms[i])} to={path}
                             className="list-group-item d-flex flex-row list-group-item-action justify-content-between">
                        {/*{rooms[i].name}*/}
                        <p className="mt-3">{rooms[i].name}</p>

                        <button type="button"
                                className={"m-3 h-10 p-0 border-0 btn " + buttonColor}
                                data-toggle="modal" data-target={"#room" + i}>
                            <span className={" badge " + badgeColor}>{roomFeedback.length}</span>

                        </button>

                        {/*<span className={"badge mt-1 mb-1 " + badgeColor}>{0}</span>*/}
                    </NavLink>
                    <Modal
                      id={"room" + i}
                      feedback={roomFeedback}
                      body=""
                      okButtonText="Download Feedback" title="Room feedback"/>
                </div>);
            }
        }
        return items;
    };

    render() {
        const {name, feedback, feedbackCount, loading} = this.state;

        return loading ? (<div className="d-flex justify-content-center opacity">
              <div className="spinner-border text-primary "/>
          </div>)
          : (
            <div className="d-flex flex-column opacity">
                <div className="d-flex flex-row">

                    <h2>{name}</h2>
                    <button onClick={() => this.props.onDeleteBuilding(this.props.match.params.id)}
                            className="bg-light btn ml-2 mr-2"><i
                      className="fa fa-trash-o" aria-hidden="true"/></button>
                    <button  type="button" className="btn bg-light"
                            data-toggle="modal" data-target="#exampleModal">
                        <span className="badge badge-primary">{feedbackCount}</span>
                    </button>
                    <Modal
                      id="exampleModal"
                      feedback={feedback}
                      body={feedback.toString()}
                      okButtonText="Download Feedback" title="Building feedback"/>
                </div>

                <div className="d-flex flex-row">
                    <div className="list-group w-50 pr-2">

                        <h4>Rooms</h4>
                        {this.createRoomItems()}
                        <FormDialog inputProp1={{
                            description: "Choose a unique name for your room",
                            fieldDescription: "Room name",
                            id: "room"
                        }} title="Create new room"
                                    onSubmit={this.handleSubmitNewRoom}
                        />

                        {/*<Room active={!!this.state.activeRoom} />*/}
                    </div>

                    <div className="list-group w-50 pl-2">

                        <h4>Beacons</h4>
                        {this.createBeaconItems()}
                        <FormDialog
                          title="Create new beacon"
                          inputProp1={{
                              description: "Choose a unique name for your beacon",
                              fieldDescription: "Beacon name",
                              id: "name"
                          }}
                          inputProp2={{
                              description: "Register the UUID of the beacon",
                              fieldDescription: "Beacon UUID",
                              id: "uuid"
                          }}
                          onSubmit={this.handleSubmitNewBeacon}
                        />

                        {/*<Room active={!!this.state.activeRoom} />*/}
                    </div>
                </div>

                <Route path="/buildings/:id/rooms/:roomId"
                       render={(props) => <Room {...props}  active={!!this.state.activeRoom}/>}/>


            </div>


          )

    };


    openRoom = (room) => {
        this.setState({
            activeRoom: room
        })
    };

    handleSubmitNewBeacon = (values) => {
        const name = values[0];
        const uuid = values[1];
        beaconActions.createBeacon(name, uuid, this.props.match.params.id);

    };

    createBeaconItems() {
        const {beacons} = this.state;
        let items = [];
        if (beacons) {
            for (let i = 0; i < beacons.length; i++) {
                items.push(
                  <Beacon name={beacons[i].name} uuid={beacons[i].uuid} key={i}
                          onDelete={() => this.handleDeleteBeacon(beacons[i]._id)}/>
                );
            }
        }
        return items;
    }

    handleDeleteBeacon = (id) => {
        beaconActions.deleteBeacon(id);
    };

    handleGetFeedback = () => {

    }
}

Building.propTypes = {
    onDeleteBuilding: PropTypes.func.isRequired
};

export default Building;
