# Ticketing.dev project

### Port Forwarding for dev purposes (in K8S cluster)
### (good for simulating connection break up)
kubectl port-forward nats-depl-c576ff5c8-4mq6p 4222:4222
kubectl port-forward nats-depl-c576ff5c8-4mq6p 8222:8222

### You can monitor client state at
### http://localhost:8222/streaming

### You can check info about clients connected to some channel
### http://localhost:8222/streaming/channelsz?subs=1