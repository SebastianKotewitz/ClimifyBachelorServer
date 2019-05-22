import React, {Component} from 'react';
import buildingStore from "../stores/buildingsStore";
// importing all functions from buildingActions and naming the object
// containing the functions "buildingActions"
import * as buildingActions from "../actions/buildingActions";
import PropTypes from 'prop-types';


class Buildings extends Component {

    constructor(props) {
        super(props);
        this.state = {
            name: props.name
        }
    }

    // Only fires once when the component is about to render
    // Good place to register event listeners.
    componentWillMount() {
        buildingStore.on("change", () => {
            this.setState({
                buildings: buildingStore.getBuildings()
            });
        });
    }

    render() {
        const name = "this.props";
        return (
          <div>
              <h1>{name}</h1>
          </div>
        );
    }
}

export default Buildings;
