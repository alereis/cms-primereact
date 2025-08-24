import React, { useState} from 'react';
import { Link, useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import InputField from '../helper/InputField';
import logo from '../images/jb-logo.png';


function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const {data, error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setMessage(error.message);
      setEmail("");
      setPassword("");
      return;
    }

    if (data) {
      navigate("/dashboard");
      return null;
    }
  }

  return (
    <div className="login-container">
      <div className="logo">
        <img src={logo} alt="JB Logo" className="logo" />
      </div>
        <h2 className="form-title">Login</h2>
      <br></br>
      {message && <span>{message}</span>}
      <form className="login-form" onSubmit={handleSubmit}>
        <InputField
          type="email"
          placeholder="Email address"
          icon="mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Password"
          icon="lock"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="login-button" type="submit">Log in</button>
      </form>
      <br></br>
      <div className="forgot-pass-link">
        <span>Don't have an account? </span>
        <Link to="/register">Register.</Link>
      </div>
    </div>
  )
}

export default Login;