import axios from 'axios';

// Note:
// That is how we reach the ingress service
// from inside the client pod
// note: the client pod is in the 'default' namespace
// The 'ingress-nginx-controller' service is in the 'ingress-nginx' namespace
// http://ingress-nginx-controller.ingress-nginx.svc.cluster.local

// we are creating a custom version of 'axios' client
// it will be using the correct base url
// depending on where it is being used
// (i.e. on the client side or the server side)
export default ({ req }) => {
  if (typeof window === 'undefined') {
    // we are on the server
    // Here are trying to send requests from inside the server node
    // to the ingress-nginx, so we need these steps

    // Note: we get the 'ingress-nginx' by running:
    // kubectl get namespaces

    // Note: we get the 'ingress-nginx-controller' by running:
    // kubectl get services -n ingress-nginx

    // Note: svc.cluster.local is just a postfix
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',

      // Note: we need to pass the headers, because they contain the JWT cookie
      // which makes it possible for us to know if the user is logged in
      headers: req.headers
    });
  } else {
    // we are on the client
    // (just use the empty base url as always)
    // (i.e. the request from the client go directly to ingress-nginx
    // without any additional help)
    return axios.create({
      baseURL: '/'
    })
  }
};
