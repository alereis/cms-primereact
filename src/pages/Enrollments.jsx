import React, { useEffect, useState, useRef } from 'react';
import supabase from "../helper/supabaseClient";
import Sidebar from '../helper/Sidebar';
import AddEnrollment from './_addEnrollment';
import EditEnrollment from './_editEnrollment';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { format } from 'date-fns';
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

function Enrollments() {
  const [sessionEnrollments, setSessionEnrollments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMode, setShowAddMode] = useState(false);
  const [showEditMode, setShowEditMode] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const dt = useRef(null);
  const [expandedRows, setExpandedRows] = useState(null);

  // Format enrollment date for display
  const enrollmentDateTemplate = (rowData) => {
    if (!rowData.enrollment_date) return 'Not entered';
    try {
      return format(new Date(rowData.enrollment_date), 'dd-MM-yyyy');
    } catch {
      return rowData.enrollment_date;
    }
  };

  // Format status for display
  const statusTemplate = (rowData) => {
    return rowData.status === 1 ? 'Active' : 'Inactive';
  };

  useEffect(() => {
    fetchData();
  }, []);

  // return all sessions with their enrollments
  const fetchData = async function fetchData() {
    try {
      setLoading(true);
      
      // First fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          name,
          price_per_session
        `);

      if (sessionsError) throw sessionsError;

      // Then fetch enrollments with student details
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          id,
          session_id,
          student_id,
          enrollment_date,
          status,
          notes,
          students (
            first_name,
            last_name
          )
        `);

      if (enrollmentsError) throw enrollmentsError;

      // Group enrollments by session
      const sessionEnrollmentsMap = sessionsData.map(session => ({
        ...session,
        enrollments: enrollmentsData.filter(e => e.session_id === session.id)
      }));

      setSessionEnrollments(sessionEnrollmentsMap);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const deleteEnrollment = async (id) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      setError('Error deleting enrollment. Please try again later.');
    }
  };

  const confirmDelete = (enrollment) => {
    confirmDialog({
      message: 'Are you sure you want to delete this enrollment?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteEnrollment(enrollment.id)
    });
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="New Enrollment"
          icon="pi pi-plus"
          severity="success"
          onClick={() => setShowAddMode(true)}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Expand All"
          icon="pi pi-plus"
          outlined
          onClick={() => setExpandedRows(sessionEnrollments)}
        />
        <Button
          label="Collapse All"
          icon="pi pi-minus"
          outlined
          onClick={() => setExpandedRows(null)}
        />
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    return <Tag value={rowData.status === 1 ? 'Active' : 'Inactive'} 
                severity={rowData.status === 1 ? 'success' : 'danger'} />;
  };

  const allowExpansion = (rowData) => {
    return rowData.enrollments?.length > 0;
  };

  const rowExpansionTemplate = (data) => {
    return (
      <div className="p-3">
        <h5>Students in {data.name}</h5>
        <DataTable value={data.enrollments}>
          <Column field="students.first_name" header="First Name" 
                 body={(rowData) => rowData.students.first_name} className="customColumn" alignHeader="center"></Column>
          <Column field="students.last_name" header="Last Name"
                 body={(rowData) => rowData.students.last_name} className="customColumn" alignHeader="center"></Column>
          <Column field="enrollment_date" header="Enrollment Date"
                 body={(rowData) => format(new Date(rowData.enrollment_date), 'dd-MM-yyyy')} className="customColumn" alignHeader="center"></Column>
          <Column field="status" header="Status" body={statusBodyTemplate} className="customColumn" alignHeader="center"></Column>
          <Column field="notes" header="Notes" className="customColumn" alignHeader="center"></Column>
          <Column body={(rowData) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                rounded
                outlined
                size="small"
                onClick={() => {
                  setSelectedEnrollment(rowData);
                  setShowEditMode(true);
                }}
              />
              <Button
                icon="pi pi-trash"
                rounded
                outlined
                severity="danger"
                size="small"
                onClick={() => confirmDelete(rowData)}
              />
            </div>
          )}></Column>
        </DataTable>
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => {
            setSelectedEnrollment(rowData);
            setShowEditMode(true);
          }}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => confirmDelete(rowData)}
        />
      </React.Fragment>
    );
  };

  return (
    <div className="layout-content">
      <Sidebar />
      <div className="enrollment-list">
          <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate} />
                    <DataTable
            ref={dt}
            value={sessionEnrollments}
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            dataKey="id"
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} sessions"
            emptyMessage="No sessions found."
            resizableColumns
            columnResizeMode="fit"
            showGridlines
          >
            <Column expander={allowExpansion} style={{ width: '3em' }} />
            <Column field="name" header="Session Name" className="customColumn" alignHeader="center"></Column>
            <Column field="price_per_session" 
                    header="Price per Session" 
                    className="customColumn" alignHeader="center"
                    body={(rowData) => rowData.price_per_session ? 
                          `$${Number(rowData.price_per_session).toFixed(2)}` : ''}></Column>
            <Column field="enrollments" 
                    header="Enrolled Students" 
                    className="customColumn" alignHeader="center"
                    body={(rowData) => rowData.enrollments?.length || 0}></Column>
          </DataTable>

          <Dialog
            visible={showAddMode}
            header="Add Enrollment"
            modal
            className="p-fluid"
            onHide={() => setShowAddMode(false)}
          >
            <AddEnrollment
              onClose={() => setShowAddMode(false)}
              onSuccess={() => {
                setShowAddMode(false);
                fetchData();
              }}
            />
          </Dialog>

          <Dialog
            visible={showEditMode}
            header="Edit Enrollment"
            modal
            className="p-fluid"
            onHide={() => setShowEditMode(false)}
          >
            <EditEnrollment
              enrollment={selectedEnrollment}
              onClose={() => setShowEditMode(false)}
              onSuccess={() => {
                setShowEditMode(false);
                fetchData();
              }}
            />
          </Dialog>

          <ConfirmDialog />
        </div>
    </div>
  );
}

export default Enrollments;
