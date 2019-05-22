import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from "react-router-dom"
import FormDialog from "./formDialog";
import Modal from "./common/modal";


const Home = props => {
    if (!props.loggedIn)
        return <Redirect to="/login"/>;

    return (
      <div className="noOpacity">

          {/*<Modal body="feedback" okButtonText="Download feedback"/>*/}
      </div>
    );
};

Home.propTypes = {
    loggedIn: PropTypes.bool.isRequired
};

export default Home;
