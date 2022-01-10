import React from 'react'
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {CognitoUser, AuthenticationDetails} from 'amazon-cognito-identity-js'
import UserPool from '../UserPool';

class SignIn extends React.Component {
    constructor(props) {
        super();
        this.state={
            email:"",
            password:""
        }

        this.handleSubmit=this.handleSubmit.bind(this)
    }

    handleSubmit(event){
        event.preventDefault();
        console.log(this.state)

        const user = new CognitoUser({
            Username: this.state.email,
            Pool: UserPool
        })

        const authDetails = new AuthenticationDetails({
            Username: this.state.email,
            Password: this.state.password
        });

        user.authenticateUser(authDetails,{
            onSuccess: (data) => {
                console.log("Log In Success!", data)
            },
            onFailure: (err) => {
                console.error("Log In Error!", err)
                // TODO: add failure message to UI for user
            },
            newPasswordRequired: (data) => {
                console.log("New Password Required!", data)
            }
        })
    }

    render() {
        return (
            <>
                <div className="columns is-centered">
                    <div className="column is-4-widescreen is-5-desktop is-7-tablet">
                        <div className="card">
                            <div className="card-content">

                                <div className="field">
                                    <label className="label">Email</label>
                                    <div className="control has-icons-left">
                                        <input className="input" name="email" type="email" placeholder="Email Address"
                                               autoFocus=""
                                               onChange={(event)=>this.setState({email:event.target.value})}
                                        />
                                        <span className="icon is-small is-left">
                                            <i className="fas fa-envelope"></i>
                                            <FontAwesomeIcon icon={faEnvelope}></FontAwesomeIcon>
                                        </span>
                                    </div>
                                </div>

                                <div className="field" id="password">
                                    <label className="label">Password</label>
                                    <div className="control has-icons-left">
                                        <input className="input" name="password" type="password"
                                               placeholder="Password"
                                               onChange={(event)=>this.setState({password:event.target.value})}
                                               
                                        />
                                        <span className="icon is-small is-left">
                                            <FontAwesomeIcon icon={faLock}></FontAwesomeIcon>
                                        </span>
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="checkbox">
                                        <input type="checkbox" />
                                        <>  Remember me</>
                                    </label>
                                </div>

                                <button className="button is-block is-primary is-fullwidth" onClick={this.handleSubmit}>Login</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default SignIn;