const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DEFAULT_COLOR = '#64748b';

async function loadSchedule() {
  const res = await fetch('weeks.json');
  const data = await res.json();

  const sessionsByDay = {};
  DAY_ORDER.forEach(day => { sessionsByDay[day] = []; });

  data.modules.forEach(module => {
    const color = module.color || DEFAULT_COLOR;
    const name = module.module_name;
    const id = module.module_id;

    (module.sessions || []).forEach(session => {
      const day = session.day_of_week;
      if (sessionsByDay[day]) {
        sessionsByDay[day].push({
          ...session,
          moduleName: name,
          moduleId: id,
          color
        });
      }
    });
  });

  DAY_ORDER.forEach(day => {
    sessionsByDay[day].sort((a, b) => {
      const tA = a.time?.start || '00:00';
      const tB = b.time?.start || '00:00';
      return tA.localeCompare(tB);
    });
  });

  renderWeek(sessionsByDay);
}

function renderWeek(sessionsByDay) {
  const weekEl = document.getElementById('week');
  weekEl.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'week-grid';

  DAY_ORDER.forEach(day => {
    const column = document.createElement('div');
    column.className = 'day-column';
    column.innerHTML = `<h2 class="day-title">${day}</h2>`;

    const list = document.createElement('div');
    list.className = 'day-sessions';

    sessionsByDay[day].forEach(session => {
      list.appendChild(createSessionCard(session));
    });

    if (sessionsByDay[day].length === 0) {
      const empty = document.createElement('p');
      empty.className = 'day-empty';
      empty.textContent = 'No sessions';
      list.appendChild(empty);
    }

    column.appendChild(list);
    grid.appendChild(column);
  });

  weekEl.appendChild(grid);
}

function createSessionCard(session) {
  const card = document.createElement('div');
  card.className = 'session-card';
  card.style.setProperty('--accent', session.color);

  const start = session.time?.start ?? '–';
  const end = session.time?.end ?? '–';
  const time = `${start} – ${end}`;

  card.innerHTML = `
    <div class="session-time">${time}</div>
    <div class="session-module">${escapeHtml(session.moduleName)}</div>
    <div class="session-meta">${escapeHtml(session.education_type || '')} · ${escapeHtml(session.place || '')}</div>
  `;

  return card;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

loadSchedule().catch(err => {
  document.getElementById('week').innerHTML = `<p class="error">Could not load schedule: ${err.message}</p>`;
});

document.getElementById('to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
