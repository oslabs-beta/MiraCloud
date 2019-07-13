import React, {Component} from 'react';
const {ipcRenderer} = require('electron');

// import { connect } from 'react-redux';


class Login extends Component{
    constructor(props){
        super(props)
        this.state ={
         publicKey: '',
         secretKey: ''   
       }
       this.handleChange = this.handleChange.bind(this);
       this.handleSubmit = this.handleSubmit.bind(this);
      }

    handleChange(field, fieldName){
        return this.setState(state => ({
            [fieldName] : field
        }))
    }
    handleSubmit(publicKey, secretKey){
        ipcRenderer.sendSync('logIn', [publicKey, secretKey]);
        this.props.logIn();
        return this.setState(state => ({
            publicKey:'',
            secretKey: ''
        }))
    }
    render() {
      let fetching = <div id="welcome"><input type="image" src="../src/assets/mira3.png" alt="Mira Logo"></input></div>
      return (
          <div id="loginContainer">
              {fetching}
              <div id='input_keys'>
                <div id='login_keys'><h4>Public Key</h4><input type='text' id='accessKeys' onChange={(e)=>{this.handleChange(e.target.value, 'publicKey')}}></input></div>
                <div id='login_keys'><h4>Secret Key</h4><input type='text' id='accessKeys' onChange={(e)=>{this.handleChange(e.target.value, 'secretKey')}}></input></div>
                <button onClick={(e)=>{this.handleSubmit(this.state.publicKey, this.state.secretKey)}}>Login</button>
              </div>
          </div>
      )
    }
  }
  
  export default Login;