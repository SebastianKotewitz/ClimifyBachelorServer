import React, {Component} from 'react';
import {NavLink} from "react-router-dom";
import PropTypes from 'prop-types';
import FormDialog from "./formDialog";

const NavBarItemsLoggedIn = props => {

    const {onSubmitNewBuilding, buildings, onLogOut} = props;

    let items = [];
    for (let i = 0; i < buildings.length; i++) {
        let path = "/buildings/" + buildings[i]._id + "/";
        items.push(<NavLink key={i} to={path}
                            className="dropdown-item">{buildings[i].name}</NavLink>);
    }

    return (
      <React.Fragment>
          <li className="nav-item">
              <NavLink exact className="nav-link" to="/">Home <span className="sr-only"/></NavLink>
          </li>
          <li className="nav-item dropdown ">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                 data-toggle="dropdown"
                 aria-haspopup="true" aria-expanded="false">
                  Buildings
              </a>
              <div className="dropdown-menu pb-1 pl-1 pr-1" aria-labelledby="navbarDropdown">

                  {/*<div className="dropdown-divider"></div>*/}
                  {items}
                  <FormDialog
                    inputProp1={{
                        description: "Please enter building name that uniquely identifies your building",
                        fieldDescription: "Building name",
                        id: "buildingName"
                    }}
                    onSubmit={onSubmitNewBuilding}
                    title="New building"

                    dropDown={true}
                  />
              </div>
          </li>
          <li className="nav-item">
              <a href="#" className="nav-link" onClick={onLogOut}>Log out</a>
          </li>
      </React.Fragment>
    );
};


NavBarItemsLoggedIn.propTypes = {
    onLogOut: PropTypes.func.isRequired,
    buildings: PropTypes.array.isRequired,
    onSubmitNewBuilding: PropTypes.func.isRequired
};


export default NavBarItemsLoggedIn;
