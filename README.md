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

### Installing

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
