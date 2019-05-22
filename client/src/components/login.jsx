import React, {Component} from "react";
import Input from "./common/input";
import PropTypes from 'prop-types';
import http from "../services/httpService";


class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            user: {
                email: "",
                password: "",
            },
            error: undefined
        };
    }

    handleSubmit = event => {
        const {email, password} = this.state.user;
        event.preventDefault();

        if (!this.validateForm()) {
            return this.setState({error: "Please provide email and password"})
        }
        this.props.onLogin(email, password);
    };

    handleChange = ({currentTarget: input}) => {
        const user = {...this.state.user};
        user[input.name] = input.value;
        this.setState({user, error: ""});
    };

    validateForm() {
        const {email, password} = this.state.user;
        return email.length > 0 && password.length > 0;
    }

    render() {
        const {email, password, error} = this.state;
        return (
          <div className="opacity">
              <h1 className="mb-4">Login</h1>
              <form onSubmit={this.handleSubmit}>
                  <Input focus={true} name="email" label="Email"
                         onChange={this.handleChange} value={email}/>
                  <Input password={true} name="password" label="Password"
                         onChange={this.handleChange} value={password}/>
                  {error && <div className="alert alert-danger mt-3">{error}</div>}
                  <button type="submit" className="btn btn-primary " >Login</button>
              </form>
          </div>


        )
    }
}

Login.propTypes = {
    onLogin: PropTypes.func.isRequired
};

export default Login;
