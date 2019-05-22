import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Input from "./common/input";

class NewBuilding extends Component {
    render() {
        return (
          <div>
              <h1>Create building</h1>
              <form onSubmit={this.handleSubmit}>
                  <Input focus={true} name="name" label="Name" onChange={this.handleChange} value={email}/>
                  <Input password={true} name="password" label="Password" onChange={this.handleChange} value={password}/>
                  {error && <div className="alert alert-danger mt-3">{error}</div>}
                  <button type="submit" className="btn btn-primary " >Login</button>
              </form>
          </div>
        );
    }
}

NewBuilding.propTypes = {};

export default NewBuilding;
