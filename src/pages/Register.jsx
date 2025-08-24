import React, { useState} from 'react'
import supabase from "../helper/supabaseClient";
import { Link } from "react-router-dom";
import logo from '../images/jb-logo.png';
import InputField from '../helper/InputField';

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const {data, error} = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) {
      setMessage("User account created. Pleasse, check your email to confirm it.");
    }

    setEmail("");
    setPassword("");
  }

  return (
    <div class="login-container">
      <div className="logo">
        <img src={logo} alt="JB Logo" className="logo" />
      </div>
      <h2 className="form-title">Register</h2>
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
        <button className="login-button" type="submit">Create Account</button>
      </form>
      <br></br>
      <div className="forgot-pass-link">
        <span>Already have an account? </span>
        <Link to="/">Log in.</Link>
      </div>
    </div>
  )
}

export default Register