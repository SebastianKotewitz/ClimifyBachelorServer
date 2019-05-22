import * as React from "react";
import http from "../services/httpService";
import PropTypes from 'prop-types';
import Input from "./common/input";


const GENERIC_ERROR = "Please provide email and matching passwords";

class SignUp extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user: {
                email: "",
                password: "",
                passwordRepeat: "",
            },
            error: ""
        };
    }

    render() {
        const {email, password, passwordRepeat, error} = this.state;
        return (
          <div className="opacity">
              <h1 className="mb-4">Sign up</h1>
              <form onSubmit={this.handleSubmit}>

                  <Input focus={true} label="Email" name="email" value={email} onChange={this.handleChange}/>
                  <Input password={true} label="Password" name="password" value={password} onChange={this.handleChange}/>
                  <Input password={true} label="Repeat Password" name="passwordRepeat" value={passwordRepeat} onChange={this.handleChange}/>
                  {error && <div className="alert alert-danger mt-3">{error}</div>}
                  <button className="btn btn-primary" type="submit" >Sign up</button>
              </form>
          </div>
        );
    }

    handleSubmit = event => {
        event.preventDefault();
        const user = {...this.state.user};

        if (!this.validateForm())
            return this.setState({error: GENERIC_ERROR});

        this.props.onSignUp(user.email, user.password);

/*        http.post('http://localhost:80/api/users', {
            email: user.email,
            password: user.password
        }).then(res => {
            sessionStorage.setItem("jwtToken", res.headers["x-auth-token"]);
            // Use replace to redirect user to site but do not load the entire site.
            // With replace you can't go back to this site.
            // Use .push to save history and allow users to go back to this site.
            this.props.history.replace("/");
        }).catch(err => {
            if (err.response) {
                this.setState({error: err.response.data});
            } else {
                this.setState({error: "Unexpected error from server. Please try again"})
            }
        });*/
    };

    // Use object destruction to get currentTarget from event object
    // and rename it
    handleChange =  ({currentTarget: input}) => {
        // Spread operator to clone state object
        const user = {...this.state.user};
        user[input.name] = input.value;
        this.setState({user})
    };

    validateForm() {

        const {email, password, passwordRepeat} = this.state.user;
        return email.length > 0
          && password.length > 0
          && password === passwordRepeat;
    }
}

SignUp.propTypes = {
    onSignUp: PropTypes.func.isRequired
};

export default SignUp;
