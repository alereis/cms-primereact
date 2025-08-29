import React, { useState} from 'react'
import supabase from "../helper/supabaseClient";
import { Link } from "react-router-dom";
import logo from '../images/jb-logo.png';
import InputField from '../helper/InputField';

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const {data, error} = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data) {
        setMessage("Account created successfully! Please check your email to confirm your account.");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
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
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  return (
    <div className="login-container">
      <div className="logo">
        <img src={logo} alt="JB Logo" className="logo" />
      </div>
      
      <h2 className="form-title">Create Account</h2>
      <p className="form-subtitle">Join us and start managing your data</p>
      
      {message && (
        <div className={`message ${message.includes('successfully') ? 'success-message' : 'error-message'}`}>
          <i className="material-symbols-rounded">
            {message.includes('successfully') ? 'check_circle' : 'error'}
          </i>
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
        
        <InputField
          type="password"
          placeholder="Confirm Password"
          icon="lock"
          value={confirmPassword}
          onChange={e => handleInputChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
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
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
      
      <div className="form-footer">
        <div className="forgot-pass-link">
          <span>Already have an account? </span>
          <Link to="/">Sign in here</Link>
        </div>
      </div>
    </div>
  )
}

export default Register