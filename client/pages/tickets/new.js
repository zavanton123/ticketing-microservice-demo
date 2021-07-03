import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title, price
    },
    onSuccess: (ticket) => Router.push('/'),
  });

  // onBlur is called when the user selects/deselects the input field
  const onBlur = () => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }
    // round the number input to 2 digits
    setPrice(value.toFixed(2));
  };

  const onSubmit = event => {
    event.preventDefault();

    doRequest();
  }

  return <div>
    <h1>Create a Ticket</h1>
    <form onSubmit={ onSubmit }>
      <div className="form-group">
        <label>Title</label>
        <input className="form-control"
               value={ title }
               onChange={ event => setTitle(event.target.value) }
        />
      </div>

      <div className="form-group">
        <label>Price</label>
        <input className="form-control"
               value={ price }
               onBlur={ onBlur }
               onChange={ event => setPrice(event.target.value) }
        />
      </div>
      { errors }
      <button className="btn btn-primary">Submit</button>
    </form>
  </div>;
};

export default NewTicket;
