const AWS = require('aws-sdk');

const options = {
  'us-east-1': 'US East (N. Virginia)',
  'us-east-2': 'US East (Ohio)',
  'us-west-2': 'US West (Oregon)',
  'us-west-1': 'US West (N. California)',
  'ap-south-1': 'Asia Pacific (Mumbai)',
  'ap-northeast-3': 'Asia Pacific (Osaka-Local)',
  'ap-northeast-2': 'Asia Pacific (Seoul)',
  'ap-southeast-1': 'Asia Pacific (Singapore)',
  'ap-southeast-2': 'Asia Pacific (Sydney)',
  'ap-northeast-1': 'Asia Pacific (Tokyo)',
  'ca-central-1': 'Canada (Central)',
  'cn-north-1': 'China (Beijing)',
  'cn-northwest-1': 'China (Beijing)',
  'eu-central-1': 'EU (Frankfurt)',
  'eu-west-1': 'EU (Ireland)',
  'eu-west-2': 'EU (London)',
  'eu-west-3': 'EU (Paris)',
  'eu-north-1': 'EU (Stockholm)',
  'sa-east-1': 'South America (São Paulo)'
};

class compileGraphData {
  constructor(){
    this.regionState = {};
    this.sgRelationships = []; //array of arrays where each inside looks like [ [inbound sg, outbound sg] ]
    this.sgNodeCorrelations = {};
    this.edgeTable = {};
    this.ec2;
    
  }

  compileRDSData(data,region){
    return new Promise((originalResolve, originalReject) => {
      AWS.config.update({
        region,
      });
      this.ec2  = new AWS.EC2({});
      const innerPromiseArray =[];

  
      for(let i = 0; i < data.DBInstances.length; i++) {
        let DBinstances = data.DBInstances[i];
        //destructure the data for relevant data
        let {DBSubnetGroup: {VpcId}, AvailabilityZone, DbiResourceId, VpcSecurityGroups} = DBinstances;
        // if the property doesn't exist within the object, create an object to save all the data in
        if(!this.regionState.hasOwnProperty(VpcId))this.regionState[VpcId] = {};
        if(!this.regionState[VpcId].hasOwnProperty(AvailabilityZone))this.regionState[VpcId][AvailabilityZone] = {};
        if(!this.regionState[VpcId][AvailabilityZone].hasOwnProperty("RDS"))this.regionState[VpcId][AvailabilityZone].RDS ={};
        //save the data into the this.regionState object
        this.regionState[VpcId].region = options[region];
        this.regionState[VpcId][AvailabilityZone].RDS[DbiResourceId] = DBinstances;
  
        innerPromiseArray.push(new Promise((resolve,reject) => {
          const param = {
            GroupIds:[]
          };
          for(let k = 0; k < VpcSecurityGroups.length; k++){
            param.GroupIds.push(VpcSecurityGroups[k].VpcSecurityGroupId);
          }
          this.ec2.describeSecurityGroups(param, (err, data) => {
            if (err) {
              console.log(err, err.stack);
              reject();
            }
            else {
              console.log('promise 1', this.sgRelationships, this.sgRelationships.length);
              this.regionState[VpcId][AvailabilityZone].RDS[DbiResourceId].MySecurityGroups = data.SecurityGroups;
              for(let h = 0; h < data.SecurityGroups.length; h++){
                if(!this.sgNodeCorrelations[data.SecurityGroups[h].GroupId]) this.sgNodeCorrelations[data.SecurityGroups[h].GroupId]  = new Set();
                this.sgNodeCorrelations[data.SecurityGroups[h].GroupId].add(DbiResourceId);
  
                if(data.SecurityGroups[h].IpPermissions.length > 0){
                  for(let i = 0; i < data.SecurityGroups[h].IpPermissions[0].UserIdGroupPairs.length; i++ ){
                    this.sgRelationships.push([data.SecurityGroups[h].IpPermissions[0].UserIdGroupPairs[i].GroupId, data.SecurityGroups[h].GroupId])
                    console.log('promise 2', this.sgRelationships, this.sgRelationships.length)
                  }
                }
              }
              resolve();
            }
          });
        }));
      }
  
      console.log(innerPromiseArray);
  
      Promise.all(innerPromiseArray)
        .then((data) => {
          console.log('promise 3', data, this.sgRelationships, this.sgRelationships.length)
          originalResolve();
        })
        .catch(err => originalReject(err));
    });
  }

  compileEC2Data(data, region){
    return new Promise((originalResolve, originalReject) => {
      AWS.config.update({
        region,
      });
      console.log("REGION IS HERE 5",AWS.config.region)

      this.ec2 = new AWS.EC2({});
      const innerPromiseArray =[];
      for(let i = 0; i < data.Reservations.length; i ++){
        let instances = data.Reservations[i].Instances;
        for( let j = 0; j < instances.length; j++){
          let {VpcId, Placement: {AvailabilityZone}, InstanceId, SecurityGroups} = instances[j];
          if(!this.regionState.hasOwnProperty(VpcId))this.regionState[VpcId] = {};
          if(!this.regionState[VpcId].hasOwnProperty(AvailabilityZone))this.regionState[VpcId][AvailabilityZone] = {};
          if(!this.regionState[VpcId][AvailabilityZone].hasOwnProperty("EC2"))this.regionState[VpcId][AvailabilityZone].EC2 = {};
          this.regionState[VpcId].region = options[region];
          this.regionState[VpcId][AvailabilityZone].EC2[InstanceId] = instances[j];
          
          //making a new promise to query for information about security group related to each EC2
          innerPromiseArray.push(new Promise((resolve,reject) => {
            const param = {
              GroupIds:[]
            };
            for(let k = 0; k < SecurityGroups.length; k++){
              param.GroupIds.push(SecurityGroups[k].GroupId); 
            }
            this.ec2.describeSecurityGroups(param, (err, data) => {
              if (err) {
                console.log(err, err.stack);
                reject();
              }
              else {
                    this.regionState[VpcId][AvailabilityZone].EC2[InstanceId].MySecurityGroups = data.SecurityGroups;
                    for(let h = 0; h < data.SecurityGroups.length; h++){
                    
                      if(!this.sgNodeCorrelations[data.SecurityGroups[h].GroupId]) this.sgNodeCorrelations[data.SecurityGroups[h].GroupId]  = new Set();
                      this.sgNodeCorrelations[data.SecurityGroups[h].GroupId].add(InstanceId);
                      
                      if(data.SecurityGroups[h].IpPermissions.length > 0){
                      
                        for(let i = 0; i < data.SecurityGroups[h].IpPermissions[0].UserIdGroupPairs.length; i++ ){
                          this.sgRelationships.push([data.SecurityGroups[h].IpPermissions[0].UserIdGroupPairs[i].GroupId, data.SecurityGroups[h].GroupId])

                        }
                      }
                    }
                    // console.log("Node relations ", this.sgNodeCorrelations)
                    resolve();
              }
            })
          }));
          
        }
      }

      Promise.all(innerPromiseArray)
        .then(() => {
          originalResolve();
        })
        .catch(err => originalReject(err));
    })
  }

  createEdges(){
     for(let i = 0; i < this.sgRelationships.length; i++){
     const firstParam = Array.from( this.sgNodeCorrelations[this.sgRelationships[i][0]]);
     const id = firstParam[0];
     const secondParam = Array.from(this.sgNodeCorrelations[this.sgRelationships[i][1]]);
     const sg = secondParam[0];
      if(!this.edgeTable.hasOwnProperty(id)){ 
        this.edgeTable[id]= new Set();
    
      }      
      this.edgeTable[id].add(sg);
    }

    console.log("the edge tables",this.edgeTable) 
    return this.edgeTable;
  }

  getRegionData(){
    return this.regionState;
  }
  getEdgesData(){
    return this.edgeTable;
  }
}

export default compileGraphData;
