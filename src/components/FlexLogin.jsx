import React, {Component} from 'react';
import Login from "../components/Login.jsx"
import Welcome from "../components/Welcome.jsx"

function FlexLogin(props){
    return (
        <div id='flex-card'>
        <Welcome />
        <Login loginKey={props.loginKey} logIn={props.logIn}/>
        </div>
    )
}

export default FlexLogin;