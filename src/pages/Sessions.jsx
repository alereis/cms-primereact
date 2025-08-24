import React, { useEffect, useState, useRef } from 'react';
import supabase from "../helper/supabaseClient";
import Sidebar from '../helper/Sidebar';
import AddSession from './_addSession';
import EditSession from './_editSession';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { format } from 'date-fns';
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

function Sessions() {
    const [sessions, setSessions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddMode, setShowAddMode] = useState(false);
    const [showEditMode, setShowEditMode] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const dt = useRef(null);
    const [selectedSessions, setSelectedSessions] = useState(null);

    // Format date for display
    const dateTemplate = (rowData, field) => {
        if (!rowData[field]) return 'Not entered';
        try {
            return format(new Date(rowData[field]), 'dd/MM/yyyy');
        } catch {
            return rowData[field];
        }
    };

    // Format time for display
    const timeTemplate = (rowData, field) => {
        if (!rowData[field]) return 'Not entered';
        try {
            return format(new Date(`1970-01-01T${rowData[field]}`), 'HH:mm');
        } catch {
            return rowData[field];
        }
    };

    // Format day of week for display
    const dayOfWeekTemplate = (rowData) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[rowData.day_of_week];
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch all sessions
    const fetchData = async function fetchData() {
        try {
            setLoading(true);
            const { data: tableData, error } = await supabase
                .from('sessions')
                .select('*')
                .order('start_date', { ascending: true });

            if (error) {
                throw error;
            }

            setSessions(tableData);
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

    // Add new Session button
    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Add Session" icon="pi pi-plus" className="p-button-success mr-2" onClick={() => setShowAddMode(true)}/>
                <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedSessions || !selectedSessions.length} />
            </React.Fragment>
        )
    }

    // Datatable header
    const header = (
        <div className="table-header">
            <h5 className="mx-0 my-1">Manage Sessions</h5>
        </div>
    );

    // Column with edit session button
    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded
                outlined
                size="small" onClick={() => editSession(rowData)}/>
            </React.Fragment>
        );
    };

    // Edit session function
    const editSession = (rowData) => {
        setSelectedSession(rowData);
        setShowEditMode(true);
    };

    // Delete session(s) function
    const confirmDeleteSelected = () => {
        confirmDialog({
            message: `Are you sure you want to delete ${selectedSessions.length} selected session${selectedSessions.length > 1 ? 's' : ''}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteSelectedSessions(),
        });
    };

    const deleteSelectedSessions = async () => {
        try {
            const ids = selectedSessions.map(session => session.id);
            const { error } = await supabase
                .from('sessions')
                .delete()
                .in('id', ids);

            if (error) {
                throw error;
            }

            setSelectedSessions(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting sessions:', error.message);
        }
    };

    return (
        <div className="layout-content">
            {/* Add sidebar */}
            <Sidebar />

            {/* Sessions table */}
            <div className="session-list">
                <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>
                
                <DataTable 
                    ref={dt}
                    resizableColumns
                    columnResizeMode="fit"
                    showGridlines
                    value={sessions}
                    selection={selectedSessions}
                    onSelectionChange={(e) => setSelectedSessions(e.value)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} sessions"
                    header={header}
                >
                    <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>
                    <Column field="name" header="Session Name" className="customColumn" alignHeader="center"></Column>
                    <Column field="day_of_week" header="Day" body={dayOfWeekTemplate} className="customColumn" alignHeader="center"></Column>
                    <Column field="start_date" header="Start Date" body={(rowData) => dateTemplate(rowData, 'start_date')} className="customColumn" alignHeader="center"></Column>
                    <Column field="end_date" header="End Date" body={(rowData) => dateTemplate(rowData, 'end_date')} className="customColumn" alignHeader="center"></Column>
                    <Column field="start_time" header="Start Time" body={(rowData) => timeTemplate(rowData, 'start_time')} className="customColumn" alignHeader="center"></Column>
                    <Column field="end_time" header="End Time" body={(rowData) => timeTemplate(rowData, 'end_time')} className="customColumn" alignHeader="center"></Column>
                    <Column field="location" header="Location" className="customColumn" alignHeader="center"></Column>
                    <Column 
                        field="price_per_session" 
                        header="Price ($)" 
                        className="customColumn" 
                        alignHeader="center"
                        body={(rowData) => rowData.price_per_session ? `$${Number(rowData.price_per_session).toFixed(2)}` : ''}
                    ></Column>
                    <Column body={actionBodyTemplate} align="center" className="flex gap-2"></Column>
                </DataTable>
            </div>

            {/* Dialog to add new session */}
            <Dialog 
                visible={showAddMode}
                style={{ width: '70vw' }}
                onHide={() => setShowAddMode(false)}>
                <AddSession setSessionAdded={() => {
                    setShowAddMode(false);
                    fetchData();
                }} />
            </Dialog>

            {/* Dialog to edit session */}
            <Dialog 
                visible={showEditMode}
                style={{ width: '70vw' }}
                onHide={() => setShowEditMode(false)}>
                <EditSession 
                    session={selectedSession}
                    setSessionEdited={() => {
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

export default Sessions;