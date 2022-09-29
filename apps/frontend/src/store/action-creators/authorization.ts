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
        //axios.defaults.headers[AUTH_HEADER] = username  

        // oauth2 authentication
        axios.defaults.headers['Authorization'] = user.getSignInUserSession()?.getIdToken().getJwtToken()

        dispatch({type: AuthenticationActionTypes.LOGIN, username})
    }
}

// export const login = (username: string) => {
//     return async (dispatch: Dispatch<AuthenticationAction>) => {
//         Auth.signIn(username, 'password'+username).then((result) => {
//             console.log(`login: ${username}`)
//             axios.defaults.headers[AUTH_HEADER] = username;
//             dispatch({type: AuthenticationActionTypes.LOGIN, username})
//             console.log(result)
//        }).catch((err: Error) => {
//             console.error(err.message)
//             toast.error(err.message, {
//                 autoClose: 1000,
//             })})
//     }
    
//     // return async (dispatch: Dispatch<AuthenticationAction>) => {
//     //     console.log(`login: ${username}`)
//     //     axios.defaults.headers[AUTH_HEADER] = username;
        
//     //     localStorage.setItem('authentication', username);
//     //     dispatch({type: AuthenticationActionTypes.LOGIN, username})
//     // }
// }

export const logout = () => {
    return async (dispatch: Dispatch<AuthenticationAction>) => {
        Auth.signOut()
        console.log(`logout`)
        axios.defaults.headers[AUTH_HEADER] = undefined;
        dispatch({type: AuthenticationActionTypes.LOGOUT})
        console.log("auth unset")

    }
}