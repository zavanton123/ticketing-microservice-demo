# Ticketing.dev project

### Port Forwarding for dev purposes (in K8S cluster)
### (good for simulating connection break up)
kubectl port-forward nats-depl-c576ff5c8-4mq6p 4222:4222
kubectl port-forward nats-depl-c576ff5c8-4mq6p 8222:8222

### You can monitor client state at
### http://localhost:8222/streaming

### You can check info about clients connected to some channel
### http://localhost:8222/streaming/channelsz?subs=1


### Create stripe secret key
kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=some-key-here


### How to run github actions (run tests on PR)
Create file ./.github/workflows/tests.yml
```
name: tests

on:
pull_request

jobs:
build:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v2
- run: cd auth && npm install && npm run test:ci

```
