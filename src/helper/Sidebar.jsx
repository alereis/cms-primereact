import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import logo from '../images/jb-logo.png';

function Sidebar() {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [user, setUser] = useState(null);

    // Monitor authentication state
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            console.log('Current user:', user);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state change:', event, session);
            if (event === 'SIGNED_OUT') {
                setUser(null);
                console.log('User signed out successfully');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Remove the useEffect entirely - no more screen size dependencies

    const handleNavigation = (path) => {
        // Always collapse sidebar after navigation for better UX
        setIsCollapsed(true);
        navigate(path);
    };

    // Calendar page
    const viewCalendar = () => {
        handleNavigation("/calendar");
    }

    // Students page
    const viewStudents = () => {
        handleNavigation("/students");
    }

    // Sessions page
    const viewSessions = () => {
        handleNavigation("/sessions");
    }

    // Enrollments page
    const viewEnrollments = () => {
        handleNavigation("/enrollments");
    }
    
    // Sign out function
    const signOut = async () => {
        try {
            console.log('Starting signout process...');
            
            // Sign out from Supabase first
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('Sign out error:', error);
                return;
            }
            
            console.log('Signout successful, navigating to login...');
            
            // Navigate to login page first
            navigate("/");
            
            // Then collapse sidebar after navigation
            setTimeout(() => {
                setIsCollapsed(true);
            }, 100);
            
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
            <div className="sidebar-container">
            {/* Toggle button positioned outside sidebar to avoid overlap */}
            <button 
                className="mobile-menu-toggle small-toggle sidebar-toggle"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label="Toggle menu"
            >
                <span className="material-symbols-rounded">
                    {isCollapsed ? 'menu' : 'close'}
                </span>
            </button>
            <div className={`layout-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
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
                                e.preventDefault();
                                viewCalendar();
                                }}>
                                <span className="material-symbols-rounded">calendar_month</span>
                                <span className="nav-label">Calendar</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" onClick={(e) => {
                                e.preventDefault();
                                viewStudents();
                                }}>
                                <span className="material-symbols-rounded">person</span>
                                <span className="nav-label">Students</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" onClick={(e) => {
                                e.preventDefault();
                                viewSessions();
                                }}>
                                <span className="material-symbols-rounded">sports_soccer</span>
                                <span className="nav-label">Sessions</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" onClick={(e) => {
                                e.preventDefault();
                                viewEnrollments();
                                }}>
                                <span className="material-symbols-rounded">app_registration</span>
                                <span className="nav-label">Enrollments</span>
                            </a>
                        </li>
                        <li className="nav-item secondary">
                            <a className="nav-link" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Signout button clicked, calling signOut function...');
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