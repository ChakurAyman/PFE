const PATIENT_STORAGE_KEY = 'patientFolders';
const APPOINTMENT_STORAGE_KEY = 'doctorAppointments';
const appointmentForm = document.getElementById('appointmentForm');
const patientSelect = document.getElementById('appointmentPatient');
const appointmentList = document.getElementById('appointmentList');
const timetable = document.getElementById('timetable');
const viewDateInput = document.getElementById('viewDate');
const appointmentCount = document.getElementById('appointmentCount');
const selectedDayText = document.getElementById('selectedDay');
const scheduleFormTitle = document.getElementById('scheduleFormTitle');
const cancelScheduleEditBtn = document.getElementById('cancelScheduleEditBtn');

let patients = [];
let appointments = [];
let editingAppointmentId = null;

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function loadPatients() {
  const stored = localStorage.getItem(PATIENT_STORAGE_KEY);
  patients = stored ? JSON.parse(stored) : [];
}

function loadAppointments() {
  const stored = localStorage.getItem(APPOINTMENT_STORAGE_KEY);
  appointments = stored ? JSON.parse(stored) : [];
}

function saveAppointments() {
  localStorage.setItem(APPOINTMENT_STORAGE_KEY, JSON.stringify(appointments));
}

function populatePatients() {
  patientSelect.innerHTML = '<option value="" disabled selected>Select patient</option>';
  if (!patients.length) {
    patientSelect.innerHTML = '<option value="" disabled selected>No patients available</option>';
    return;
  }

  patients.forEach(patient => {
    const option = document.createElement('option');
    option.value = patient.id;
    option.textContent = patient.name;
    patientSelect.appendChild(option);
  });
}

function formatTimeLabel(time) {
  return time;
}

function getTimeslots() {
  const slots = [];
  let hour = 8;
  let minute = 0;
  while (hour < 18 || (hour === 18 && minute === 0)) {
    const pad = value => value.toString().padStart(2, '0');
    slots.push(`${pad(hour)}:${pad(minute)}`);
    minute += 30;
    if (minute === 60) {
      minute = 0;
      hour += 1;
    }
    if (hour === 18 && minute === 30) break;
  }
  return slots;
}

function renderTimetable(date) {
  const visible = appointments.filter(appt => appt.date === date);
  const slots = getTimeslots();

  timetable.innerHTML = `
    <div class="timetable-header">
      <span>Time</span>
      <span>Patient</span>
      <span>Doctor</span>
      <span>Reason</span>
    </div>
  `;

  slots.forEach(slot => {
    const appt = visible.find(item => item.time === slot);
    const row = document.createElement('div');
    row.className = `timetable-row ${appt ? 'appointed' : 'free'}`;
    row.innerHTML = `
      <span>${formatTimeLabel(slot)}</span>
      <span>${appt ? getPatientName(appt.patientId) : 'Free'}</span>
      <span>${appt ? appt.doctor : '-'}</span>
      <span>${appt ? appt.reason : '-'}</span>
    `;
    timetable.appendChild(row);
  });
}

function getPatientName(patientId) {
  const patient = patients.find(item => item.id === patientId);
  return patient ? patient.name : 'Unknown patient';
}

function renderAppointments() {
  const viewDate = viewDateInput.value || getTodayDate();
  const visible = appointments
    .filter(appt => appt.date === viewDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  appointmentCount.textContent = visible.length.toString();
  selectedDayText.textContent = viewDate;

  if (!visible.length) {
    appointmentList.innerHTML = `
      <div class="appointment-card">
        <h3>No appointments today</h3>
        <p>Use the form to schedule a new appointment for a saved patient.</p>
      </div>
    `;
  } else {
    appointmentList.innerHTML = visible.map(appt => `
      <article class="appointment-card">
        <h3>${getPatientName(appt.patientId)} - ${appt.time}</h3>
        <p><strong>Doctor:</strong> ${appt.doctor}</p>
        <p><strong>Reason:</strong> ${appt.reason}</p>
        <p><strong>Date:</strong> ${appt.date}</p>
        <div class="appointment-card-actions">
          <button class="edit" data-action="edit" data-id="${appt.id}">Edit</button>
          <button class="delete" data-action="delete" data-id="${appt.id}">Delete</button>
        </div>
      </article>
    `).join('');
  }

  renderTimetable(viewDate);
}

function resetScheduleForm() {
  appointmentForm.reset();
  editingAppointmentId = null;
  scheduleFormTitle.textContent = 'New appointment';
  cancelScheduleEditBtn.classList.add('hidden');
  if (patients.length) {
    patientSelect.value = '';
  }
}

function fillScheduleForm(appointment) {
  scheduleFormTitle.textContent = 'Edit appointment';
  patientSelect.value = appointment.patientId;
  document.getElementById('appointmentDoctor').value = appointment.doctor;
  document.getElementById('appointmentDate').value = appointment.date;
  document.getElementById('appointmentTime').value = appointment.time;
  document.getElementById('appointmentReason').value = appointment.reason;
  cancelScheduleEditBtn.classList.remove('hidden');
}

appointmentForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!patients.length) return;

  const formData = new FormData(appointmentForm);
  const appointmentData = {
    patientId: formData.get('patient'),
    doctor: formData.get('doctor').trim(),
    date: formData.get('date'),
    time: formData.get('time'),
    reason: formData.get('reason').trim(),
  };

  if (!appointmentData.patientId || !appointmentData.doctor || !appointmentData.date || !appointmentData.time || !appointmentData.reason) {
    return;
  }

  const collision = appointments.some(item => item.date === appointmentData.date && item.time === appointmentData.time && item.id !== editingAppointmentId);
  if (collision) {
    alert('This time slot is already booked. Please choose another time.');
    return;
  }

  if (editingAppointmentId) {
    appointments = appointments.map(item => item.id === editingAppointmentId ? { ...item, ...appointmentData } : item);
  } else {
    appointments.push({ id: Date.now().toString(), ...appointmentData });
  }

  saveAppointments();
  renderAppointments();
  resetScheduleForm();
});

appointmentList.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  const appointment = appointments.find(item => item.id === id);
  if (!appointment) return;

  if (action === 'edit') {
    editingAppointmentId = id;
    fillScheduleForm(appointment);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (action === 'delete') {
    appointments = appointments.filter(item => item.id !== id);
    saveAppointments();
    renderAppointments();
    if (editingAppointmentId === id) resetScheduleForm();
  }
});

cancelScheduleEditBtn.addEventListener('click', resetScheduleForm);
viewDateInput.addEventListener('change', renderAppointments);

function initializeSchedule() {
  loadPatients();
  loadAppointments();
  populatePatients();

  const today = getTodayDate();
  viewDateInput.value = today;
  selectedDayText.textContent = today;
  appointmentCount.textContent = '0';

  if (!patients.length) {
    appointmentForm.querySelector('button[type="submit"]').disabled = true;
    appointmentList.innerHTML = `
      <div class="appointment-card">
        <h3>No patients available</h3>
        <p>Create a patient folder in the patient manager before scheduling appointments.</p>
      </div>
    `;
    timetable.innerHTML = '';
    return;
  }

  appointmentForm.querySelector('button[type="submit"]').disabled = false;
  renderAppointments();
}

initializeSchedule();
