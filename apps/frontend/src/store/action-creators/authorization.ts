import axios from "axios"
import { Dispatch } from "react"
import { AuthenticationAction, AuthenticationActionTypes } from "../../types/authentication"
import {Auth} from 'aws-amplify';
import { toast } from "react-toastify";
import { CognitoUser } from 'amazon-cognito-identity-js';

const AUTH_HEADER = process.env.REACT_APP_AUTH_HEADER!!


export const setUsernameName = (user: CognitoUser) => {

   // axios.defaults.headers['Authorization'] = user.getSignInUserSession()?.getIdToken().getJwtToken()
    
    return async (dispatch: Dispatch<AuthenticationAction>) => {
        const username = user.getUsername()
        axios.defaults.headers[AUTH_HEADER] = username  

        // oauth2 authentication
        axios.defaults.headers['Authorization'] = user.getSignInUserSession()?.getIdToken().getJwtToken()

        dispatch({type: AuthenticationActionTypes.LOGIN, username})
    }
}

export const logout = () => {
    return async (dispatch: Dispatch<AuthenticationAction>) => {
        Auth.signOut()
        console.log(`logout`)
        axios.defaults.headers[AUTH_HEADER] = undefined;
        dispatch({type: AuthenticationActionTypes.LOGOUT})
        console.log("auth unset")

    }
}