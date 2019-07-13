import React, {Component} from 'react';
import { connect } from 'react-redux';

import Cyto from '../cyto/cyto';
import '../styles/App.scss';


class Graph extends Component{
  constructor(props) {
    super(props);
  }
  render() {
    let fetching;
    // if(!this.props.fetchingFlag && !this.props.finishedFlag) {
    //   fetching = <div id="welcome"><input type="image" src="../src/assets/logo.png" alt="Mira Logo"></input><br/><br/><h2>Welcome to Mira</h2><h2>Select a region to get started</h2></div>
    // }
    if(this.props.fetchingFlag){
      fetching = <div id="loading" ><img src="../src/assets/loading.svg" alt="Loading..."></img></div>
    } 
    return (
      <div id="graphContainer">
          <div id="cytoscape">
          {fetching}
            
            <Cyto regionData={this.props.regionData} getNodeDetails={this.props.getNodeDetails} fetchingFlag={this.props.fetchingFlag}
            edgeTable = {this.props.edgeTable} />
          </div>
      </div>
    )
  }
}

export default Graph