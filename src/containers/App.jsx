//wrapper container for the entire react
import React, {Component} from "react";
// import store from "../store";
import MainContainer from "./mainContainer";
import Menu from "../components/Menu.jsx"
import Login from "../components/Login.jsx"
import * as actions from "../actions/actions.js";
import { connect } from 'react-redux';

// mainprocess.test() // was testing for credentials
const mapStateToProps = store => ({
  regionData: store.graph.regionData,
  activeNode: store.graph.activeNode,
  currentRegion: store.graph.currentRegion,
  edgeTable: store.graph.edgeTable,
  // sgNodeCorrelations: store.graph.sgNodeCorrelations,
  // sgRelationships: store.graph.sgRelationships,
  fetchingFlag: store.graph.fetching,
  finishedFlag: store.graph.fetched,
  publicKey: store.login.awsPublicKey,
  privateKey: store.login.awsPrivateKey,
  loginKey: true //store.login.loginKey
})

const mapDispatchToProps = dispatch => ({
  //get data on one single region
    getAWSInstances: (instances, key1, key2) => {
        dispatch(actions.getAWSInstances(instances, key1, key2));
    },
    //show details on specific nodes on click
    getNodeDetails: (data) => {
      dispatch(actions.getNodeDetails(data));
    },

    getAllRegions: (publicKey, privateKey) => {
      dispatch(actions.getAllRegions(publicKey,privateKey));
    },
    //get credentials from folder on computer
    getAWSKeys: (keys) => {
      dispatch(actions.getAWSKeys(keys));
    },
    //login state 
    logIn: () => {
      dispatch(actions.logIn());
    }
})

class App extends Component{

  render(){
    console.log(this.props);
    let display = [];
    display.push(<Menu activeNode={this.props.activeNode} publicKey={this.props.publicKey} privateKey={this.props.privateKey} getAWSInstances={this.props.getAWSInstances} currentRegion={this.props.currentRegion} getAllRegions={this.props.getAllRegions} />);
    display.push(<MainContainer getAWSKeys={this.props.getAWSKeys} getAWSInstances={this.props.getAWSInstances} regionData={this.props.regionData} 
      getNodeDetails={this.props.getNodeDetails} activeNode={this.props.activeNode} fetchingFlag={this.props.fetchingFlag} finishedFlag={this.props.finishedFlag}
      edgeTable= {this.props.edgeTable}/>);
    return(
      <div id="app">
        {this.props.loginKey ? display : <Login loginKey={this.props.loginKey} logIn={this.props.logIn}/> }
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);