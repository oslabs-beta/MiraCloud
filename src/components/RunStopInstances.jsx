import React, {Component} from 'react';
import Modal from 'react-modal';
const AWS = require("aws-sdk");

const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)"
    }
  };

class RunStopInstances extends Component {
    constructor() {
      super();
      this.state = {
        modalIsOpen: false,
        start: false,
        stop: false
      }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.startInstance = this.startInstance.bind(this)
    this.stopInstance = this.stopInstance.bind(this)
}

start(){
    this.setState({ start: true , stop: false})
    this.openModal();
    }

stop(){
    this.setState({ stop: true , start:false})
    this.openModal();
};

openModal() {
    this.setState({modalIsOpen: true});
  }

closeModal() {
    this.setState({ modalIsOpen: false, start: false, stop: false});
  }


startInstance(){
const ec2 = new AWS.EC2();
const rds = new AWS.RDS();
// in case if status is still pending throw alert
if (this.props.activeNode.DBInstanceStatus === "starting" || this.props.activeNode.DBInstanceStatus === "stopping"){
  alert(`${this.props.activeNode.DBInstanceIdentifier} status is still pending.It may take few minutes.`)
  this.closeModal();
}
    // Function to start EC2 instances
if (this.props.activeNode.InstanceId){
    var params = {
    InstanceIds: [this.props.activeNode.InstanceId]
    };
    function runEC2Ins(){
        return new Promise((resolve, reject) => {
        ec2.startInstances(params, ((err, data) => {
          if (err) reject(`Couldn't start "${this.props.activeNode.InstanceId}"`,err);
          else resolve(data); 
        }));
      });
    };
  runEC2Ins()
  .then(() => this.closeModal())
  .then(() => alert(`"${this.props.activeNode.InstanceId}" has been started.Please refresh page.`) )
  .catch((err) => alert(err))
  }
    // Function to start RDS instances  
  else if (this.props.activeNode.DBInstanceIdentifier){
    const params = {
      DBInstanceIdentifier: this.props.activeNode.DBInstanceIdentifier
    };
    function runRDSIns(){
      return new Promise((resolve, reject) => {
      rds.startDBInstance(params, ((err, data) => {
        if (err) reject(`Couldn't start "${this.props.activeNode.DBInstanceIdentifier}"`,err);
        else resolve(data); 
      }));
    })};
    runRDSIns()
    .then(() => this.closeModal())
    .then(() => alert(`"${this.props.activeNode.DBInstanceIdentifier}" has been started.Please refresh page.`) )
    .catch((err) => alert(err))
  };
event.preventDefault();
};

stopInstance(){
const ec2 = new AWS.EC2();
const rds = new AWS.RDS();
// in case if status is still pending throw alert
if (this.props.activeNode.DBInstanceStatus === "starting" || this.props.activeNode.DBInstanceStatus === "stopping"){
  alert(`${this.props.activeNode.DBInstanceIdentifier} status is still pending.It may take few minutes.`);
  this.closeModal();
}
// function to stop EC2 instance
if (this.props.activeNode.InstanceId){
  const params = {
      InstanceIds: [this.props.activeNode.InstanceId]
      };
      function stopIns(){return new Promise((resolve, reject) =>{
          ec2.stopInstances(params, ((err, data) => {
          if (err) reject(`Couldn't stop "${this.props.activeNode.InstanceId}"`,err);
              else resolve(data); 
          }));
      });
  };
      stopIns()
      .then( () => alert(`"${this.props.activeNode.InstanceId}" has been stoped.Please refresh page.`) )
      .then( () => this.closeModal())
      .catch(err => alert(err))
}
    // Function to stop RDS instances
    else if (this.props.activeNode.DBInstanceIdentifier){
      const params = {
        DBInstanceIdentifier: this.props.activeNode.DBInstanceIdentifier
      };
      function stopRDSIns(){
        return new Promise((resolve, reject) => {
          rds.stopDBInstance(params, ((err, data) => {
            if (err) reject(`Couldn't stop "${this.props.activeNode.DBInstanceIdentifier}"`,err)
            else resolve(data)
          }));
        });
      };
      stopRDSIns()
      .then(() => {alert(`"${this.props.activeNode.DBInstanceIdentifier}" has been stoped.Please refresh page.`)})
      .then(() => this.closeModal())
      .catch(() => alert(err))
    };
  event.preventDefault();
};



render(){
  let displayStart = [
    <div>
      <p>Click Start Instance to start "{this.props.activeNode.InstanceId ? this.props.activeNode.InstanceId : this.props.activeNode.DBInstanceIdentifier }" instance</p>
      <button onClick={this.startInstance}> Start Instance</button>
    </div>
  ]

  let displayStop = [
	  <div>
		  <p>Click Stop Instance to stop "{this.props.activeNode.InstanceId ? this.props.activeNode.InstanceId : this.props.activeNode.DBInstanceIdentifier }" instance</p>
		  <button onClick={this.stopInstance} >Stop Instance</button>		  
	  </div>
  ] 


return(
    <div id="runstop">
      <button onClick={this.start}> Start Instance</button>,
      <button onClick={this.stop}> Stop instance</button>
    <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal} style={customStyles} contentLabel="Other Modal">
        {this.state.stop ? displayStop : displayStart}
        <button onClick={this.closeModal}>Close</button>
    </Modal>
    </div>
  );
 };
};

export default RunStopInstances;