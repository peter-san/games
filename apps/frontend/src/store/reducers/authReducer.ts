import { AuthenticationAction, AuthenticationActionTypes, AuthenticationState } from "../../types/authentication";
import { CognitoUser } from 'amazon-cognito-identity-js';


const initialState: AuthenticationState = {
    username: undefined,
    loading: false
}

export const authReducer = (state = initialState, action: AuthenticationAction): AuthenticationState => {
    switch (action.type) {
        case AuthenticationActionTypes.LOGIN:
            return {...state, username: action.username }
        case AuthenticationActionTypes.LOGOUT:
            return {...state, username: undefined }
        default:
            return state
    }
}