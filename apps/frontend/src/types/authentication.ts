export interface AuthenticationState {
    username?: string
    loading: boolean
}


export enum AuthenticationActionTypes {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT'
}

interface LoginAction {
    username: string
    type: AuthenticationActionTypes.LOGIN
}

interface LogoutAction {
    type: AuthenticationActionTypes.LOGOUT
}

export type AuthenticationAction = LoginAction | LogoutAction