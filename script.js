const calendar = document.getElementById("calendar");
const monthYearEl = document.getElementById("month-year");
const dayView = document.getElementById("day-view");
const selectedDateEl = document.getElementById("selected-date");
const appointmentsContainer = document.getElementById("appointments");
const modal = document.getElementById("modal");
const addAppointmentBtn = document.getElementById("add-appointment");
const saveBtn = document.getElementById("save");
const closeModal = document.querySelector(".close");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

let currentDate = new Date();
let selectedDate = null;

function getDateKey(year, month, day) {
  return `${year}-${month + 1}-${day}`;
}

function loadAppointments() {
  return JSON.parse(localStorage.getItem("appointments") || "{}");
}

function saveAppointments(data) {
  localStorage.setItem("appointments", JSON.stringify(data));
}

function clearPastAppointments() {
  const today = new Date();
  const appointments = loadAppointments();
  let changed = false;

  for (const key in appointments) {
    const [year, month, day] = key.split("-").map(Number);
    const apptDate = new Date(year, month - 1, day);
    if (apptDate < today.setHours(0, 0, 0, 0)) {
      delete appointments[key];
      changed = true;
    }
  }

  if (changed) saveAppointments(appointments);
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendar.innerHTML = "";
  monthYearEl.textContent = `${currentDate.toLocaleString("default", {
    month: "long",
  })} ${year}`;

  const appointments = loadAppointments();

  for (let i = 1; i <= daysInMonth; i++) {
    if (isCurrentMonth && i < today.getDate()) continue;

    const dayEl = document.createElement("div");
    dayEl.className = "day fade-in";
    dayEl.textContent = i;

    const key = getDateKey(year, month, i);
    if (appointments[key] && appointments[key].length > 0) {
      const indicator = document.createElement("div");
      indicator.className = "indicator";
      indicator.textContent = appointments[key].length;
      dayEl.appendChild(indicator);
    }

    dayEl.addEventListener("click", () => openDay(year, month, i));
    calendar.appendChild(dayEl);
  }
}

function openDay(year, month, day) {
  selectedDate = getDateKey(year, month, day);
  const formatted = new Date(year, month, day).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  selectedDateEl.textContent = `Citas para ${formatted}`;
  showAppointments();
  dayView.classList.remove("hidden");
}

function showAppointments() {
  const appointments = loadAppointments();
  const dayAppointments = appointments[selectedDate] || [];

  appointmentsContainer.innerHTML = "";
  dayAppointments.forEach((appt, index) => {
    const el = document.createElement("div");
    el.className = "appointment fade-in";
    el.innerHTML = `${appt.time} - ${appt.name} (${appt.service}) 
      <button class="delete-btn" onclick="deleteAppointment('${selectedDate}', ${index})">✕</button>`;
    appointmentsContainer.appendChild(el);
  });
}

function deleteAppointment(date, index) {
  const appointments = loadAppointments();
  appointments[date].splice(index, 1);
  if (appointments[date].length === 0) delete appointments[date];
  saveAppointments(appointments);
  showAppointments();
  renderCalendar();
}

addAppointmentBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

saveBtn.addEventListener("click", () => {
  const name = document.getElementById("name").value;
  const service = document.getElementById("service").value;
  const time = document.getElementById("time").value;

  if (!name || !service || !time || !selectedDate) return;

  const appointments = loadAppointments();
  if (!appointments[selectedDate]) appointments[selectedDate] = [];

  appointments[selectedDate].push({ name, service, time });
  saveAppointments(appointments);

  modal.classList.add("hidden");
  document.getElementById("name").value = "";
  document.getElementById("service").value = "";
  document.getElementById("time").value = "";

  showAppointments();
  renderCalendar();
});

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Limpia citas pasadas y genera el calendario inicial
clearPastAppointments();
renderCalendar();
