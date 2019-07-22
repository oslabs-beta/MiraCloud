import React, { Component } from 'react';
import Select from 'react-select';
import { connect } from 'react-redux';
const {ipcRenderer} = require('electron');
import * as actions from "../actions/actions.js";
import Modal from 'react-modal';
import InstanceCreator from './InstanceCreator.jsx'

const mapDispatchToProps = dispatch => ({
  logOut: () => {
     dispatch(actions.logOut())
  }
}) 

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class Menu extends Component {
  constructor(props){
    super(props)
    this.state ={
     selectedOption: null,
     modalIsOpen: false,
     delete: false
   }
   this.openModal = this.openModal.bind(this);
   this.closeModal = this.closeModal.bind(this);
  }

  openModal(string) {
    if(string === 'delete') this.setState({modalIsOpen: true, delete: true});
    else this.setState({modalIsOpen: true, delete: false});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }
  render() {
    // want to setState to the active value
    const options = [
          { value:'select-region', label: 'Select Region' },
          { value:'all', label: 'All Regions'},
          { value:'us-east-2', label: 'US East (Ohio)' },
          { value:'us-east-1', label: 'US East (N. Virginia)' },
          { value:'us-west-2', label: 'US West (Oregon)' },
          { value:'us-west-1', label: 'US West (N. California)'  },
          { value:'ap-south-1', label: 'Asia Pacific (Mumbai)' },
          { value:'ap-northeast-3', label: 'Asia Pacific (Osaka-Local)' },
          { value:'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
          { value:'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
          { value:'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
          { value:'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
          { value:'ca-central-1', label: 'Canada (Central)' },
          { value:'cn-north-1', label: 'China (Beijing)' },
          { value:'cn-northwest-1', label: 'China (Beijing)' },
          { value:'eu-central-1', label: 'EU (Frankfurt)' },
          { value:'eu-west-1', label: 'EU (Ireland)' },
          { value:'eu-west-2', label: 'EU (London)' },
          { value:'eu-west-3', label: 'EU (Paris)' },
          { value:'eu-north-1', label: 'EU (Stockholm)' },
          { value:'sa-east-1', label: 'South America (São Paulo)' }
    ];

    const handleChange = (selectedOption) => {
      this.setState({ selectedOption })
      if(selectedOption.value !== 'select-region'){
        
        if(selectedOption.value === 'all'){
          this.props.getAllRegions(this.props.publicKey, this.props.privateKey);
        } else{
          this.props.getAWSInstances(selectedOption.value, this.props.publicKey, this.props.privateKey);
        }
      }
    };
    const refresh = () => {
      if(this.props.currentRegion !== ''){
        if(this.props.currentRegion === 'all'){
          this.props.getAllRegions(this.props.publicKey, this.props.privateKey);
        }
        else this.props.getAWSInstances(this.props.currentRegion, this.props.publicKey, this.props.privateKey);
      }
    };
     // Log out--  notifies main.js about change and changes action 
    const handleLogOut = () => {
       //emits event to the back-end
       ipcRenderer.sendSync('logOut'); // render process sends info to electron via ipcRendered
       this.props.logOut()
    }

    return (
      <div id="Menu">
        <div id='top-menu'>
          <img id='small_logo' src="../src/assets/mira3.png" />
          <button id="logout" onClick={handleLogOut}>Log Out</button>
        </div>
        {/* select component for html in react jsx */}
        <div id='bottom-menu'>
          <h4>Choose a region:</h4>
          <Select id='select-menu' value={this.state.selectedOption} onChange={handleChange} options={options}/>
          <button id="refresh" onClick={refresh}><img id="refreshimg" src="../src/assets/refresh.png"/></button> 
          <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal} style={customStyles} contentLabel="Instance Modal">
            <InstanceCreator selectedRegion={this.state.selectedOption} delete={this.state.delete} activeNode={this.props.activeNode} onRequestClose={this.closeModal}/>
            <button onClick={this.closeModal}>close</button>
          </Modal>
          <button id='deleteInstance' onClick={(e)=>{this.openModal('delete')}}>Delete</button>
          <button id='createInstance' onClick={(e)=>{this.openModal('create')}}>Launch</button>
        </div>
      </div>
    );
  }
}


export default connect(null,mapDispatchToProps)(Menu);
