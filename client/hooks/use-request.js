import axios from 'axios';
import { useState } from 'react';

// Define a custom hook
// The hook makes some request (with url, method and body)
// It does some action if successful (onSuccess)
// or processes the errors
export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, { ...body, ...props });

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      setErrors(
        <div className="alert alert-danger" role="alert">
          <h4>Ooops...</h4>
          <ul className="my-0">
            {
              err.response.data.errors.map(err => <li key={ err.message }>{ err.message }</li>)
            }
          </ul>
        </div>
      );
    }
  }
  return { doRequest, errors };
};
