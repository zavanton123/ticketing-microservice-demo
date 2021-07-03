const LandingPage = ({ currentUser }) => {
  return currentUser ?
    <h1>You are signed in</h1>
    :
    <h1>You are NOT signed in</h1>
}

// getInitialProps can either be called on the client side or the server side
LandingPage.getInitialProps = async (context, client, currentUser) => {
  // some LandingPage specific info can be fetched here...
  return {};
};

export default LandingPage;
