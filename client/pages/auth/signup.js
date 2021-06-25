import {useState} from 'react'
import axios from 'axios';


export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/users/signup', {email, password})
      console.log(`zavanton - data`);
      console.log(response.data);
    } catch (err) {
      console.log(`zavanton - error while signing up`);
      console.log(err);
      setErrors(err.response.data.errors);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>
      <dev className="form-group">
        <label>Email Address</label>
        <input value={email} onChange={e => setEmail(e.target.value)} className="form-control"/>
      </dev>
      <dev className="form-group">
        <label>Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="form-control"/>
      </dev>
      {errors.length > 0 && (<dev className="alert alert-danger">
          <h4>Ooops...</h4>
          <ul className="my-0">
            {errors.map(err => <li key={err.message}>err.message</li>)}
          </ul>
        </dev>
      )}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  )
}