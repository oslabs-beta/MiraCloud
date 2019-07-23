import React, {Component} from 'react';
import ReactJson from 'react-json-view';
import SecGroupEdit from './Security_Group_Edit';
import Modal from 'react-modal';
import Collapsible from 'react-collapsible';
// import {Switch, BrowserRouter as Router, Route, NavLink, withRouter } from 'react-router-dom';

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

class Side_Panel extends Component {
  constructor() {
    super();

    this.state = {
      modalIsOpen: false,
      delete: false
    };
    this.delete = this.delete.bind(this);
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.analyzeSecurityGroups = this.analyzeSecurityGroups.bind(this);
  }

  delete() {
    this.setState({delete: true});
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    // this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({ modalIsOpen: false, delete: false });
  }

  analyzeSecurityGroups(securityGroup) {
    let ids = [];
    let names = [];

    // for(let i=0; i<securityGroup.length; i++) {
    //   names.push(securityGroup[i].GroupName)
    //   ids.push(securityGroup[i].GroupId);
    // }

    return { names: names, ids: ids };
  }

  render() {
    const reactJsonconfig = {
      indentWidth: 1,
      name: this.props.activeNode.InstanceId,
      theme: "bright",
      iconStyle: "square",
      displayObjectSize: false,
      displayDataTypes: false
    };

    let NodeDetails;
    let sgmodal;
    let sidePanelWelcome;

    if (Object.keys(this.props.activeNode).length > 0) {
      const reactJsonconfig = {
        indentWidth:1,
        name:this.props.activeNode.InstanceId,
        theme: "monokai",
        iconStyle:"circle",
        displayObjectSize:false,
        displayDataTypes:false
      };
      let securityGroupNames;
      if (this.props.activeNode.MySecurityGroups) {
        securityGroupNames = this.analyzeSecurityGroups(
          this.props.activeNode.MySecurityGroups
        );
      }
      let nodeData;
      if (this.props.activeNode.MySecurityGroups) {
        nodeData = {
          "Node Details": this.props.activeNode,
          "Security Group Details": this.props.activeNode.MySecurityGroups
        };
      } else {
        nodeData = {
          "Node Details": this.props.activeNode
        }
      }
      // let nodeData = {
      //   "Node Details": this.props.activeNode,
      //   "Security Group Details": this.props.activeNode.MySecurityGroups
      // };
      // console.log("fdsjfdhsjk", securityGroupNames);
      if(this.props.currentRegion !== 'all') {
        sgmodal =(
          <div>
          <button id="modal-pop-up" onClick={this.openModal}>
            Add SG Rules
          </button>
          <button
          id="deleteBtn"
          onClick={() => {
            // console.log(
            //   "this is current delete statement =>",
            //   this.state.delete
            // );
            this.delete();
            this.openModal();
          }}
        >
          Delete SG rules
        </button>
        </div>
        );
     }
      let sgDetails = [];
      if (securityGroupNames){
        sgDetails.push(
        <div>
        <p>
          <span className="sidebar-title">Security Groups: </span>
          <span>
            {securityGroupNames.names.join(", ")}
            {securityGroupNames.ids.join(", ")}
          </span>
        </p>
        <p>
          <span className="sidebar-title">Inbounds: </span>
          <span>{securityGroupNames.ids.join(", ")}</span>
        </p>
        <p>
          <span className="sidebar-title">Outbounds: </span>
          <span>{securityGroupNames.ids.join(", ")}</span>
        </p>
        </div>
        )
      }
      let InstanceTypeDisplay;
      let InstanceIdDisplay;
      let InstanceStatusDisplay;
      if(this.props.activeNode.InstanceId){
        InstanceTypeDisplay = "EC2";
        InstanceIdDisplay = this.props.activeNode.InstanceId;
        InstanceStatusDisplay = this.props.activeNode.State.Name;
      } else if (this.props.activeNode.DBInstanceStatus){
        InstanceTypeDisplay = "RDS";
        InstanceIdDisplay = this.props.activeNode.DBInstanceIdentifier;
        InstanceStatusDisplay = this.props.activeNode.DBInstanceStatus;
      } else if (this.props.activeNode.get_region_s3){
        InstanceTypeDisplay = "S3";
      } else{
        InstanceTypeDisplay = 'Lambda';
        InstanceIdDisplay = this.props.activeNode.FunctionName;
        InstanceStatusDisplay = this.props.activeNode.TracingConfig.Mode;
      }
      NodeDetails = (
        <div id="details-wrapper">
          <Collapsible trigger="Node Summary" open="true">
            {sgmodal}
            <p>
              <span className="sidebar-title">Instance Type: </span>
              <span>{InstanceTypeDisplay}</span>
            </p>
            <p>
              <span className="sidebar-title">Instance ID: </span>
              <span>
                {InstanceIdDisplay}
              </span>
            </p>
            <p>
              <span className="sidebar-title">Instance Status: </span>
              <span>
                {InstanceStatusDisplay}
              </span>
            </p>
            {/* {sgDetails} */}
          </Collapsible>
          <Collapsible trigger="Node Details" open="true">
            <div id="main-info" className="node-info">
              <ReactJson src={nodeData} name={"Active Node"} theme={reactJsonconfig.theme}indentWidth={reactJsonconfig.indentWidth} iconStyle={reactJsonconfig.iconStyle} displayObjectSize={reactJsonconfig.displayObjectSize} displayDataTypes={reactJsonconfig.displayDataTypes}/>
            </div>
          </Collapsible>
        </div>
      );
    } else if (typeof this.props.activeNode !== "string") {
      sidePanelWelcome = (
        <div id="side-panel-welcome">
          {" "}
          Click on a node to get more information.
        </div>
      );
    } else {
    }

    return (
      <div id="sidePanel">
        {sidePanelWelcome}
        <Modal isOpen={this.state.modalIsOpen} onAfterOpen={this.afterOpenModal} onRequestClose={this.closeModal} style={customStyles} contentLabel="Example Modal">
          <SecGroupEdit sgData={this.props.activeNode.MySecurityGroups} onRequestClose={this.closeModal} delete={this.state.delete}/>
          <button onClick={this.closeModal}>Close</button>
        </Modal>
        {NodeDetails}
      </div>
    );
  }
}

export default Side_Panel;
