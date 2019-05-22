import {EventEmitter} from "events";
import dispatcher from "../dispatcher";

class UserStore extends EventEmitter {

    constructor() {
        super();
        this.loggedIn = false;
        this.error = "";
    }

    signUp() {
        this.loggedIn = true;
        this.emit("change")
    }
    logout() {
        this.loggedIn = false;
        this.emit("change")
    }

    login() {
        this.loggedIn = true;
        this.emit("change")
    }

    isLoggedIn() {
        return this.loggedIn;
    }

    handleActions(action) {
        switch (action.type) {
            case "USER_LOGIN":
                this.login();
                break;
            case "USER_LOGOUT":
                this.logout();
                break;
            case "USER_REGISTER":
                this.signUp();
                break;
            case "ERROR_USER_LOGIN":
                this.handleError(action.error)
                break;
        }
    }

    handleError(error) {
        this.error = error;
        this.emit("change");
    }
}

const store = new UserStore();
dispatcher.register(store.handleActions.bind(store));
export default store;
