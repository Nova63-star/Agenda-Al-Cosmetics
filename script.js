const calendar = document.getElementById('calendar');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const dayView = document.getElementById('day-view');
const selectedDateEl = document.getElementById('selected-date');
const appointmentsEl = document.getElementById('appointments');
const addAppointmentBtn = document.getElementById('add-appointment');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
const saveBtn = document.getElementById('save');
const nameInput = document.getElementById('name');
const serviceInput = document.getElementById('service');
const timeInput = document.getElementById('time');

let currentDate = new Date();
let selectedDate = null;
let appointments = {};

// Cargar citas desde localStorage al inicio
function loadAppointments() {
  const data = localStorage.getItem('appointments');
  if (data) {
    appointments = JSON.parse(data);
  }
}

// Guardar citas en localStorage
function saveAppointments() {
  localStorage.setItem('appointments', JSON.stringify(appointments));
}

function renderCalendar() {
  calendar.innerHTML = '';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  monthYear.textContent = `${currentDate.toLocaleString('default', {
    month: 'long',
  })} ${year}`;

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    calendar.appendChild(emptyCell);
  }

  for (let day = 1; day <= lastDate; day++) {
    if (isCurrentMonth && day < today.getDate()) continue;

    const dateStr = `${year}-${month + 1}-${day}`;
    const dayEl = document.createElement('div');
    dayEl.className = 'day fade-in';
    dayEl.textContent = day;

    if (appointments[dateStr]) {
      const indicator = document.createElement('div');
      indicator.className = 'indicator';
      indicator.textContent = appointments[dateStr].length;
      dayEl.appendChild(indicator);
    }

    dayEl.addEventListener('click', () => {
      selectedDate = dateStr;
      showDayView();
    });

    calendar.appendChild(dayEl);
  }
}

function showDayView() {
  dayView.classList.remove('hidden');

  const [year, month, day] = selectedDate.split('-');
  const date = new Date(year, month - 1, day);
  const formatted = `${day} de ${date.toLocaleString('default', {
    month: 'long',
  })} de ${year}`;

  selectedDateEl.textContent = `Citas para ${formatted}`;
  appointmentsEl.innerHTML = '';

  (appointments[selectedDate] || []).forEach((appt, index) => {
    const apptEl = document.createElement('div');
    apptEl.className = 'appointment';
    apptEl.textContent = `${appt.time} - ${appt.name} (${appt.service})`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.onclick = () => {
      appointments[selectedDate].splice(index, 1);
      if (appointments[selectedDate].length === 0) {
        delete appointments[selectedDate];
      }
      saveAppointments(); // ← Guardamos después de eliminar
      showDayView();
      renderCalendar();
    };

    apptEl.appendChild(deleteBtn);
    appointmentsEl.appendChild(apptEl);
  });
}

addAppointmentBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
  modal.classList.add('fade-in');
  nameInput.value = '';
  serviceInput.value = '';
  timeInput.value = '';
});

closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

saveBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const service = serviceInput.value.trim();
  const time = timeInput.value;

  if (name && service && time) {
    if (!appointments[selectedDate]) {
      appointments[selectedDate] = [];
    }

    appointments[selectedDate].push({ name, service, time });
    saveAppointments(); // ← Guardamos después de agregar
    modal.classList.add('hidden');
    showDayView();
    renderCalendar();
  }
});

prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Inicialización
loadAppointments();
renderCalendar();
