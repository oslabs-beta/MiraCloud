import React, { Component } from "react";
import { EC2 } from "aws-sdk";
import RDS from "../cyto/RDS";
const AWS = require('aws-sdk');
const ec2 = new AWS.EC2();
// import { EC2 } from "aws-sdk";
// AWS.config.update({region: 'ap-northeast-2'});
// let myConfig = new AWS.Config({
//  region: "us-west-2"
// });
// AWS.config = myConfig

class InstanceCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "value"
      };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.deleteInstance = this.deleteInstance.bind(this);
    this.change = this.change.bind(this);
  }

  change(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit() {
    // functionality for creating rds
    
    if (this.state.value === "RDS") {
      console.log("IMMMHEREEE from rds", this.state.instance);
    }
    
    // functionality for creating ec2
    if (this.state.value === "EC2") {
      console.log("IMMMHEREEE from ec2", this.state.instance);
      const params = {
        ImageId: "ami-abc12345",
        InstanceType: "t2.micro",
        // KeyName: "my-key-pair",
        MaxCount: 1,
        MinCount: 1,
        // SecurityGroupIds: ["sg-1a2b3c4d"],
        // SubnetId: "subnet-6e7f829e",
        Monitoring: {
          Enabled: true  /* required || false */
        },
        Placement: {
          AvailabilityZone: 'ap-northeast-2',
        },
        TagSpecifications: [
          {
            ResourceType: "instance",
            Tags: [
              {
                Key: "Purpose",
                Value: "test"
              }
            ]
          }
        ]
      };
      function runInstances() {
      return new Promise((resolve, reject) =>
      ec2.runInstances(params, function (err, data) {
        // an error occurred
        if (err) reject(err)
        // successful response
        resolve(data);
      })
    )
  }
  runInstances()
    .then((data) => console.log(data))
    .catch((err) => console.log('you got an errrror=>', err))
}
event.preventDefault();
}
  deleteInstance() {
    console.log(this.source.value);
    console.log(this.props.activeNode);
    let instanceId = this.source.value;
    let activeNode = this.props.activeNode;
    // console.log('instanceid', `${instanceId}`);
    // console.log(this.type.value);
    function checkSG(){return new Promise((resolve, reject)=>{
        let forceErr = false;
        if(activeNode.MySecurityGroups){
          for(let i = 0; i < Object.keys(activeNode.MySecurityGroups).length; i++){
            if(activeNode.MySecurityGroups[i].IpPermissions.length > 1 || activeNode.MySecurityGroups[i].IpPermissionsEgress.length > 1){
              forceErr = true;
            }
          }
        }
        if(forceErr) reject('Delete security group rules first');
        else resolve();
      })
    }
    function deleteSG(){ return new Promise((resolve, reject)=>{
      let ec2 = new AWS.EC2();
      let paramsSG = {
       GroupId: `${activeNode.SecurityGroups[0].GroupId}`
      }
      ec2.deleteSecurityGroup(paramsSG, function(err, data) {
        if (err){
          reject(err); 
        } // an error occurred
        else resolve(data);          // successful response
      });
     })
    }

   if(this.type.value === 'EC2'){
      // console.log('ec2')
    let params = {
      InstanceIds: [`${instanceId}`],
    }
    let ec2 = new AWS.EC2();

    function deleteEC2(){return new Promise((resolve,reject)=>{
      ec2.terminateInstances(params, function (err, data) {
        if (err){
          console.log(err, err.stack);
          reject(err);
        } // an error occurred
        else{
          console.log(data);  
          resolve(); 
        }        // successful response
      });
      })
    };
    checkSG()
    .then(()=>{deleteEC2()})
    .then(()=>{deleteSG()})
    .then((data)=>{
      console.log(data);
      this.props.onRequestClose();
    })
    .catch(function(err) {
      alert(err);
    });
  }
    else if(this.type.value === 'RDS'){
      console.log('rds');
      let params = {
        DBInstanceIdentifier: `${instanceId}`,
        SkipFinalSnapshot: true
      };
      let rds = new AWS.RDS();
      function deleteRDS(){ return new Promise((resolve, reject)=>{
        rds.deleteDBInstance(params, function(err, data) {
          if (err){
            console.log(err, err.stack);
            reject(err);
          } // an error occurred
          else{
            console.log(data); 
            resolve();
          }          // successful response
        });
        })
       }

       checkSG()
       .then(()=>{deleteRDS()})
       .then(()=>{deleteSG()})
       .then((data)=>{
          this.props.onRequestClose();
      })
       .catch(function(err) {
        alert(err);
      });
    }
    else if(this.type.value === 'S3'){
      console.log('s3');
    }
  }

  render(){
    console.log('active node: ', this.props.activeNode);
  		let displayCreate = [<form>
        <div>Create New Instances</div>
        <select id="instance" onChange={this.change} value={this.state.value}>
          <option value="select">Select Instance</option>
          <option value="EC2">EC2</option>
          <option value="RDS">RDS</option>
        </select>
        <select id="instanceType">
          <option value="">Instance Type 1</option>
          <option value="">Instance Type 2</option>
          <option value="">Instance Type 3</option>
        </select>
        <br />
        <button onClick={this.handleSubmit}>Create Instance</button>
      </form>];

  let displayDelete = [<div><h4>Selected Node:</h4>
  <select id="instance" ref={input =>(this.type = input)}>
      <option value="EC2">EC2</option>
      <option value="RDS">RDS</option>
      <option value="S3">S3</option>
  </select>
  <input ref={input => (this.source = input)} defaultValue={this.props.activeNode.InstanceId ? this.props.activeNode.InstanceId : this.props.activeNode.DBInstanceIdentifier}/>
  <button onClick={(e)=>{this.deleteInstance()}}>Delete</button>
  </div>]
return (
    <div id="InstanceModal">
        {this.props.delete ?  displayDelete : displayCreate}
    </div>
)
  }
}
export default InstanceCreator;