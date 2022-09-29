import React, { FC, useEffect } from "react";
import "./App.scss";
import AppRouter from "./components/AppRouter";
import NavBar from "./components/NavBar";
import { Layout } from "antd";
import { useActions } from "./hooks/useActions";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Amplify} from 'aws-amplify';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure({
  Auth: {
    userPoolId: process.env.REACT_APP_COGNITO_POOL_ID, //UserPool ID
    region: 'eu-north-1',
    userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID
  }
});


const App = ({user, signOut}: {user: CognitoUser, signOut: any} | any) => {

  const {setUsernameName} = useActions()
  
  setUsernameName(user)

  return (
    <>
      <AppRouter />
      <ToastContainer position="top-right" />
    </>
  );
};

export default withAuthenticator(App, {
  loginMechanisms: ['username'],
  
});
