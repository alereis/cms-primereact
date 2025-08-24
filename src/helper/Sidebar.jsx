import React from 'react';
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import logo from '../images/jb-logo.png';

function Sidebar() {
    const navigate = useNavigate();

    // Calendar page
    const viewCalendar = async () => {
        navigate("/calendar");
    }

    // Students page
    const viewStudents = async () => {
        navigate("/students");
    }

    // Sessions page
    const viewSessions = async () => {
        navigate("/sessions");
    }

    // Sessions page
    const viewEnrollments = async () => {
        navigate("/enrollments");
    }
    
    // Sign out function
    const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
        navigate("/");
    };

    return (
        <div>
            <div className="layout-sidebar">
                <div className="layout-sidebar-logo">
                    <a className="header-logo">
                        <img src={logo} alt="JB Logo" className="logo" />
                    </a>
                </div>
                {/* Navigation menu */}
                <div className="layout-sidebar-menu">
                    <ul className="layout-sidebar-menu-list">
                        <li className="nav-item">
                            <a className="nav-link" onClick={(e) => {
                                e.preventDefault;
                                viewCalendar();
                                }}>
                                <span className="material-symbols-rounded">calendar_month</span>
                                <span className="nav-label">Calendar</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" onClick={(e) => {
                                e.preventDefault;
                                viewStudents();
                                }}>
                                <span className="material-symbols-rounded">person</span>
                                <span className="nav-label">Students</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" onClick={(e) => {
                                e.preventDefault;
                                viewSessions();
                                }}>
                                <span className="material-symbols-rounded">sports_soccer</span>
                                <span className="nav-label">Sessions</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" onClick={(e) => {
                                e.preventDefault;
                                viewEnrollments();
                                }}>
                                <span className="material-symbols-rounded">app_registration</span>
                                <span className="nav-label">Enrollments</span>
                            </a>
                        </li>
                        <li className="nav-item secondary">
                            <a className="nav-link" onClick={(e) => {
                                e.preventDefault;
                                signOut();
                                }}>
                                <span className="material-symbols-rounded">logout</span>
                                <span className="nav-label">Sign out</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Sidebar;