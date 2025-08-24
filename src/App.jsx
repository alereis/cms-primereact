import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Students from "./pages/Students";
import Sessions from "./pages/Sessions";
import Enrollments from "./pages/Enrollments";
import Dashboard from "./pages/Dashboard";
import Wrapper from "./pages/Wrapper";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Login />} />
        {/* Register */}
        <Route path="/register" element={<Register />} />
        {/* Students */}
        <Route path="/students" element={<Students />} />
        {/* Sessions */}
        <Route path="/sessions" element={<Sessions />} />
        {/* Enrollments */}
        <Route path="/enrollments" element={<Enrollments />} />
        {/* Dashboard */}
        <Route path="/dashboard" element={
          <Wrapper>
            <Dashboard />
          </Wrapper>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
