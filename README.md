![Alt text](/src/assets/logosmall.png?raw=true)

# MiraCloud
Mira is an organizational tool for AWS' frequently used services.

<div style="margin: 0 auto; width: 720px;"><img src ="./src/assets/MiraOneRegion.gif" /></div>

## Visualize instances and security groups
Mira accesses AWS's SDK to easily display all of the user's instances in a visually appealing UI. Connections between instances through security groups is clear within Mira and will allow for an easier understanding of a user's AWS infrasture. Note: New services instances <strong>must</strong> be created in AWS and then accessed through Mira.

<div style="margin: 0 auto; width: 720px;"><img src ="./src/assets/MiraAllRegions.gif" /></div>

## Edit security groups
Editing security groups through AWS is unclear for many users that do not regularly use the AWS dashboard. With the navigatable UI provided by Mira, the user can click on a particular instance to get all data associated with it. In addition to viewing this data, inbound and outbound rules for security groups can be effortlessly changed and these changes will be immediately seen by the user. 

## Setup
1. Set up a new IAM user on your AWS console: 
Make sure you keep your aws_access_key_id and aws_secret_access_key by downloading the .csv file

2. Give permissions to AWS IAM User:
For viewing and editing: give permissions to

		AmazonEC2FullAccess
		AmazonRDSFullAccess

For viewing only: give permissions to 

		AmazonEC2ReadOnlyAccess
		AmazonRDSReadOnlyAccess


3. Set up your configurations:
We recommend installing the AWS CLI within your terminal using:
```bash
npm install -g aws-cli
```
Then use this command within your terminal:
```bash
aws configure
```
Fill in your aws_access_key_id and aws_secret_access_key

Use the default region and default data output(JSON)

## Configure security groups
<div style="margin: 0 auto; width: 720px;"><img src ="./src/assets/MiraEditSecurityGroups.png" /></div>

## Contributors
[Rachel Kim](https://github.com/rayykim) | [Victoria Adnet](https://github.com/adnetv) | [Tarlan Gardashov](https://github.com/TarlanG) | [Gilbert Ramirez](https://github.com/Gillysuit)


