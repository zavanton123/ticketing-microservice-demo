import 'bootstrap/dist/css/bootstrap.css';

// this wrapper is necessary if we want to add some global css to our components
export default ({Component, pageProps}) => {
  return <div>
    <h1>Header!</h1>
    <Component {...pageProps}/>
  </div>
};
