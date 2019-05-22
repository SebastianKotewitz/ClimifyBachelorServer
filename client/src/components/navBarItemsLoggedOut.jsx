import React from 'react';
import {NavLink} from "react-router-dom";

const NavBarItemsLoggedOut = () => {
    return (

      <React.Fragment>
          <li className="nav-item">
              <NavLink className="nav-link" to="/sign-up">Sign up</NavLink>
          </li>
          <li className="nav-item">
              <NavLink className="nav-link" to="/login">Login</NavLink>
          </li>
      </React.Fragment>
    );
};

export default NavBarItemsLoggedOut;
