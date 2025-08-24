import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { InputTextarea } from 'primereact/inputtextarea';
import supabase from '../helper/supabaseClient';

function AddEnrollment({ onClose, onSuccess }) {
  const [sessionId, setSessionId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [enrollmentDate, setEnrollmentDate] = useState(null);
  const [status, setStatus] = useState(1);
  const [notes, setNotes] = useState('');
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  // When session changes, fetch available students
  useEffect(() => {
    if (sessionId) {
      fetchAvailableStudents();
    } else {
      setStudents([]);
      setSelectedStudents([]);
    }
  }, [sessionId]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase.from('sessions').select('*');
      if (error) throw error;
      setSessions(data.map(session => ({
        label: session.name,
        value: session.id
      })));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Error fetching sessions');
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      // First get all enrolled student IDs for this session
      const { data: enrolledData, error: enrolledError } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('session_id', sessionId);

      if (enrolledError) throw enrolledError;

      const enrolledStudentIds = enrolledData.map(e => e.student_id);

      // Then get all students not in the enrolled list
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .not('id', 'in', `(${enrolledStudentIds.join(',')})`)
        .order('first_name');

      if (studentsError) throw studentsError;

      setStudents(studentsData.map(student => ({
        label: `${student.first_name} ${student.last_name}`,
        value: student.id
      })));

      // Clear selected students when session changes
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error fetching available students:', error);
      setError('Error fetching available students');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionId || selectedStudents.length === 0 || !enrollmentDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Create enrollment records for each selected student
      const enrollments = selectedStudents.map(studentId => ({
        session_id: sessionId,
        student_id: studentId,
        enrollment_date: enrollmentDate.toISOString().split('T')[0],
        status,
        notes
      }));

      const { error } = await supabase.from('enrollments').insert(enrollments);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error adding enrollment:', error);
      setError('Error adding enrollment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 }
  ];

  return (
    <div className="card p-4">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="session">Session</label>
          <Dropdown
            id="session"
            value={sessionId}
            options={sessions}
            onChange={(e) => setSessionId(e.value)}
            placeholder="Select a Session"
            className="w-full"
          />
        </div>

        <div className="field">
          <label htmlFor="students">Students</label>
          <MultiSelect
            id="students"
            value={selectedStudents}
            options={students}
            onChange={(e) => setSelectedStudents(e.value)}
            placeholder="Select Students"
            filter
            maxSelectedLabels={3}
            className="w-full"
          />
        </div>

        <div className="field">
          <label htmlFor="enrollmentDate">Enrollment Date</label>
          <Calendar
            id="enrollmentDate"
            value={enrollmentDate}
            onChange={(e) => setEnrollmentDate(e.value)}
            dateFormat="dd/mm/yy"
            className="w-full"
          />
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={statusOptions}
            onChange={(e) => setStatus(e.value)}
            placeholder="Select Status"
            className="w-full"
          />
        </div>

        <div className="field">
          <label htmlFor="notes">Notes</label>
          <InputTextarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full"
          />
        </div>

        {error && <div className="p-error mb-2">{error}</div>}

        <div className="flex justify-content-end">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text mr-2"
            onClick={onClose}
          />
          <Button
            label="Save"
            icon="pi pi-check"
            loading={loading}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}

export default AddEnrollment;
