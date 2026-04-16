const STORAGE_KEY = 'patientFolders';
const patientForm = document.getElementById('patientForm');
const patientList = document.getElementById('patientList');
const patientCount = document.getElementById('patientCount');
const formTitle = document.getElementById('formTitle');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

let patients = [];
let editingId = null;

function loadPatients() {
  const stored = localStorage.getItem(STORAGE_KEY);
  patients = stored ? JSON.parse(stored) : [];
}

function savePatients() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

function renderPatients() {
  patientList.innerHTML = '';

  if (!patients.length) {
    patientList.innerHTML = `
      <div class="empty-state">
        <p>No patient folders yet.</p>
        <p>Use the form to add the first folder.</p>
      </div>
    `;
    patientCount.textContent = '0 folders';
    return;
  }

  patientCount.textContent = `${patients.length} folder${patients.length === 1 ? '' : 's'}`;

  patients.forEach(patient => {
    const card = document.createElement('article');
    card.className = 'patient-card';
    card.innerHTML = `
      <div class="patient-card-header">
        <div>
          <h3 class="patient-title">${patient.name}</h3>
          <p class="panel-copy">Condition: ${patient.condition}</p>
        </div>
        <div class="patient-meta">
          <span>${patient.sex}</span>
          <span>Age ${patient.age}</span>
        </div>
      </div>
      <div class="patient-content">
        <p><strong>Medical history</strong></p>
        <p>${patient.history}</p>
      </div>
      <div class="patient-actions">
        <button class="card-button" data-action="edit" data-id="${patient.id}">Edit</button>
        <button class="card-button delete" data-action="delete" data-id="${patient.id}">Delete</button>
      </div>
    `;
    patientList.appendChild(card);
  });
}

function resetForm() {
  patientForm.reset();
  editingId = null;
  formTitle.textContent = 'New patient folder';
  cancelEditBtn.classList.add('hidden');
}

function fillForm(patient) {
  formTitle.textContent = 'Edit patient folder';
  document.getElementById('patientName').value = patient.name;
  document.getElementById('patientSex').value = patient.sex;
  document.getElementById('patientAge').value = patient.age;
  document.getElementById('patientHistory').value = patient.history;
  document.getElementById('patientCondition').value = patient.condition;
  cancelEditBtn.classList.remove('hidden');
}

function savePatient(data) {
  if (editingId) {
    patients = patients.map(patient => patient.id === editingId ? { ...patient, ...data } : patient);
  } else {
    patients.push({ id: Date.now().toString(), ...data });
  }
  savePatients();
  renderPatients();
  resetForm();
}

patientForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(patientForm);
  const data = {
    name: formData.get('name').trim(),
    sex: formData.get('sex'),
    age: formData.get('age').trim(),
    history: formData.get('history').trim(),
    condition: formData.get('condition').trim(),
  };

  if (!data.name || !data.sex || !data.age || !data.history || !data.condition) {
    return;
  }

  savePatient(data);
});

patientList.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  const patient = patients.find(item => item.id === id);

  if (!patient) return;

  if (action === 'edit') {
    editingId = id;
    fillForm(patient);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (action === 'delete') {
    patients = patients.filter(item => item.id !== id);
    savePatients();
    renderPatients();
    if (editingId === id) resetForm();
  }
});

cancelEditBtn.addEventListener('click', resetForm);
clearAllBtn.addEventListener('click', () => {
  patients = [];
  savePatients();
  renderPatients();
  resetForm();
});

loadPatients();
renderPatients();
