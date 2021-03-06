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
    constructor() {
        this.regionState = {};
        this.sgRelationships = []; //array of arrays where each inside looks like [ [inbound sg, outbound sg] ]
        this.sgNodeCorrelations = {};
        this.edgeTable = {};
        this.ec2;

    }

    compileRDSData(data, region) {
        return new Promise((originalResolve, originalReject) => {

        AWS.config.update({
            region,
        });
        this.ec2 = new AWS.EC2({});
        const innerPromiseArray = [];

        for (let i = 0; i < data.DBInstances.length; i++) {
            let DBinstances = data.DBInstances[i];
            //destructure the data for relevant data
            let { DBSubnetGroup: { VpcId }, AvailabilityZone, DbiResourceId, VpcSecurityGroups } = DBinstances;
            // if the property doesn't exist within the object, create an object to save all the data in
            if (!this.regionState.hasOwnProperty(VpcId)) this.regionState[VpcId] = {};
            if (!this.regionState[VpcId].hasOwnProperty(AvailabilityZone)) this.regionState[VpcId][AvailabilityZone] = {};
            if (!this.regionState[VpcId][AvailabilityZone].hasOwnProperty("RDS")) this.regionState[VpcId][AvailabilityZone].RDS = {};
            //save the data into the this.regionState object
            this.regionState[VpcId].region = options[region];
            this.regionState[VpcId][AvailabilityZone].RDS[DbiResourceId] = DBinstances;

            innerPromiseArray.push(new Promise((resolve, reject) => {
                const param = {
                    GroupIds: []
                };
                for (let k = 0; k < VpcSecurityGroups.length; k++) {
                    param.GroupIds.push(VpcSecurityGroups[k].VpcSecurityGroupId);

                }
                this.ec2.describeSecurityGroups(param, (err, data) => {
                    if (err) {
                        console.log(err, err.stack);
                        reject();
                    }
                    else {

                        this.regionState[VpcId][AvailabilityZone].RDS[DbiResourceId].MySecurityGroups = data.SecurityGroups;
                        for (let h = 0; h < data.SecurityGroups.length; h++) {

                            if (!this.sgNodeCorrelations[data.SecurityGroups[h].GroupId]) this.sgNodeCorrelations[data.SecurityGroups[h].GroupId] = new Set();
                            this.sgNodeCorrelations[data.SecurityGroups[h].GroupId].add(DbiResourceId);

                            if (data.SecurityGroups[h].IpPermissions.length > 0) {
                                for (let i = 0; i < data.SecurityGroups[h].IpPermissions[0].UserIdGroupPairs.length; i++) {
                                    this.sgRelationships.push([data.SecurityGroups[h].IpPermissions[0].UserIdGroupPairs[i].GroupId, data.SecurityGroups[h].GroupId])

                                }
                            }
                        }
                        resolve();

                    }
                })
            }))
        }

        Promise.all(innerPromiseArray)
            .then(() => {
                originalResolve();
            })
            .catch(err => originalReject(err));
        });
    }

    compileEC2Data(data, region) {
        return new Promise((originalResolve, originalReject) => {
            AWS.config.update({
                region,
        });
        this.ec2 = new AWS.EC2({});
        const innerPromiseArray = [];
        for (let i = 0; i < data.Reservations.length; i++) {
            let instances = data.Reservations[i].Instances;
            for (let j = 0; j < instances.length; j++) {
                if (instances[j].State.Name !== 'terminated'){
                let { VpcId, Placement: { AvailabilityZone }, InstanceId, SecurityGroups } = instances[j];
                if (!this.regionState.hasOwnProperty(VpcId)) this.regionState[VpcId] = {};
                if (!this.regionState[VpcId].hasOwnProperty(AvailabilityZone)) this.regionState[VpcId][AvailabilityZone] = {};
                if (!this.regionState[VpcId][AvailabilityZone].hasOwnProperty("EC2")) this.regionState[VpcId][AvailabilityZone].EC2 = {};
                this.regionState[VpcId].region = options[region];
                this.regionState[VpcId][AvailabilityZone].EC2[InstanceId] = instances[j];

                //making a new promise to query for information about security group related to each EC2
                innerPromiseArray.push(new Promise((resolve, reject) => {
                    const param = {
                        GroupIds: []
                    };
                    for (let k = 0; k < SecurityGroups.length; k++) {
                        param.GroupIds.push(SecurityGroups[k].GroupId);
                    }
                    this.ec2.describeSecurityGroups(param, (err, data) => {
                        if (err) {
                            console.log(err, err.stack);
                            reject();
                        }
                        else {
                            this.regionState[VpcId][AvailabilityZone].EC2[InstanceId].MySecurityGroups = data.SecurityGroups;
                            for (let h = 0; h < data.SecurityGroups.length; h++) {

                                if (!this.sgNodeCorrelations[data.SecurityGroups[h].GroupId]) this.sgNodeCorrelations[data.SecurityGroups[h].GroupId] = new Set();
                                this.sgNodeCorrelations[data.SecurityGroups[h].GroupId].add(InstanceId);

                                if (data.SecurityGroups[h].IpPermissions.length > 0) {

                                    for (let i = 0; i < data.SecurityGroups[h].IpPermissions[0].UserIdGroupPairs.length; i++) {
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
        }

        Promise.all(innerPromiseArray)
            .then(() => {
                originalResolve();    
            })
            .catch(err => originalReject(err));
        });  
    }

    compileS3Data(currentBucketName, region, currS3DataObject){
        for (let vpc in this.regionState){
            if (this.regionState[vpc].region === options[region]){
                if(this.regionState[vpc]['S3']){
                    this.regionState[vpc]['S3'].push(currentBucketName);
                } else {
                    this.regionState[vpc]['S3'] = [];
                    this.regionState[vpc]['S3'].push(currentBucketName);
                }
                // logic for S3DataObject
                if(!this.regionState[vpc]['S3Data']) this.regionState[vpc]['S3Data'] = {};
                const S3Data = this.regionState[vpc]['S3Data'];
                S3Data[currentBucketName] = currS3DataObject;  
            }  
        }
    }

    compileLambdaData(data, region){
        return new Promise((resolve, reject) => {
           for(let key in data){
               let functionArr = data[key];
               for(let i = 0; i < functionArr.length; i++){
                   if(functionArr[i].VpcConfig){ 
                    let lambdaVpc = functionArr[i].VpcConfig.VpcId;
                    if((!this.regionState[lambdaVpc])) this.regionState[lambdaVpc] = {};
                    else if(!this.regionState[lambdaVpc]['Lambda']) this.regionState[lambdaVpc]['Lambda'] = {}
                    this.regionState[lambdaVpc]['Lambda'][functionArr[i].FunctionName] = functionArr[i];
                   }
                   else{
                     for(let VPC in this.regionState){
                         for(let az in this.regionState[VPC]){
                             let azStr = az.slice(0, az.length-1);
                             if(azStr === region){
                                 if(!this.regionState[VPC]['Lambda'])this.regionState[VPC]['Lambda'] = {};
                                 this.regionState[VPC]['Lambda'][functionArr[i].FunctionName] = functionArr[i];
                                 this.regionState[VPC]['Lambda'][functionArr[i].FunctionName].Region = region;
                             }
                         }
                     }  
                   }
               }
           }
        resolve();
        })
    }

    // createEdges() {
    //     console.log("sgnodre correlations", this.sgNodeCorrelations);
    //     console.log("sgRelationshisps ", this.sgRelationships)
    //     for (let i = 0; i < this.sgRelationships.length; i++) {
    //         this.sgNodeCorrelations[this.sgRelationships[i][0]].forEach(function (val1, val2, set) {
    //             this.sgNodeCorrelations[this.sgRelationships[i][1]].forEach(function (value1, value2, set2) {
    //                 if (!this.edgeTable.hasOwnProperty(val1)) this.edgeTable[val1] = new Set();
    //                 this.edgeTable[val1].add(value1);
    //             })
    //         })
    //     }

    //     console.log("the edge tables", this.edgeTable)
    //     return this.edgeTable;
    // }

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
       return this.edgeTable;
    }

    getRegionData() {
        return this.regionState;
    }
    getEdgesData() {
        return this.edgeTable;
    }
}

export default compileGraphData;
