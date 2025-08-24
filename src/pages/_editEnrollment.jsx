import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import supabase from '../helper/supabaseClient';

function EditEnrollment({ enrollment, onClose, onSuccess }) {
  const [sessionId, setSessionId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState(null);
  const [status, setStatus] = useState(1);
  const [notes, setNotes] = useState('');
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (enrollment) {
      setSessionId(enrollment.session_id);
      setStudentId(enrollment.student_id);
      setEnrollmentDate(new Date(enrollment.enrollment_date));
      setStatus(enrollment.status);
      setNotes(enrollment.notes || '');
    }
  }, [enrollment]);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (enrollment?.student_id) {
      fetchStudentDetails();
    }
  }, [enrollment]);

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

  const fetchStudentDetails = async () => {
    try {
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', enrollment.student_id)
        .single();

      if (error) throw error;

      setStudents([{
        label: `${student.first_name} ${student.last_name}`,
        value: student.id
      }]);
    } catch (error) {
      console.error('Error fetching student details:', error);
      setError('Error fetching student details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!enrollmentDate) {
      setError('Please fill in the enrollment date');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('enrollments')
        .update({
          session_id: sessionId,
          student_id: studentId,
          enrollment_date: enrollmentDate.toISOString().split('T')[0],
          status,
          notes
        })
        .eq('id', enrollment.id);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error updating enrollment:', error);
      setError('Error updating enrollment. Please try again.');
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
          <label htmlFor="student">Student</label>
          <Dropdown
            id="student"
            value={studentId}
            options={students}
            disabled={true}
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

export default EditEnrollment;
