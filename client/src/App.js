import React, {Component} from 'react';
import {Route, Switch, Redirect} from "react-router-dom"
import Login from "./components/login";
import SignUp from "./components/signUp";
import Home from "./components/home";
import NotFound from "./components/notFound";
import Buildings from "./components/buildings";
import './App.css';
import NavBar from "./components/navbar";
import http from "./services/httpService";
import buildingsStore from "./stores/buildingsStore";
import userStore from "./stores/userStore";
// importing all functions from buildingActions and naming the object
// containing the functions "buildingActions"
import * as buildingActions from "./actions/buildingActions";
import Building from "./components/building";
import * as  userActions from "./actions/userActions";

class App extends Component {

    handleLogOut = () => {
        userActions.logout();
    };

    handleLogIn = (email, password) => {
        userActions.login(email, password);
    };

    handleSignUp = (email, password) => {
        userActions.signUp(email, password);
    };

    constructor(props) {
        super(props);
        const token = sessionStorage.getItem("jwtToken");
        http.defaults.headers.get["x-auth-token"] = token;

        this.state = {
            userId: "",
            loggedIn: token !== null,
            buildings: [],
            activeBuilding: {}
        };
    };

    componentWillMount() {
        buildingsStore.on("change", this.getBuildings);
        userStore.on("change", this.isLoggedIn);
    }

    componentWillUnmount() {
        buildingsStore.off("change", this.getBuildings);
        buildingsStore.off("change", this.isLoggedIn);
    }


    componentDidMount() {
        if (this.state.loggedIn) {
            buildingActions.receiveBuildings();
        }
    }

    getBuildings = () => {
        const buildings = buildingsStore.getBuildings();
        console.log("buildings", buildings);
        if (this.state.loggedIn) {
            this.setState({buildings});
        }
    };

    isLoggedIn = () => {
        const loggedIn = userStore.isLoggedIn();

        if (loggedIn !== this.state.location) {
            this.setState({loggedIn});

            if (loggedIn) {
                this.props.history.replace("/");
                buildingActions.receiveBuildings();
            } else {
                this.props.history.replace("/login");
            }
        }

    };


    handleSubmitNewBuilding = (values) => {
        buildingActions.createBuilding(values[0]);
    };

    handleDeleteBuilding = (id) => {
        buildingActions.deleteBuilding(id);
        this.props.history.replace("/");
    };

    render() {
        const {buildings, loggedIn, activeBuilding} = this.state;
        return (
          <div className="App mb-5">
              <NavBar buildings={buildings} loggedIn={loggedIn} onLogout={this.handleLogOut}
                      onSubmitNewBuilding={this.handleSubmitNewBuilding}/>
              <div className="container mainView">
                  <Switch>
                      <Route path="/buildings/:id"
                             render={(props) => <Building onDeleteBuilding={this.handleDeleteBuilding} {...props}
                                                          id={activeBuilding._id} rooms={activeBuilding.rooms}/>}/>
                      <Route path="/login" render={(props) => <Login {...props} onLogin={this.handleLogIn}/>}/>
                      <Route path="/sign-up" render={(props) => <SignUp {...props} onSignUp={this.handleSignUp} />} />
                      {/* To send props use following syntax*/}
                      <Route path="/not-found" render={(props) => <NotFound {...props} />}/>
                      <Route path="/" exact render={(props) => <Home {...props} loggedIn={this.state.loggedIn}/>}/>
                      <Redirect to="/not-found"/>
                  </Switch>

              </div>
          </div>
        );
    }
}

export default App;
