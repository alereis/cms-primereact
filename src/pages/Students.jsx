import React, { useEffect, useState, useRef } from 'react';
import supabase from "../helper/supabaseClient";
import Sidebar from '../helper/Sidebar';
import AddStudent from './_addStudent';
import EditStudent from './_editStudent';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { format } from 'date-fns';
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

function Students() {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMode, setShowAddMode] = useState(false);
  const [showEditMode, setShowEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const dt = useRef(null);
  const [selectedStudents, setSelectedStudents] = useState(null);

  // Format date_of_birth for display
  const dateOfBirthTemplate = (rowData) => {
    if (!rowData.date_of_birth) return 'Not entered';
    try {
      // Try to format as date string
      return format(new Date(rowData.date_of_birth), 'dd-MM-yyyy');
    } catch {
      return rowData.date_of_birth;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // return all students
  const fetchData = async function fetchData() {
    try {
      setLoading(true);
      const { data: tableData, error } = await supabase.from('students').select('*');

      if (error) {
        throw error;
      }

      setStudents(tableData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div>
      <Sidebar />
    </div>
  );

  if (error) return <p>Error: {error}</p>

  // Add new Student button
  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
            <Button label="Add Student" icon="pi pi-plus" className="p-button-success mr-2" onClick={() => setShowAddMode(true)}/>
            <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedStudents || !selectedStudents.length}
        />
      </React.Fragment>
    )
  }

  // Datatable header
  const header = (
    <div className="table-header">
      <h5 className="mx-0 my-1">Manage Students</h5>
    </div>
  );

  // Column with edit student button
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button icon="pi pi-pencil" rounded
                outlined
                size="small" onClick={() => editStudent(rowData)}/>
      </React.Fragment>
    );
  };

  // Edit student function
  const editStudent = (rowData) => {
    setSelectedStudent(rowData);
    setShowEditMode(true);
  };

  // Delete student(s) function
  const confirmDeleteSelected = () => {
    confirmDialog({
      message: `Are you sure you want to delete ${selectedStudents.length} selected student${selectedStudents.length > 1 ? 's' : ''}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteSelectedStudents(),
    });
  };

  const deleteSelectedStudents = async () => {
    try {
      const ids = selectedStudents.map(student => student.id);
      const { error } = await supabase
        .from('students')
        .delete()
        .in('id', ids);

      if (error) {
        throw error;
      }

      setSelectedStudents(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting students:', error.message);
    }
  };
  return (
    <div className="layout-content">
        {/* Add sidebar */}
        <Sidebar />

        {/* Students table */}
        <div className="student-list">

          <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>
          
          <DataTable 
            ref={dt}
            resizableColumns
            columnResizeMode="fit"
            showGridlines
            value={students}
            selection={selectedStudents}
            onSelectionChange={(e) => setSelectedStudents(e.value)}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
            header={header}
            responsiveLayout="scroll"
          >
            <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>
            <Column field="first_name" header="First Name" className="customColumn" alignHeader="center"></Column>
            <Column field="last_name" header="Last Name" className="customColumn" alignHeader="center"></Column>
            <Column field="date_of_birth" header="Date of Birth" body={dateOfBirthTemplate} className="customColumn" alignHeader="center"></Column>
            <Column field="parent_first_name" header="Parent First Name" className="customColumn" alignHeader="center"></Column>
            <Column field="parent_phone_number" header="Parent Phone" className="customColumn" alignHeader="center"></Column>
            <Column field="parent_email" header="Parent Email" className="customColumn" alignHeader="center"></Column>
            <Column body={actionBodyTemplate} align="center" className="flex gap-2"></Column>

          </DataTable>
        </div>

        {/* Dialog to add new student */}
        <Dialog 
          visible={showAddMode}
          style={{ width: '70vw' }}
          onHide={() => setShowAddMode(false)}>

          <AddStudent setStudentAdded={() => {
              setShowAddMode(false);
              fetchData();
          }} />
        </Dialog>

        {/* Dialog to edit student */}
        <Dialog 
          visible={showEditMode}
          style={{ width: '70vw' }}
          onHide={() => setShowEditMode(false)}>

          <EditStudent 
            student={selectedStudent}
            setStudentEdited={() => {
              setShowEditMode(false);
              fetchData();
            }} 
          />
        </Dialog>

        {/* Confirmation Dialog */}
        <ConfirmDialog />
    </div>
  )
}

export default Students;