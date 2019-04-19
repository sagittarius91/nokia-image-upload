# Nokia-Image-Upload

This microservice lets a user to upload images in an album and then retrieve or delete them. The implementation has been done using docker and is kubernetes ready.
When an image is uploaded or deleted, an alert message is sent to MQTT as well. 

## Getting Started

These instructions will let you set-up the microservice in kubernetes

### Prerequisites

Below are the things that are required to be already set up.

```
1. Kubernetes cluster/minikube
2. docker
3. kubectl 
```

### Installation
Before you get started, provide the host ip of the machine that you are running in, in the k8s/server-node-port.yaml file's environment variable section (env)

```
env:
  - name: mongo_service
	value: "nokia-mongo.nokia.svc.cluster.local"
  - name: mongo_port
	value: "27017"
  - name: mqtt_service
	value: "nokia-mqtt.nokia.svc.cluster.local"
  - name: mongo_database
	value: "nokiadb"
  - name: mqtt_port
	value: "1883"
  - name: mqtt_topic
	value: "nokiatopic"
  - name: host
	value: "<host ip of machine>"
  - name: node_port
	value: "30446"
  - name: images_folder
	value: "/usr/src/nokia/image/challenge/"

```
Save the file


Run the challenge-setup.sh to create the full set up. Pass the kubernetes node name on which the set up will be done.

Get the kubernetes node

```
$ kubectl get nodes

NAME       STATUS    ROLES     AGE       VERSION
minikube   Ready     master    2d        v1.10.0

```

Run the set up script

```
$ sh challenge-setup.sh minikube
```

Check if the set-up is done properly

```
$ kubectl get pods -n nokia

NAME                           READY     STATUS        RESTARTS   AGE
nokia-mongo-6cf8975b7d-22ztr   0/1       Running       0          4m
nokia-mqtt-586dd7678f-km5xq    0/1       Running       0          4m
nokianode-58567bb46f-5rrf5     1/1       Running       0          4m

```

We will run the nokianode, which houses the actual server, as a Kubernetes NodePort. To check the services deployed in Kubernetes, run the below

```
$ kubectl get svc -n nokia

NAME          TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
nokia-mongo   ClusterIP   10.99.18.131     <none>        27017/TCP        9s
nokia-mqtt    ClusterIP   10.106.227.160   <none>        1883/TCP         9s
nokianode     NodePort    10.106.202.211   <none>        3000:30446/TCP   9s

```

As can be seen above, nokianode service is running on NodePort 30446


## How to use the Application

### Using provided html files
To upload an image to the nokianode server, edit html/get_image.html to add album name and image name in action tag of the form

```
<img src="http://<ip-of-host-machine>:30446/album/<albumName>/<imageName>" style="width:20%">
```

Add album name and upload the image and hit Upload Image button to upload the image.


To get an image from the album, edit html/get_image.html to add album name and image name in action tag of the form
```
<img src="http://<ip-of-host-machine>:30446/album/<albumName>/<imageName>" style="width:20%">
```
And load the html in a browser.


### Using endpoints
To delete an album

```
$ curl -XDELETE http://10.0.1.205:30446/album/<albumName>
```

To delete an image in an album

```
$ curl -XDELETE http://10.0.1.205:30446/album/<albumName>/<imageName>
```

To get all images in an album

```
$ curl -XGET http://10.0.1.205:30446/album/<albumName>
```
This will give location of every image in the album present inside server pod.(nokia-node)


### Check for notifications in MQTT
While uploading/deleting an image a notification is pushed into an MQTT topic "nokiatopic". To check for this enter the mqtt kubernetes pod. 

```
$ kubectl exec -it nokia-mqtt-586dd7678f-km5xq ash -n nokia

/ # mosquitto_sub -h localhost -t nokiatopic

```


## Swagger Documentation
To see the swagger documentation, in a browser of your choice, open the below link

```
http://<host ip of the machine>:30446/api-docs/
```

## Metrics
Prometheus was made use of to generate metrics of the application.

```
$ curl http://<host ip of the machine>:30446/metrics

# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 0.3640000000000001 1555670844869

# HELP process_cpu_system_seconds_total Total system CPU time spent in seconds.
# TYPE process_cpu_system_seconds_total counter
process_cpu_system_seconds_total 0.04400000000000001 1555670844869

# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total 0.4080000000000001 1555670844869

# HELP process_start_time_seconds Start time of the process since unix epoch in seconds.
# TYPE process_start_time_seconds gauge
process_start_time_seconds 1555670124
.
.
.
```


### Author
```
Shashank Shukla (shuklashashank203@gmail.com)
