
import React, { useEffect, useState } from 'react';
import supabase from "../helper/supabaseClient";
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from "primereact/button";
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { FloatLabel } from 'primereact/floatlabel';
import { format } from 'date-fns';
import { Message } from 'primereact/message';


function AddStudent(props) {
    const [errorMessage, setErrorMessage] = useState("");
    const initialStudentInfo = {
        first_name: '',
        last_name: '',
        date_of_birth: '',
        medical_notes: '',
        parent_first_name: '',
        parent_last_name: '',
        parent_phone_number: '',
        parent_email: '',
    }
    const [studentInfo, setStudentInfo] = useState(initialStudentInfo);
    const [newStudent, setNewStudent] = useState("");

    useEffect(() => {
    }, []);

    const addNewStudent = async()=> {
        // Validate required fields
        if (!studentInfo.first_name) {
            setErrorMessage("Please fill in all required fields: Student's First Name");
            return;
        }
         if (!studentInfo.parent_first_name) {
            setErrorMessage("Please fill in all required fields: Parent's First Name");
            return;
        }
         if (!studentInfo.parent_phone_number) {
            setErrorMessage("Please fill in all required fields: Parent's Phone Number");
            return;
        }
        setErrorMessage(""); // Clear any previous error message

        // Format the date to yyyy-mm-dd for database storage
        let formattedDOB = null;
        if (studentInfo.date_of_birth) {
            formattedDOB = format(new Date(studentInfo.date_of_birth), 'yyyy-MM-dd');
        }

        const newStudentData = {
            first_name: studentInfo.first_name,
            last_name: studentInfo.last_name,
            date_of_birth: formattedDOB,
            medical_notes: studentInfo.medical_notes,
            parent_first_name: studentInfo.parent_first_name,
            parent_last_name: studentInfo.parent_last_name,
            parent_phone_number: studentInfo.parent_phone_number,
            parent_email: studentInfo.parent_email,
        };

        const { data, error } = await supabase
        .from("students")
        .insert([newStudentData])
        .single();

        if (error) {
            console.log("Error adding new student: ", error);
        } else {
            setStudentInfo(initialStudentInfo); // Reset form after successful add
            setNewStudent("");
            if (props.setStudentAdded) props.setStudentAdded();
        }
    }; 

    return (
        <div className='user-view _add-view'>
            <h1>Student Information</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>First Name:</span>
                            <InputText id="in" value={studentInfo.first_name} onChange={e=>setStudentInfo({...studentInfo,first_name:e.target.value})} required style={{ width: '300px' }}/>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Last Name:</span>
                            <InputText id="in" value={studentInfo.last_name} onChange={e=>setStudentInfo({...studentInfo,last_name:e.target.value})} style={{ width: '300px' }}/>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Date of Birth:</span>
                            <FloatLabel>
                                <Calendar 
                                    value={studentInfo.date_of_birth ? new Date(studentInfo.date_of_birth) : null}
                                    onChange={(e) => setStudentInfo({...studentInfo, date_of_birth: e.value})}
                                    dateFormat="dd-mm-yy"
                                    inputStyle={{ width: '200px' }}
                                    inputId="date_of_birth"
                                />
                                <label htmlFor="date_of_birth">dd-mm-yyyy</label>
                            </FloatLabel>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Medical Notes:</span>
                            <InputTextarea rows={5} cols={80}
                                className='form-control'
                                value={studentInfo.medical_notes}
                                onChange={e=>setStudentInfo({...studentInfo,medical_notes:e.target.value})}
                            />
                        </p>
                    </div>

                </div>
            </div>

            <h1>Parent Information</h1>
            <div className='box'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>First Name:</span>
                            <InputText id="in" value={studentInfo.parent_first_name} onChange={e=>setStudentInfo({...studentInfo,parent_first_name:e.target.value})} required style={{ width: '300px' }}/>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Last Name:</span>
                            <InputText id="in" value={studentInfo.parent_last_name} onChange={e=>setStudentInfo({...studentInfo,parent_last_name:e.target.value})} style={{ width: '300px' }}/>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Parent Phone:</span>
                            <InputText id="in" value={studentInfo.parent_phone_number} onChange={e=>setStudentInfo({...studentInfo,parent_phone_number:e.target.value})} required style={{ width: '300px' }}/>
                        </p>
                    </div>
                    <div className='col-sm-12 col-md-6'>
                        <p>
                            <span>Parent Email:</span>
                            <InputText id="in" value={studentInfo.parent_email} onChange={e=>setStudentInfo({...studentInfo,parent_email:e.target.value})} style={{ width: '300px' }}/>
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
                onClick={()=>addNewStudent()}
                label="Add New Student"
                />
            </div>
            
        </div>
    )
}

export default AddStudent;