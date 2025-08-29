import React, { useState } from 'react';
import supabase from "../helper/supabaseClient";
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from "primereact/button";
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { FloatLabel } from 'primereact/floatlabel';

import { format } from 'date-fns';

function AddSession({ setSessionAdded }) {
    const [errorMessage, setErrorMessage] = useState("");
    const initialSessionInfo = {
        name: '',
        day_of_week: null,
        start_date: null,
        end_date: null,
        start_time: null,
        end_time: null,
        location: '',
        notes: '',
        price_per_session: ''
    }
    const [sessionInfo, setSessionInfo] = useState(initialSessionInfo);

    const dayOfWeekOptions = [
        { label: 'Sunday', value: 0 },
        { label: 'Monday', value: 1 },
        { label: 'Tuesday', value: 2 },
        { label: 'Wednesday', value: 3 },
        { label: 'Thursday', value: 4 },
        { label: 'Friday', value: 5 },
        { label: 'Saturday', value: 6 }
    ];

    const addNewSession = async () => {
        // Validate required fields
        if (!sessionInfo.name) {
            setErrorMessage("Please fill in the Session Name");
            return;
        }
        if (sessionInfo.day_of_week === null) {
            setErrorMessage("Please select the Day of Week");
            return;
        }
        if (!sessionInfo.start_date) {
            setErrorMessage("Please select the Start Date");
            return;
        }
        if (!sessionInfo.start_time || !sessionInfo.end_time) {
            setErrorMessage("Please select both Start and End Time");
            return;
        }
        setErrorMessage(""); // Clear any previous error message

        // Format dates for database storage
        const formattedStartDate = format(sessionInfo.start_date, 'yyyy-MM-dd');
        const formattedEndDate = sessionInfo.end_date ? format(sessionInfo.end_date, 'yyyy-MM-dd') : null;
        
        // Format times (assuming the time from Calendar component needs to be formatted)
        const formatTime = (date) => {
            if (!date) return null;
            return format(date, 'HH:mm:ss');
        };

        const newSessionData = {
            name: sessionInfo.name,
            day_of_week: sessionInfo.day_of_week,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            start_time: formatTime(sessionInfo.start_time),
            end_time: formatTime(sessionInfo.end_time),
            location: sessionInfo.location,
            price_per_session: sessionInfo.price_per_session,
            notes: sessionInfo.notes
        };

        const { error } = await supabase
            .from("sessions")
            .insert([newSessionData])
            .single();

        if (error) {
            console.log("Error adding new session: ", error);
            setErrorMessage("Error adding session. Please try again.");
        } else {
            setSessionInfo(initialSessionInfo);
            if (setSessionAdded) setSessionAdded();
        }
    }; 

    return (
        <div className='user-view _add-view'>
            <h1>Session Information</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Session Name:</span>
                            <InputText 
                                value={sessionInfo.name} 
                                onChange={e => setSessionInfo({...sessionInfo, name: e.target.value})} 
                                required 
                            />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Day of Week:</span>
                            <Dropdown 
                                value={sessionInfo.day_of_week}
                                options={dayOfWeekOptions}
                                onChange={e => setSessionInfo({...sessionInfo, day_of_week: e.value})}
                                placeholder="Select a Day"
                            />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Start Date:</span>
                            <FloatLabel>
                                <Calendar 
                                    value={sessionInfo.start_date ? new Date(sessionInfo.start_date) : null}
                                    onChange={(e) => setSessionInfo({...sessionInfo, start_date: e.value})}
                                    dateFormat="dd-mm-yy"
                                    inputId="start_date"
                                />
                                <label htmlFor="start_date">dd-mm-yyyy</label>
                            </FloatLabel>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>End Date:</span>
                            <FloatLabel>
                                <Calendar 
                                    value={sessionInfo.end_date ? new Date(sessionInfo.end_date) : null}
                                    onChange={(e) => setSessionInfo({...sessionInfo, end_date: e.value})}
                                    dateFormat="dd-mm-yy"
                                    inputId="end_date"
                                />
                                <label htmlFor="end_date">dd-mm-yyyy</label>
                            </FloatLabel>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Start Time:</span>
                            <FloatLabel>
                                <Calendar 
                                    value={sessionInfo.start_time}
                                    onChange={e => setSessionInfo({...sessionInfo, start_time: e.value})}
                                    timeOnly
                                    hourFormat="24"
                                    inputId="start_time"
                                />
                                <label htmlFor="start_time">hh:mm</label>
                            </FloatLabel>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>End Time:</span>
                            <FloatLabel>
                                <Calendar 
                                    value={sessionInfo.end_time}
                                    onChange={e => setSessionInfo({...sessionInfo, end_time: e.value})}
                                    timeOnly
                                    hourFormat="24"
                                    inputId="end_time"
                                />
                                <label htmlFor="end_time">hh:mm</label>
                            </FloatLabel>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Location:</span>
                            <InputText 
                                value={sessionInfo.location} 
                                onChange={e => setSessionInfo({...sessionInfo, location: e.target.value})}
                            />
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Price per Session ($):</span>
                            <InputText 
                                value={sessionInfo.price_per_session} 
                                onChange={e => {
                                    const value = e.target.value;
                                    // Only allow numbers and decimal point
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        setSessionInfo({...sessionInfo, price_per_session: value})
                                    }
                                }}

                            />
                        </p>
                    </div>
                    <div className='col-sm-12'>
                        <p>
                            <span>Notes:</span>
                            <InputTextarea 
                                rows={5} 
                                value={sessionInfo.notes}
                                onChange={e => setSessionInfo({...sessionInfo, notes: e.target.value})}

                            />
                        </p>
                    </div>
                </div>
            </div>
            {errorMessage && (
                <div className="text-center mb-3">
                    <Message severity="error" text={errorMessage} />
                </div>
            )}
            <div className="text-center">
                <Button
                    onClick={addNewSession}
                    label="Add New Session"
                />
            </div>
        </div>
    )
}

export default AddSession;
