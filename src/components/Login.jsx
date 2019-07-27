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
    // componentDidMount(){
    //   const app = document.getElementById('app');
    //   app.style.display = 
    //   console.log('app', app);
    // }
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
      return (
          <div id="loginContainer">  
            <div id='input_keys'>
                <div id='keys_label'><img id="keys" src="../src/assets/key2.png"></img>Please enter your keys:</div>
                <div id='login_keys'><input type='type' id='accessKeys' placeholder='Public Key' onChange={(e)=>{this.handleChange(e.target.value, 'publicKey')}}></input></div>
                <div id='login_keys'><input type='password' id='accessKeys' placeholder='Secret Key' onChange={(e)=>{this.handleChange(e.target.value, 'secretKey')}}></input></div>
                <button id='login_button' onClick={(e)=>{this.handleSubmit(this.state.publicKey, this.state.secretKey)}}>Login</button>
            </div>
          </div>
      )
    }
  }
  
  export default Login;