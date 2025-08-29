import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import supabase from "../helper/supabaseClient";
import Sidebar from '../helper/Sidebar';
import { Dialog } from 'primereact/dialog';
import { format } from 'date-fns';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';

function Calendar() {
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventDialog, setShowEventDialog] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [activeFilters, setActiveFilters] = useState({ sessions: true, birthdays: true });
    const calendarRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch sessions, students, and enrollments data
    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch sessions
            const { data: sessionsData, error: sessionsError } = await supabase
                .from('sessions')
                .select('*')
                .order('start_date', { ascending: true });

            if (sessionsError) throw sessionsError;

            // Fetch students
            const { data: studentsData, error: studentsError } = await supabase
                .from('students')
                .select('*');

            if (studentsError) throw studentsError;

            // Fetch enrollments with student details
            const { data: enrollmentsData, error: enrollmentsError } = await supabase
                .from('enrollments')
                .select(`
                    id,
                    session_id,
                    student_id,
                    status,
                    students (
                        first_name,
                        last_name
                    )
                `);

            if (enrollmentsError) throw enrollmentsError;

            setSessions(sessionsData || []);
            setStudents(studentsData || []);
            setEnrollments(enrollmentsData || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Get enrolled students for a specific session
    const getEnrolledStudents = (sessionId) => {
        return enrollments
            .filter(enrollment => enrollment.session_id === sessionId && enrollment.status === 1)
            .map(enrollment => enrollment.students)
            .filter(Boolean);
    };

    // Convert sessions and students to FullCalendar events
    const getEvents = () => {
        const events = [];

        // Add sessions as events
        sessions.forEach(session => {
            if (session.start_date) {
                // Check if this is a recurring session (has day_of_week) or one-time session
                if (session.day_of_week !== null && session.day_of_week !== undefined) {
                    // Recurring session
                    const sessionStartDate = new Date(session.start_date);
                    const startDate = new Date(sessionStartDate);
                    
                    // First, add the event on the actual start date if it matches the day of week
                    const startDateDayOfWeek = startDate.getDay();
                    if (startDateDayOfWeek === session.day_of_week) {
                        // Create start and end datetime for the start date
                        const startDateTime = new Date(startDate);
                        const endDateTime = new Date(startDate);
                        
                        // Add start time if available
                        if (session.start_time) {
                            const [startHours, startMinutes] = session.start_time.split(':');
                            startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
                        }
                        
                        // Add end time if available
                        if (session.end_time) {
                            const [endHours, endMinutes] = session.end_time.split(':');
                            endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
                        } else {
                            // If no end time, default to 1 hour after start
                            endDateTime.setHours(startDateTime.getHours() + 1, startDateTime.getMinutes(), 0, 0);
                        }
                        
                        events.push({
                            id: `session-${session.id}-start`,
                            title: session.name || 'Session',
                            start: startDateTime,
                            end: endDateTime,
                            allDay: false,
                            backgroundColor: '#3B82F6',
                            borderColor: '#2563EB',
                            textColor: '#FFFFFF',
                            extendedProps: {
                                type: 'session',
                                data: session
                            }
                        });
                    }
                    
                    // Then generate recurring events up to the end date
                    if (session.end_date) {
                        const endDate = new Date(session.end_date);
                        let currentEventDate = new Date(startDate);
                        
                        // Move to the next occurrence after the start date
                        do {
                            currentEventDate.setDate(currentEventDate.getDate() + 7);
                        } while (currentEventDate.getDay() !== session.day_of_week);
                        
                        // Generate events until we reach or exceed the end date
                        while (currentEventDate <= endDate) {
                            // Create start and end datetime for this occurrence
                            const startDateTime = new Date(currentEventDate);
                            const endDateTime = new Date(currentEventDate);
                            
                            // Add start time if available
                            if (session.start_time) {
                                const [startHours, startMinutes] = session.start_time.split(':');
                                startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
                            }
                            
                            // Add end time if available
                            if (session.end_time) {
                                const [endHours, endMinutes] = session.end_time.split(':');
                                endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
                            } else {
                                // If no end time, default to 1 hour after start
                                endDateTime.setHours(startDateTime.getHours() + 1, startDateTime.getMinutes(), 0, 0);
                            }
                            
                            events.push({
                                id: `session-${session.id}-recurring-${currentEventDate.getTime()}`,
                                title: session.name || 'Session',
                                start: startDateTime,
                                end: endDateTime,
                                allDay: false,
                                backgroundColor: '#3B82F6',
                                borderColor: '#2563EB',
                                textColor: '#FFFFFF',
                                extendedProps: {
                                    type: 'session',
                                    data: session
                                }
                            });
                            
                            // Move to next week
                            currentEventDate.setDate(currentEventDate.getDate() + 7);
                        }
                    } else {
                        // If no end date, generate events for the next 12 months as fallback
                        for (let month = 0; month < 12; month++) {
                            const eventDate = new Date(startDate.getFullYear(), startDate.getMonth() + month, 1);
                            
                            // Find the first occurrence of the day of week in this month
                            while (eventDate.getDay() !== session.day_of_week) {
                                eventDate.setDate(eventDate.getDate() + 1);
                            }
                            
                            // Skip if this is the same as the start date (we already added it above)
                            if (eventDate.getTime() === startDate.getTime()) {
                                continue;
                            }
                            
                            // Add the event if it's on or after the session start date
                            if (eventDate >= sessionStartDate) {
                                // Create start and end datetime for this occurrence
                                const startDateTime = new Date(eventDate);
                                const endDateTime = new Date(eventDate);
                                
                                // Add start time if available
                                if (session.start_time) {
                                    const [startHours, startMinutes] = session.start_time.split(':');
                                    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
                                }
                                
                                // Add end time if available
                                if (session.end_time) {
                                    const [endHours, endMinutes] = session.end_time.split(':');
                                    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
                                } else {
                                    // If no end time, default to 1 hour after start
                                    endDateTime.setHours(startDateTime.getHours() + 1, startDateTime.getMinutes(), 0, 0);
                                }
                                
                                events.push({
                                    id: `session-${session.id}-fallback-${month}`,
                                    title: session.name || 'Session',
                                    start: startDateTime,
                                    end: endDateTime,
                                    allDay: false,
                                    backgroundColor: '#3B82F6',
                                    borderColor: '#2563EB',
                                    textColor: '#FFFFFF',
                                    extendedProps: {
                                        type: 'session',
                                        data: session
                                    }
                                });
                            }
                        }
                    }
                } else {
                    // One-time session - show on the specific start_date
                    const startDateTime = new Date(session.start_date);
                    const endDateTime = new Date(session.start_date);
                    
                    // Add start time if available
                    if (session.start_time) {
                        const [startHours, startMinutes] = session.start_time.split(':');
                        startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
                    }
                    
                    // Add end time if available
                    if (session.end_time) {
                        const [endHours, endMinutes] = session.end_time.split(':');
                        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
                    } else {
                        // If no end time, default to 1 hour after start
                        endDateTime.setHours(startDateTime.getHours() + 1, startDateTime.getMinutes(), 0, 0);
                    }
                    
                    events.push({
                        id: `session-${session.id}-one-time`,
                        title: session.name || 'Session',
                        start: startDateTime,
                        end: endDateTime,
                        allDay: false,
                        backgroundColor: '#3B82F6',
                        borderColor: '#2563EB',
                        textColor: '#FFFFFF',
                        extendedProps: {
                            type: 'session',
                            data: session
                        }
                    });
                }
            }
        });

        // Add student birthdays as events
        console.log('Processing students for birthdays:', students.length);
        students.forEach(student => {
            if (student.date_of_birth) {
                console.log('Student with birthday:', student.first_name, student.last_name, student.date_of_birth);
                
                // Create birthday events for the next 2 years to ensure visibility
                const currentYear = new Date().getFullYear();
                const birthday = new Date(student.date_of_birth);
                
                // Generate birthdays for current year and next year
                for (let year = currentYear; year <= currentYear + 1; year++) {
                    const nextBirthday = new Date(year, birthday.getMonth(), birthday.getDate());
                    
                    events.push({
                        id: `birthday-${student.id}-${year}`,
                        title: `🎂 ${student.first_name} ${student.last_name}'s Birthday`,
                        start: nextBirthday,
                        allDay: true,
                        backgroundColor: '#EC4899',
                        borderColor: '#DB2777',
                        textColor: '#FFFFFF',
                        extendedProps: {
                            type: 'birthday',
                            data: student
                        }
                    });
                    console.log('Added birthday event for:', student.first_name, 'on', nextBirthday.toDateString());
                }
            }
        });

        console.log('Total events generated:', events.length);
        console.log('Birthday events:', events.filter(e => e.extendedProps.type === 'birthday').length);
        console.log('Session events:', events.filter(e => e.extendedProps.type === 'session').length);

        return events;
    };

    // Filter events based on active filters
    useEffect(() => {
        const allEvents = getEvents();
        const filtered = allEvents.filter(event => {
            if (event.extendedProps.type === 'session' && !activeFilters.sessions) return false;
            if (event.extendedProps.type === 'birthday' && !activeFilters.birthdays) return false;
            return true;
        });
        setFilteredEvents(filtered);
    }, [sessions, students, enrollments, activeFilters]);

    // Toggle filter
    const toggleFilter = (filterType) => {
        setActiveFilters(prev => ({
            ...prev,
            [filterType]: !prev[filterType]
        }));
    };

    // Handle event click
    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);
        setShowEventDialog(true);
    };

    // Format date for display
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch {
            return dateString;
        }
    };

    // Get day of week name
    const getDayOfWeek = (dayNumber) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayNumber] || 'Unknown';
    };

    if (loading) {
        return (
            <div className="layout-content">
                <Sidebar />
                <div className="flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="layout-content">
                <Sidebar />
                <div className="flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                    <div className="text-red-500">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-content">
            <Sidebar />
            <div className="p-4">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold mb-2">Calendar</h1>
                </div>

                {/* Legend with clickable filters */}
                <div className="mb-4 flex gap-4">
                    <Button
                        label="Sessions"
                        icon="pi pi-calendar"
                        className={`p-button-sm ${activeFilters.sessions ? 'p-button-primary' : 'p-button-outlined'}`}
                        onClick={() => toggleFilter('sessions')}
                        style={{ backgroundColor: activeFilters.sessions ? '#3B82F6' : 'transparent', borderColor: '#3B82F6' }}
                    />
                    <Button
                        label="Birthdays"
                        icon="pi pi-gift"
                        className={`p-button-sm ${activeFilters.birthdays ? 'p-button-primary' : 'p-button-outlined'}`}
                        onClick={() => toggleFilter('birthdays')}
                        style={{ backgroundColor: activeFilters.birthdays ? '#EC4899' : 'transparent', borderColor: '#EC4899' }}
                    />
                </div>

                {/* Calendar */}
                <div className="bg-white rounded-lg shadow-lg p-4">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        events={filteredEvents}
                        eventClick={handleEventClick}
                        height="auto"
                        eventDisplay="block"
                        dayMaxEvents={true}
                        moreLinkClick="popover"
                        editable={false}
                        selectable={false}
                        selectMirror={true}
                        weekends={true}
                        firstDay={1}
                    />
                </div>

                {/* Event Details Dialog */}
                <Dialog
                    visible={showEventDialog}
                    onHide={() => setShowEventDialog(false)}
                    header={selectedEvent?.title}
                    style={{ width: '600px' }}
                    footer={
                        <div className="flex justify-content-end">
                            <Button
                                label="Close"
                                icon="pi pi-times"
                                onClick={() => setShowEventDialog(false)}
                                className="p-button-text"
                            />
                        </div>
                    }
                >
                    {selectedEvent && (
                        <div>
                            {selectedEvent.extendedProps.type === 'session' ? (
                                <Card className="mb-3">
                                    <div className="space-y-3">
                                        <div>
                                            <strong>Session Name:</strong> {selectedEvent.extendedProps.data.name || 'Untitled Session'}
                                        </div>
                                        <div>
                                            <strong>Date:</strong> {formatDate(selectedEvent.start)}
                                        </div>
                                        <div>
                                            <strong>Time:</strong> {format(new Date(selectedEvent.start), 'HH:mm')} - {format(new Date(selectedEvent.end), 'HH:mm')}
                                        </div>
                                        <div>
                                            <strong>Day:</strong> {getDayOfWeek(selectedEvent.extendedProps.data.day_of_week)}
                                        </div>
                                        {selectedEvent.extendedProps.data.description && (
                                            <div>
                                                <strong>Description:</strong> {selectedEvent.extendedProps.data.description}
                                            </div>
                                        )}
                                        {selectedEvent.extendedProps.data.location && (
                                            <div>
                                                <strong>Location:</strong> {selectedEvent.extendedProps.data.location}
                                            </div>
                                        )}
                                        {selectedEvent.extendedProps.data.price_per_session && (
                                            <div>
                                                <strong>Price per Session:</strong> ${selectedEvent.extendedProps.data.price_per_session}
                                            </div>
                                        )}
                                        <div>
                                            <strong>Enrolled Students:</strong>
                                            {(() => {
                                                const enrolledStudents = getEnrolledStudents(selectedEvent.extendedProps.data.id);
                                                if (enrolledStudents.length === 0) {
                                                    return <span className="text-gray-500 ml-2">No students enrolled</span>;
                                                }
                                                return (
                                                    <div className="mt-2">
                                                        {enrolledStudents.map((student, index) => (
                                                            <Tag 
                                                                key={index} 
                                                                value={`${student.first_name} ${student.last_name}`} 
                                                                severity="success" 
                                                                className="mr-2 mb-2"
                                                            />
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="mb-3">
                                    <div className="space-y-3">
                                        <div>
                                            <strong>Student:</strong> {selectedEvent.extendedProps.data.first_name} {selectedEvent.extendedProps.data.last_name}
                                        </div>
                                        <div>
                                            <strong>Birthday:</strong> {formatDate(selectedEvent.extendedProps.data.date_of_birth)}
                                        </div>
                                        {selectedEvent.extendedProps.data.email && (
                                            <div>
                                                <strong>Email:</strong> {selectedEvent.extendedProps.data.email}
                                            </div>
                                        )}
                                        {selectedEvent.extendedProps.data.phone && (
                                            <div>
                                                <strong>Phone:</strong> {selectedEvent.extendedProps.data.phone}
                                            </div>
                                        )}

                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </Dialog>
            </div>
        </div>
    );
}

export default Calendar;