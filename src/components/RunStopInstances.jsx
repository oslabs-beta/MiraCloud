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
AWS.config.update({ region: 'us-west-1' }); //updates arguments region, maxRetries, logger
}

openModal() {
    this.setState({modalIsOpen: true});
  }
closeModal() {
    this.setState({ modalIsOpen: false, stop: false, start: false});
  }

start(){
    this.setState({ start: true , stop: false})
    console.log("heeeeey,here is start => ", this.state.start)
    }

stop(){
    this.setState({ stop: true , start:false})
    console.log("heeeeey,here is stop => ", this.state.stop)
};

startInstance(){
const ec2 = new AWS.EC2();	
if(this.props.activeNode !== undefined){
    var params = {
    InstanceIds: [this.props.activeNode.InstanceId]
    };
    function startIns(){
        return new Promise((resolve, reject) => {
        ec2.startInstances(params, ((err, data) => {
        if (err) reject(`Couldn't start ${this.props.activeNode.InstanceId}`,err);
        else resolve(data); 
        }));
        });
    };
startIns()
.then(() => this.props.onRequestClose())
.catch((err) => alert(err))
event.preventDefault();
  }	
};

stopInstance(){
const ec2 = new AWS.EC2();
var params = {
    InstanceIds: [this.props.activeNode.InstanceId]
    };
    function stopIns(){return new Promise((resolve, reject) =>{
    ec2.stopInstances(params, ((err, data) => {
    if (err) reject(`Couldn't stop ${this.props.activeNode.InstanceId}`,err);
        else resolve(data); 
    }));
    });
};
    stopIns()
    .then(data => console.log(data))
    .catch(err => alert(err))
     event.preventDefault();
};

render(){
  let displayStart = [
	<div>
		<p>Click Start Instance to start EC2 instance</p>
		{/* <p>Click Start Instance to start {this.props.activeNode.InstanceId} EC2 instance</p> */}
		<button onClick={this.startInstance}> Start Instance</button>
	</div>
  ]

  let displayStop = [
	  <div>
		<p>Click Stop Instance to stop EC2 instance</p>
		{/* <p>Click Stop Instance to stop {this.props.activeNode.InstanceId} EC2 instance</p> */}
		<button onClick={this.stopInstance} >Stop Instance</button>		  
	  </div>
  ] 

    return(
    <div>
    <Modal isOpen={this.state.modalIsOpen} onAfterOpen={this.afterOpenModal} onRequestClose={this.closeModal} style={customStyles} contentLabel="Example Modal">
        {this.state.start ? displayStart : displayStop}
    </Modal>
    </div>
  )
 }
}

export default RunStopInstances;