const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map(ticket => {
    return (
      <tr key={ ticket.id }>
        <td>{ ticket.title }</td>
        <td>{ ticket.price }</td>
      </tr>
    )
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
        <tr>
          <th>Title</th>
          <th>Price</th>
        </tr>
        </thead>
        <tbody>
        { ticketList }
        </tbody>
      </table>
    </div>
  )
}

// getInitialProps can either be called on the client side or the server side
LandingPage.getInitialProps = async (context, client, currentUser) => {
  // some LandingPage specific info can be fetched here...
  const { data } = await client.get('/api/tickets');
  return { tickets: data };
};

export default LandingPage;
