import React, {Component} from 'react';
// const {ipcRenderer} = require('electron');

function Welcome (props) {
   return (
        <div id="welcome">
            <div id='welcome_card'>
            <div id="welcome_to">Welcome to</div>
            <input type="image" src="../src/assets/mira_white.png" alt="Mira Logo"></input>
            <div id="mira-description">a configuration tool for AWS’ services</div>
            </div>
        </div>
   )
}

export default Welcome;