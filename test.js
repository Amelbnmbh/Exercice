const weeklyAppointments = [
    { from: "2024-10-30T10:15:00", to: "2024-10-30T10:30:00" },
    { from: "2024-10-31T11:00:00", to: "2024-10-31T11:30:00" },
    { from: "2024-11-01T15:30:00", to: "2024-11-01T16:30:00" },
    { from: "2024-10-30T15:30:00", to: "2024-10-30T16:30:00" },
    { from: "2024-10-29T10:00:00", to: "2024-10-29T10:30:00" },
    { from: "2024-10-28T11:00:00", to: "2024-10-28T12:30:00" },
];

const startDate = new Date("2024-10-28");
const endDate = new Date("2024-11-01");

function getWeekDays(start) {
    const days = [];
    for (let i = 0; i < 5; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        days.push(day);
    }
    return days;
}

function displayCalendar() {
    const calendarContainer = document.getElementById('calendar');
    const weekDays = getWeekDays(startDate);

    weekDays.forEach(day => {
        const dayElement = document.createElement('div');
        const dayAbbreviation = day.toLocaleDateString('fr-FR', { weekday: 'short' });
        const dayDate = day.getDate();
        const dayMonth = day.toLocaleDateString('fr-FR', { month: 'short' });

        dayElement.className = 'day';
        dayElement.textContent = `${dayAbbreviation.toUpperCase()}. ${dayDate} ${dayMonth.toUpperCase()}`;

        dayElement.addEventListener('click', () => {
            displayTimeslots(day);
        });

        calendarContainer.appendChild(dayElement);
    });
}

function parseDate(dateString) {
    return new Date(dateString);
}

function getTimeslotsForDay(day) {
    const timeslots = [];
    const startTime = new Date(day.setHours(8, 0, 0, 0));
    const endTime = new Date(day.setHours(18, 0, 0, 0));

    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
        const hours = currentTime.getHours();
        if (hours >= 12 && hours < 13) {
            currentTime.setMinutes(currentTime.getMinutes() + 30);
            continue; // Skip lunch hour
        }

        const nextTime = new Date(currentTime.getTime() + 30 * 60000);
        timeslots.push({ from: new Date(currentTime), to: new Date(nextTime) });
        currentTime = nextTime;
    }

    return timeslots;
}

function isOverlapping(appointment, timeslot) {
    return (
        parseDate(appointment.from) < timeslot.to &&
        parseDate(appointment.to) > timeslot.from
    );
}

function findFreeTimeslots(selectedDate) {
    const dayTimeslots = getTimeslotsForDay(new Date(selectedDate));

    return dayTimeslots.filter(timeslot => {
        const isBooked = weeklyAppointments.some(appointment =>
            isOverlapping(appointment, timeslot)
        );
        return !isBooked;
    });
}

function displayTimeslots(selectedDate) {
    const timeslotsContainer = document.getElementById('timeslots');
    const noAppointmentsContainer = document.getElementById('noAppointments');
    const timeSelectionMessage = document.getElementById('timeSelectionMessage');

    timeslotsContainer.innerHTML = ''; 
    noAppointmentsContainer.style.display = 'none'; 
    timeSelectionMessage.style.display = 'none';

    const freeTimeslots = findFreeTimeslots(selectedDate);

    if (freeTimeslots.length === 0) {
        noAppointmentsContainer.style.display = 'block';
    } else {
        timeSelectionMessage.style.display = 'block';
        freeTimeslots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.classList.add('timeslot');
            slotElement.textContent = `${slot.from.getHours()}:${slot.from.getMinutes().toString().padStart(2, '0')}`;
            slotElement.addEventListener('click', () => {
                blockTimeslot(selectedDate, slot);
                displayTimeslots(selectedDate);
            });

            timeslotsContainer.appendChild(slotElement);
        });
    }
}

function blockTimeslot(selectedDate, timeslot) {
    let blockedTimeslots = JSON.parse(localStorage.getItem('blockedTimeslots')) || {};
    if (!blockedTimeslots[selectedDate]) {
        blockedTimeslots[selectedDate] = [];
    }
    blockedTimeslots[selectedDate].push({
        from: timeslot.from.toISOString(),
        to: timeslot.to.toISOString()
    });
    localStorage.setItem('blockedTimeslots', JSON.stringify(blockedTimeslots));
}

displayCalendar();
