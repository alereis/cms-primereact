import React, { useEffect, useState, useRef } from 'react';
import supabase from "../helper/supabaseClient";
import Sidebar from '../helper/Sidebar';


function Calendar() {
    return (
        <div className="layout-content">
            {/* Add sidebar */}
            <Sidebar />
            <p>IN CONSTRUCTION</p>
        </div>
    )
}

export default Calendar;