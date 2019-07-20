			// AWS.config.update({region:"us-east-2"}); //updates arguments region, maxRetries, logger
function createSecurityGroup(sg){
let params = {
    Description: 'security group for my apps accessed from sdk',  // required
    GroupName: sg, //required
};
const allRegions = ['us-east-2','us-east-1','us-west-2','us-west-1','ap-south-1','ap-northeast-3','ap-northeast-2','ap-southeast-1','ap-southeast-2','ap-northeast-1','eu-west-1','eu-west-2','eu-west-3','eu-north-1','sa-east-1','ca-central-1','cn-north-1', ,'cn-northwest-1','eu-central-1']
const allKeys = [us_east_2_ec2,us_east_1_ec2,us_west_2_ec2,us_west_1_ec2,ap_south_1_ec2,ap_northeast_3_ec2,ap_northeast_2_ec2,ap_southeast_1_ec2,ap_southeast_2_ec2,ap_northeast_1_ec2,eu_west_1_ec2,eu_west_2_ec2,eu_west_3_ec2,eu_north_1_ec2,sa_east_1_ec2,ca_central_1_ec2,cn_north_1_ec2, ,cn_northwest_1_ec2,eu_central_1_ec2]

return new Promise((resolve, reject) => {
    ec2.createSecurityGroup(params, function(err, data){
        if (err){
            console.log(err,err.stack)
                reject("error from CreateSecurity" ,err);
				}
		else {
			let params={
				GroupId:data.GroupId,
				IpPermissions:[{
						IpProtocol:'tcp',
						FromPort:22,
						ToPort:22,
						IpRanges:[{
							CidrIp:'0.0.0.0/0'
						}]},{
							IpProtocol:'tcp',
							FromPort:3000,
							ToPort:3000,
							IpRanges:[{
								CidrIp:'0.0.0.0/0'
							}]
						}]
				};
				ec2.authorizeSecurityGroupIngress(params,function(err,data){
					console.log("hi from authorizeSecurityGroupIngress")
					if(err){
						console.log(err, err.stack);
						reject("error from authorizeSecurityG",err);
					} else{
						resolve(data);
					};
				});
			};
		});
	});
   };
   function createKeyPair(key){
	   return new Promise((resolve, reject) => {
		   let params = {
			KeyName: key,
		   };
		   ec2.createKeyPair(params, (err, data) => {
			   if(err) reject(err);
			   else resolve(data);
		   })
	   });
   };
   function createEC2Instance(key){
       console.log('HI FROM CREATE EC2INSTANCE')
	   return new Promise((resolve, reject) => {
		   let params ={
			   ImageId:'ami-25615740',
			   InstanceType:'t2.micro',  
			   KeyName: key, 
			   MaxCount:1,
			   MinCount:1,
			   SecurityGroups:[
				   sg
				]
			};
			ec2.runInstances(params, (err, data) => {
				if(err) reject('hi from CREATEEC2Instance =>',err)
		else resolve(data);
	  });
	});
   }
//    createSecurityGroup(securityGroup).then(()=>{
// 		return 
	createKeyPair(keyName)
	// ;})
	.then((data)=>{
		return helper.persistKeyPairToFile(data)})
	.then(()=>{
		return createEC2Instance(securityGroup,keyName);})
	.then((data)=>{
		console.log("instance created",data);})
	.catch((err)=>{
		console.log("instance creation failed =>",err);
	});
	event.preventDefault();
  }
}

				// // =================================
				// 	function createKeyPair(keyName) {
				// 		const params = {KeyName: keyName};
					
				// 		return new Promise((resolve, reject) => {
				// 			ec2.createKeyPair(params, (err, data) => {
				// 				if (err)
				// 					reject(err);
				// 				else
				// 					resolve(data)
				// 			})
				// 		})
				// 	}
					
				// 	function createInstance( keyName) {
				// 	const params = {
				// 		ImageId: 'ami-14c5486b', //AMI ID that will be used to create the instance
				// 		InstanceType: 't2.micro',
				// 		KeyName: keyName,
				// 		Name: keyName,
				// 		MaxCount: 1,
				// 		MinCount: 1,
				// 		// SecurityGroups: [
				// 		// 	sgName
				// 		// ],
				// 	};
				// 		// UserData: new Buffer(commandsString).toString('base64')
				// 		// function runInstances() {
				// 		// 	AWS.config.update({region: 'ap-northeast-2'})
						
				// 		return new Promise((resolve, reject) =>
				// 		// .then( () => {
				// 			ec2.runInstances(params, function (err, data) {
				// 				// an error occurred
				// 				if (err) reject(err)
				// 				// successful response
				// 				resolve(data)
				// 			})
				// 			// })
				// 			);
				// 		}
				// 		createKeyPair("my-key")
				// 		.then((data) => createInstance(data))
				// 		.then((data) => console.log(data))
				// 		.catch((err) => console.log('you got an error',err));
		event.preventDefault()
	// }