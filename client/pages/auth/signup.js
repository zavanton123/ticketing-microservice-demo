export default () => {
  return (
    <form>
      <h1>Sign Up</h1>
      <dev className="form-group">
        <label>Email Address</label>
        <input className="form-control"/>
      </dev>
      <dev className="form-group">
        <label>Password</label>
        <input type="password" className="form-control"/>
      </dev>
      <button className="btn btn-primary">Sign Up</button>
    </form>
  )
}