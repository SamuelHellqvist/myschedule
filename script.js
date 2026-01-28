const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const startHour = 8; // 8 AM
const endHour = 20; // 8 PM
const hoursInDay = endHour - startHour;

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function calculatePosition(startTime, endTime) {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const startHourMinutes = startHour * 60;
    
    const top = ((startMinutes - startHourMinutes) / 60) * 123; // 123px per hour
    const height = ((endMinutes - startMinutes) / 60) * 123; // 123px per hour
    
    return { top, height };
}

async function loadSchedule() {
    try {
        const response = await fetch('weeks.json');
        const data = await response.json();
        displaySchedule(data.modules);
    } catch (error) {
        console.error('Error loading schedule:', error);
        document.getElementById('schedule').innerHTML = '<p>Error loading schedule. Please check weeks.json file.</p>';
    }
}

function displaySchedule(modules) {
    const scheduleGrid = document.getElementById('schedule');
    scheduleGrid.innerHTML = '';

    // Create time column
    const timeColumn = document.createElement('div');
    timeColumn.className = 'time-column';
    
    const timeHeader = document.createElement('div');
    timeHeader.className = 'time-slot';
    timeColumn.appendChild(timeHeader);
    
    for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        const displayHour = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        timeSlot.textContent = `${displayHour}:00 ${ampm}`;
        timeColumn.appendChild(timeSlot);
    }
    
    scheduleGrid.appendChild(timeColumn);

    // Create day columns
    const dayColumns = {};
    daysOfWeek.forEach(day => {
        dayColumns[day] = [];
    });

    // Group sessions by day
    modules.forEach(module => {
        module.sessions.forEach(session => {
            if (dayColumns[session.day_of_week]) {
                dayColumns[session.day_of_week].push({
                    ...session,
                    module_name: module.module_name,
                    module_id: module.module_id
                });
            }
        });
    });

    // Create and display day columns
    daysOfWeek.forEach(day => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day.substring(0, 3);
        dayColumn.appendChild(dayHeader);

        // Create time rows
        for (let hour = startHour; hour < endHour; hour++) {
            const timeRow = document.createElement('div');
            timeRow.className = 'time-row';
            dayColumn.appendChild(timeRow);
        }

        // Add sessions positioned absolutely
        dayColumns[day].forEach(session => {
            const position = calculatePosition(session.time.start, session.time.end);
            
            const sessionDiv = document.createElement('div');
            sessionDiv.className = 'session';
            sessionDiv.style.top = `${position.top + 50}px`; // 50px for header
            sessionDiv.style.height = `${position.height - 4}px`; // -4px for margins
            
            sessionDiv.innerHTML = `
                <div class="session-title-id">
                    <span class="session-title">${session.module_name}</span>
                    <span class="session-id">${session.module_id}</span>
                </div>
                <div class="session-time-place">
                    <span class="session-time">${session.time.start} - ${session.time.end}</span>
                    <span class="session-place">📍 ${session.place}</span>
                </div>
                <div class="session-details">
                    <span class="session-type">${session.education_type}</span>
                </div>
            `;
            
            dayColumn.appendChild(sessionDiv);
        });

        scheduleGrid.appendChild(dayColumn);
    });
}

// Load schedule when page loads
loadSchedule();
