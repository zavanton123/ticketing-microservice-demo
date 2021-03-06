import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

// this wrapper is necessary if we want to add some global css to our components
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return <div>
    <Header currentUser={ currentUser }/>
    <div className="container">
      <Component currentUser={ currentUser } { ...pageProps }/>
    </div>
  </div>
};

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  // Manually call LandingPage's getInitialProps method
  // (because it is not called by default)
  let pageProps = {};
  // here we are checking if the component has getInitialProps defined.
  // (e.g. LandingPage has getInitialProps, but other components have none)
  if (appContext.Component.getInitialProps) {
    // call the component's getInitialProps
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
  }

  // return the AppComponent getInitialProps data
  // and component's getInitialProps data
  return {
    pageProps,
    // the same as: currentUser: data.currentUser
    ...data
  }
};

export default AppComponent;
