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

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  calendar.innerHTML = "";
  monthYearEl.textContent = `${currentDate.toLocaleString("default", { month: "long" })} ${year}`;

  const appointments = loadAppointments();

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (year === today.getFullYear() && month === today.getMonth() && isPast) {
      continue; // 👈 Saltar días pasados solo en el mes actual
    }

    const dayEl = document.createElement("div");
    dayEl.className = "day";
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
  selectedDateEl.textContent = `Citas del ${day}/${month + 1}/${year}`;
  showAppointments();
  dayView.classList.remove("hidden");
}

function showAppointments() {
  const appointments = loadAppointments();
  const dayAppointments = appointments[selectedDate] || [];

  appointmentsContainer.innerHTML = "";

  dayAppointments.forEach((appt, index) => {
    const el = document.createElement("div");
    el.className = "appointment";
    el.textContent = `${appt.time} - ${appt.name} (${appt.service})`;

    // 👉 Botón eliminar
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
      dayAppointments.splice(index, 1); // elimina la cita
      appointments[selectedDate] = dayAppointments;
      saveAppointments(appointments);
      showAppointments(); // recarga las citas del día
      renderCalendar();   // actualiza los indicadores del calendario
    });

    el.appendChild(deleteBtn);
    appointmentsContainer.appendChild(el);
  });
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
  showAppointments();
  renderCalendar(); // refresca el contador de citas
});

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();
