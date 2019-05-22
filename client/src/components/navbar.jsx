import React from "react";
import {Link} from "react-router-dom";
import NavBarItemsLoggedIn from "./navBarItemsLoggedIn";
import NavBarItemsLoggedOut from "./navBarItemsLoggedOut";
import PropTypes from 'prop-types';

const NavBar = (props) => {
    return (
    <nav className="navbar navbar-expand-lg navbar-light  hmm">
        <Link className="navbar-brand" to="#">Feedme</Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"/>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
            {props.loggedIn ? <NavBarItemsLoggedIn buildings={props.buildings}
                                                   onLogOut={props.onLogout}
                                                   onSubmitNewBuilding={props.onSubmitNewBuilding}
            /> : <NavBarItemsLoggedOut/> }
            </ul>
        </div>
    </nav>
  );
};

NavBar.propTypes = {
    loggedIn: PropTypes.bool,
    onLogout: PropTypes.func.isRequired,
    buildings: PropTypes.array.isRequired,
    onSubmitNewBuilding: PropTypes.func.isRequired,
};

export default NavBar;
