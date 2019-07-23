import * as actionTypes from '../constants/actionTypes';

const initialState = {
    currentRegion: '',
    regionData: {},
    edgeTable:{},
    // sgNodeCorrelations: {},
    // sgRelationships: [],
    activeNode: '',
    fetching: false,
    fetched: false,
    allRegions: {}
}

// should possibly rename this reducer
const graphReducer = (state = initialState, action) => {
    switch (action.type) {
      case actionTypes.GET_AWS_INSTANCES_START:{
        return {
          ...state,
          fetching:true,
          fetched: false
        }
      }
      case actionTypes.GET_AWS_INSTANCES_FINISHED:{
        return {
          ...state,
          fetching:false,
          fetched: true
        }
      }
      case actionTypes.GET_AWS_INSTANCES: {
        return {
          ...state,
          regionData: action.payload.regionState,
          currentRegion: action.payload.currentRegion,
          edgeTable: action.payload.edgeTable,
          activeNode: {}
          // sgNodeCorrelations: action.payload.sgNodeCorrelations,
          // sgRelationships: action.payload.sgRelationships
        }
      }
      case actionTypes.NODE_DETAILS: {
        console.log('why is it undefined, payload', action.payload)
        console.log('nodedata', state);
        const instanceId = action.payload[0];
        const instanceType = action.payload[1];
        // const availabilityZone = action.payload[2];
        const VPC = action.payload[3];
        let nodeData;
        if (instanceType === "S3"){
          nodeData = state.regionData[VPC]['S3Data'][instanceId];
        } else {
          const availabilityZone = action.payload[2];
          nodeData = state.regionData[VPC][availabilityZone][instanceType][instanceId];
        }
        console.log('node data before return', nodeData);
        return {
          ...state,
          activeNode: nodeData
        }
      }
      case actionTypes.GET_ALL_REGIONS: {
        return {
          ...state,
          allRegions: action.payload.result
        }
      }
      default: return state;
    }
}

export default graphReducer;