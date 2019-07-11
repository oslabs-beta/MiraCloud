import React, { Component } from 'react';
import Graph from "../components/Graph";
import Side_Panel from "../components/Side_Panel";
const { ipcRenderer } = require('electron');

class MainContainer extends Component {
  //SIDE PANEL RENDERS CONDITIONALLY
  componentDidMount() {
    //emits event to the back-end
    let reply = ipcRenderer.sendSync('getCredentials'); // render process sends info to electron via ipcRendered
    this.props.getAWSKeys(reply); // getAWSkeys is takes payload from action which is login and password
    // add login reducer just for login operations
  }
  render() {
    return (
      <div id="mainContainer">
        <Graph getAWSInstances={this.props.getAWSInstances} regionData={this.props.regionData} getNodeDetails={this.props.getNodeDetails} fetchingFlag={this.props.fetchingFlag} finishedFlag={this.props.finishedFlag}
          edgeTable={this.props.edgeTable} />
        {/* sgRelationships={this.props.sgRelationships}
          sgNodeCorrelations={this.props.sgNodeCorrelations}/> */}
        <Side_Panel regionData={this.props.regionData} activeNode={this.props.activeNode} />
      </div>
    )
  }
}

export default MainContainer;