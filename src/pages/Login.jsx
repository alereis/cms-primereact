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
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Boolean variable to control form footer visibility
  const showFormFooter = false; // Set to true to enable the register link

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    setErrors({});

    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setMessage(error.message);
        setPassword("");
        return;
      }

      if (data) {
        navigate("/calendar");
        return null;
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
  };

  const renderFormFooter = () => {
    if (!showFormFooter) return null;
    
    return (
      <div className="form-footer">
        <div className="forgot-pass-link">
          <span>Don't have an account? </span>
          <Link to="/register">Create one here</Link>
        </div>
      </div>
    );
  };

  return (
    <div className="login-container">
      <div className="logo">
        <img src={logo} alt="JB Logo" className="logo" />
      </div>
      
      <h2 className="form-title">Welcome Back</h2>
      <p className="form-subtitle">Sign in to your account to continue</p>
      
      {message && (
        <div className="message error-message">
          <i className="material-symbols-rounded">error</i>
          <span>{message}</span>
        </div>
      )}
      
      <form className="login-form" onSubmit={handleSubmit}>
        <InputField
          type="email"
          placeholder="Email address"
          icon="mail"
          value={email}
          onChange={e => handleInputChange('email', e.target.value)}
          error={errors.email}
          required
        />
        
        <InputField
          type="password"
          placeholder="Password"
          icon="lock"
          value={password}
          onChange={e => handleInputChange('password', e.target.value)}
          error={errors.password}
          required
        />
        
        <button 
          className={`login-button ${isLoading ? 'loading' : ''}`} 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="material-symbols-rounded rotating">sync</i>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
      
      {renderFormFooter()}
    </div>
  )
}

export default Login;