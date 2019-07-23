import React, { Component } from "react";
const AWS = require("aws-sdk");

const imageId = { 
		"us-east-2": "ami-0d8f6eb4f641ef691",
		"us-east-1": "ami-0b898040803850657",
		"us-west-1": "ami-056ee704806822732",
		"us-west-2":"ami-082b5a644766e0e6f",
		"ap-south-1": "ami-0d2692b6acea72ee6",
		"ap-northeast-2": "ami-095ca789e0549777d",
		"ap-southeast-1": "ami-01f7527546b557442",
		"ap-southeast-2": "ami-0dc96254d5535925f",
		"ap-northeast-1": "ami-0c3fd0f5d33134a76",
		"eu-west-1": "ami-0bbc25e23a7640b9b",
		"eu-west-2": "ami-0d8e27447ec2c8410",
		"eu-west-3": "ami-0adcddd3324248c4c",
		"eu-north-1": "ami-3f36be41",
		"sa-east-1": "ami-058943e7d9b9cabfb",
		"ca-central-1": "ami-0d4ae09ec9361d8ac",
		"ap-east-1": "ami-570c7726",
		"eu-central-1": "ami-0cc293023f983ed53"
		// ,'cn-north-1':
		// ,'ap-northeast-3':
	};
const inAllRegions = { 
		"ami-0d8f6eb4f641ef691": "us-east-2",
		"ami-0b898040803850657": "us-east-1",
		"ami-056ee704806822732": "us-west-1",
		"ami-082b5a644766e0e6f": "us-west-2",
		"ami-0d2692b6acea72ee6": "ap-south-1",
		"ami-095ca789e0549777d": "ap-northeast-2",
		"ami-01f7527546b557442": "ap-southeast-1",
		"ami-0dc96254d5535925f": "ap-southeast-2",
		"ami-0c3fd0f5d33134a76": "ap-northeast-1",
		"ami-0bbc25e23a7640b9b": "eu-west-1",
		"ami-0d8e27447ec2c8410": "eu-west-2",
		"ami-0adcddd3324248c4c": "eu-west-3",
		"ami-3f36be41": "eu-north-1",
		"ami-058943e7d9b9cabfb": "sa-east-1",
		"ami-0d4ae09ec9361d8ac": "ca-central-1",
		"ami-570c7726":"ap-east-1",
		"ami-0cc293023f983ed53": "eu-central-1"
		// ,'cn-north-1':
		// ,'ap-northeast-3':
	};

class InstanceCreator extends Component {
	constructor(props) {
		super(props);
		// AWS.config.update({ region: this.props.selectedRegion.value }); //updates arguments region, maxRetries, logger
		this.state = {
			value: "value",
			sg: "mira-" + String( Math.floor(Math.random() * 2000)),
			inputRegion: null
		};
		this.changeRegion = this.changeRegion.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.deleteInstance = this.deleteInstance.bind(this);
		this.change = this.change.bind(this);
	};
	
	
	changeRegion(event){
		this.setState({inputRegion: event.target.value})
	};
	
	change(event) {
		this.setState({ value: event.target.value });	
	}
	handleSubmit() {
		if (this.props.selectedRegion.value === "all" || this.state.inputRegion !== null) AWS.config.update({region: inAllRegions[this.state.inputRegion]})
		else AWS.config.update({ region: this.props.selectedRegion.value }); //updates arguments region, maxRetries, logger
		const ec2 = new AWS.EC2();
		const rds = new AWS.RDS();
		let sg = this.state.sg;
		if (this.state.value === "S3") {
			// console.log("IMMMHEREEE from rds", this.state.instance);
			const params = {
				DBInstanceClass: 'db.t2.micro', /* required */
				DBInstanceIdentifier: 'mydbinstance', /* required */
				Engine: 'postgres', /* required */
			}
			function createDBInstance(){
				return new Promise((resolve, reject) => {
					rds.createDBInstance(params, function(err, data) {
						if (err) reject(err); // an error occurred
						else  resolve(data);           // successful response
					});
				}) 
			};
			createDBInstance()
			.then(data => console.log('DB instance created =>',data))
			.catch(err => console.log('you got error =>', err))
			
			event.preventDefault();
			
		};

		// functionality for creating ec2
		if (this.state.value === "EC2") {
			function createSecurityGroup(sg){
				const params = {
					Description: 'Security_Group_for_Instance', /* required */
					GroupName: sg, /* required */
				};
				return new Promise((resolve, reject) => { 
					ec2.createSecurityGroup(params, function(err, data) {
						if (err) reject('Could not create instance',err); // an error occurred
						else  resolve(data);           // successful response
					});
				});
			};

			// Create the instance
			let params = {
				ImageId: imageId[AWS.config.region], // us-west-1 Amazon Linux AMI 2017.03.0 (HVM), SSD Volume Type
				InstanceType: 't2.micro',
				MinCount: 1,
				MaxCount: 1,
				SecurityGroups: [sg]
			}
			if ( this.state.inputRegion !== null) params["ImageId"] = this.state.inputRegion; 

			function createEC2Instance(){
				return new Promise((resolve,reject) => { 
					ec2.runInstances(params, function(err, data) {
						if (err) {
							console.log('Could not create instance', err)
							reject(err);	
						}
						else resolve(data)
					})
				})
			};
			createSecurityGroup(sg)
			.then(() => { createEC2Instance()})
			.then(() => alert(`EC2 instance successfully launched at ${AWS.config.region}.Please refresh page.`))
			.then(() => this.props.onRequestClose())
			.catch(err => alert(err))
			
			event.preventDefault();
		}
		this.setState({sg: String( Math.floor(Math.random() * 2000))})
	}; 
	// stayable two strings
  deleteInstance() {
    let instanceId = this.source.value;
    let activeNode = this.props.activeNode;
    // console.log('instanceid', `${instanceId}`);
    // console.log(this.type.value);
    function checkSG(){return new Promise((resolve, reject)=>{
        let forceErr = false;
        if(activeNode.MySecurityGroups){
          for(let i = 0; i < Object.keys(activeNode.MySecurityGroups).length; i++){
            if(activeNode.MySecurityGroups[i].IpPermissions.length > 0 || activeNode.MySecurityGroups[i].IpPermissionsEgress.length > 1){
              forceErr = true;
            }
          }
        }
        if(forceErr) reject('Delete security group rules first');
        else resolve();
      })
    }
    function deleteSG(regionStr, securityGroupId){ return new Promise((resolve, reject)=>{	
      let ec2 = new AWS.EC2({region:regionStr});
      let paramsSG = {
       GroupId: `${securityGroupId}`
      }
      ec2.deleteSecurityGroup(paramsSG, function(err, data) {
        if (err){
          reject({'error message': err}); 
        } // an error occurred
        else resolve(data);          // successful response
      });
     })
    }

   if(this.type.value === 'EC2'){
	let nodeRegion = this.props.activeNode.Placement.AvailabilityZone;
	let regionArr = nodeRegion.split('');
	regionArr.pop();
	let regionStr = regionArr.join('');
      // console.log('ec2')
    let params = {
      InstanceIds: [`${instanceId}`],
    }
    let ec2 = new AWS.EC2({region:regionStr});

    function deleteEC2(){return new Promise((resolve,reject)=>{
      ec2.terminateInstances(params, function (err, data) {
        if (err){
          reject({'error message': err});
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
    .then(()=>{deleteSG(regionStr, activeNode.SecurityGroups[0].GroupId)})
    .then((data)=>{
      console.log(data);
      this.props.onRequestClose();
    })
    .catch(function(err){
      alert(err);
    });
  }
    else if(this.type.value === 'RDS'){
	let nodeRegion = this.props.activeNode.AvailabilityZone;
	let regionArr = nodeRegion.split('');
	regionArr.pop();
	let regionStr = regionArr.join('');
    console.log('rds');
      let params = {
        DBInstanceIdentifier: `${instanceId}`,
        SkipFinalSnapshot: true
      };
      let rds = new AWS.RDS({region:regionStr});
      function deleteRDS(){ return new Promise((resolve, reject)=>{
        rds.deleteDBInstance(params, function(err, data) {
          if (err){
            console.log(err, err.stack);
            reject({'error message': err});
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
       .then(()=>{deleteSG(regionStr, activeNode.VpcSecurityGroups[0].VpcSecurityGroupId)})
       .then((data)=>{
          this.props.onRequestClose();
      })
       .catch(function(err) {
		   console.log('error here:', err);
        alert(err);
      });
    }
    else if(this.type.value === 'S3'){
      console.log('s3');
    }
  }


  render(){
    console.log('this active node HERE:',this.props.activeNode);
	  let imgOptions = [];
	  for(let key in inAllRegions){
		  imgOptions.push(<option value={key}>{inAllRegions[key]}</option>)
	  }
    // console.log('active node: ', this.props.activeNode);
  	let displayCreate = [<form>
        <div>Create New Instances</div>
        <select id="instance" onChange={this.change} value={this.state.value}>
          <option value="select">Select Instance</option>
          <option value="EC2">EC2</option>
        </select>
		<p>Region Image Id:</p>
		<select id='select-img' defaultValue={imageId[AWS.config.region]} onChange={e => this.changeRegion(e)}>
			{imgOptions}
		</select>
		<br />
		<p>Key Pair Name:</p>
		<input type="text" ref={input => (this.keyPair = input)}/>
		<br />
        <button onClick={()=>this.handleSubmit()}>Create Instance</button>
	  </form>];
	  
  let displayDelete = [<div><h4>Selected Node:</h4>
  <select id="instance" ref={input =>(this.type = input)}>
      <option value="EC2">EC2</option>
      <option value="RDS">RDS</option>
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