import dispatcher from "../dispatcher";
import * as userService from "../services/userService";

export function signUp(email, password) {


    userService.signUp(email, password).then(user => {
        dispatcher.dispatch({
            type: "USER_REGISTER",
            user
        })
    }).catch(error => {
        dispatcher.dispatch({
            type: "ERROR_USER_REGISTER",
            error
        })
    });

}

export function logout() {
    userService.logout();
    dispatcher.dispatch({
        type: "USER_LOGOUT"
    });

}

export function login(email, password) {

    userService.login(email, password).then(user => {
        dispatcher.dispatch({
            type: "USER_LOGIN",
            user
        });
    }).catch(error => {
        dispatcher.dispatch({
            type: "ERROR_USER_LOGIN",
            error
        })
    });
}

