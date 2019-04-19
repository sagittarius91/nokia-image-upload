#!/bin/bash

#################################################################
###### Created by Shashank Shukla on 18th April 2019. ######
###### This script assumes that                       ######
###### 1. kubernetes cluster is already installed on  ######
###### the machine.                                   ######
###### 2. node is present                             ######
###### 3. docker is installed                         ######
###### 4. kubectl commmand exists                     ######
#################################################################



# Building Docker Image of the server
dockerBuild(){
	echo "Building nokia/node-app docker"
	docker build -t nokia/node-app .
	if [ $? -eq 0 ]; then
		echo "Docker image of nokia/node-app successfully built"
	else 
		echo "Unable to create the nokia/node-app image"
		exit 1
	fi
}

#Creating a namespace in k8s
createNameSpace(){
	echo "Creating namespace 'nokia' in k8s"
	kubectl create -f namespace/namespace.yaml
	if [ $? -eq 0 ]; then
		echo "Namespace 'nokia' successfully created"
	else 
		echo "Unable to create the 'nokia' namespace"
		exit 1
	fi
}


labelK8sNode(){
	echo "Labeling the k8s node $1"
	kubectl label nodes $1 name=masternode
}


#Deploying the YAMLs of the nokia challenge
deployingYamlInK8s(){
	echo "Deploying YAMLs for the challenge"
	kubectl create -f k8s/
	if [ $? -eq 0 ]; then
		echo "All done, good to go"
	else 
		echo "Unable to create the set-up for the nokia challenge"
		exit 1
	fi
}


dockerBuildMQTT(){
	echo "Building the docker for MQTT"
	cd mqtt
	docker build -t mqtt-nokia .
	if [ $? -eq 0 ]; then
                echo "Built the MQTT docker"
		cd ..
        else
                echo "Unable to build the MQTT docker"
                exit 1
        fi
}


main(){
	echo "Starting up the nokia challenge"
	dockerBuild
	dockerBuildMQTT
	createNameSpace
	#labelK8sNode $1
	deployingYamlInK8s
	echo "Please read the README.md for further details on how to use the challenge set-up"
}

help(){
	echo "Usage: sh +x challenge-setup.sh <k8s node name to label>"
}

#Check for correct arguments
if [ $# -lt 1 ];
then
  help
  exit 1
fi

node_name=$1
main ${node_name}
