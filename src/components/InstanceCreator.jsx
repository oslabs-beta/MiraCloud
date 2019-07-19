import React, { Component } from "react";
const AWS = require("aws-sdk");


//EC2 instance class
// const securityGroup = "Test-sg2";


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
		AWS.config.update({
			region: this.props.selectedRegion.value
			// region: "ap-northeast-2"
			// ,
			// accessKeyId:  "AKIA45ACY2ZODQXDZE2S",
			// secretAccessKey: "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"
		}); //updates arguments region, maxRetries, logger
		console.log("HERE IS CURRENT REGION=>",AWS.config.region)
	}
	
	
	handleSubmit() {
		// 		// functionality for creating rds
		//configure region
		const ec2 = new AWS.EC2();
		
		if (this.state.value === "RDS") {
			console.log("IMMMHEREEE from rds", this.state.instance);
		}
		// functionality for creating ec2
		if (this.state.value === "EC2") {
			
			function createSecurityGroup(){
				let num = 8;
				var params = {
					Description: 'Security_Group_for_Instance', /* required */
					GroupName: 'news', /* required */
					// DryRun: true || false,
					// VpcId: 'STRING_VALUE'
				};
				num= num+1;
				return new Promise((resolve, reject) => { 
					ec2.createSecurityGroup(params, function(err, data) {
						if (err) reject(err); // an error occurred
						else  resolve(data);           // successful response
					});
				});
			};
			
			// Create the instance
			function createEC2Instance(data){
				let params = {
					ImageId: 'ami-0d8f6eb4f641ef691', // us-west-1 Amazon Linux AMI 2017.03.0 (HVM), SSD Volume Type
					InstanceType: 't2.micro',
					MinCount: 1,
					MaxCount: 1,
					SecurityGroups: ["news"]
					// [data.GroupId] // We created this in lab 1
				}
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

		// function createTag(data){
		// 	var instanceId = data.Instances[0].InstanceId
		// 	// Add tags to the instance
		// 	let params = {
		// 		Resources: [instanceId], Tags: [
		// 		{
		// 			Key: 'Role',
		// 			Value: 'aws-course'
		// 		}
		// 	]};
		// 	return new Promise((resolve, reject) =>{
		// 		 ec2.createTags(params, function(err,data) {
		// 			if (err){
		// 				console.log('Tagging instance', err ? 'failure' : 'success')
		// 				reject(err)
		// 			}
		// 			else resolve(data)
		// 		 })
		// 	  }
		// 	)}

		createSecurityGroup()
		.then(data => {
			console.log("SECURITY GROUP HAS BEEN CREATED =>",data)
			createEC2Instance(data)
		})
		// .then(data => createTag(data))
		.then(data => console.log(data))
		.catch(err => console.log(err))

		event.preventDefault();
	}
// }
}; 
// stayable two strings
	deleteInstance(instanceId) {
		console.log(instanceId);
		// let params = {
		//   InstanceIds: [instanceId]
		// }
		// ec2.terminateInstances(params, function (err, data) {
		//   if (err) console.log(err, err.stack); // an error occurred
		//   else console.log(data);           // successful response
		// });
	}

	render() {
		let displayCreate = [<form>
			<div>Create New Instances</div>
			<select id="instance" onChange={this.change} value={this.state.value}>
				<option value="select">Select Instence</option>
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
				<input id='deleteInput' defaultValue={this.props.activeNode.InstanceId ? this.props.activeNode.InstanceId : this.props.activeNode.DbiResourceId} />
		</div>]
		return (
			<div id="InstanceModal">
				{this.props.delete ? displayDelete : displayCreate}
			</div>
		)
	}
}

export default InstanceCreator;

