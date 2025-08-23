// Workout Tracker App

// Preset exercises
const exercises = [
  { name: 'Bench Press', type: 'weight' },
  { name: 'Overhead Press', type: 'weight' },
  { name: 'Chest Fly', type: 'weight' },
  { name: 'Lat Pulldown', type: 'weight' },
  { name: 'Assisted Pull-ups', type: 'weight' },
  { name: 'Crunch', type: 'weight' },
  { name: 'Quad Lifts', type: 'weight' },
  { name: 'Hamstring Curls', type: 'weight' },
  { name: 'Arm Curl', type: 'weight' },
  { name: 'Squat', type: 'weight' },
  { name: 'Deadlift', type: 'weight' },
  { name: 'Treadmill', type: 'cardio' },
  { name: 'Outdoor Walking', type: 'cardio' },
  { name: 'Cycling', type: 'cardio' },
  { name: 'Rowing', type: 'cardio' }
];

// Local storage key
const STORAGE_KEY = 'workoutHistory';

// Load history from localStorage
function loadHistory() {
  const history = localStorage.getItem(STORAGE_KEY);
  return history ? JSON.parse(history) : [];
}

// Save history to localStorage
function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// Create main app container
const app = document.createElement('div');
app.id = 'workout-app';
document.body.appendChild(app);

// Function to render home screen
function renderHome() {
  app.innerHTML = `
    <h1>Workout Tracker</h1>
    <div class="tabs">
      <button id="new-session-tab" class="tab-button">New Session</button>
      <button id="history-tab" class="tab-button">History</button>
    </div>
  `;

  document.getElementById('new-session-tab').addEventListener('click', () => startNewSession(false));
  document.getElementById('history-tab').addEventListener('click', viewHistory);
}

// Function to start a new session
function startNewSession(isActive = false) {
  const now = new Date();
  const session = {
    date: now.toISOString().replace('T', ' ').replace(/\..+/, ''), // Format as "2025-08-23 11:00:00"
    exercises: []
  };

  app.innerHTML = `
    <h1>Workout Tracker</h1>
    <div class="tabs">
      <button id="new-session-tab" class="tab-button active">New Session</button>
      <button id="history-tab" class="tab-button">History</button>
    </div>
    <div id="session-content">
      ${!isActive ? '<p>No active session</p><button id="start-session-btn" class="primary-btn">Start Session</button>' : `
        <select id="exercise-select">
          <option value="">Select Exercise</option>
          ${exercises.map((ex, index) => {
            const option = `<option value="${ex.name}" data-type="${ex.type}">${ex.name}</option>`;
            return index === 10 ? `${option}<option disabled>-------------------</option>` : option;
          }).join('')}
        </select>
        <div id="input-fields"></div>
        <button id="add-exercise" class="primary-btn" disabled>Add Set</button>
        <button id="undo" class="secondary-btn">Undo</button>
        <ul id="current-exercises"></ul>
        <button id="finish-session" class="primary-btn">Finish Session</button>
      `}
    </div>
  `;

  // Re-attach tab listeners
  document.getElementById('new-session-tab').addEventListener('click', () => startNewSession(isActive));
  document.getElementById('history-tab').addEventListener('click', viewHistory);

  if (!isActive) {
    document.getElementById('start-session-btn').addEventListener('click', () => startNewSession(true));
    return;
  }

  const select = document.getElementById('exercise-select');
  const inputFields = document.getElementById('input-fields');
  const addBtn = document.getElementById('add-exercise');
  const currentList = document.getElementById('current-exercises');
  const undoBtn = document.getElementById('undo');
  let lastWeight = 0;
  let lastReps = 10; // Default rep value
  let lastDuration = 0; // Default duration value

  select.addEventListener('change', () => {
    const selectedOption = select.options[select.selectedIndex];
    const type = selectedOption.dataset.type;
    inputFields.innerHTML = '';
    addBtn.disabled = false;

    if (type === 'weight') {
      inputFields.innerHTML = `
        <div class="input-group">
          <label>Weight (kg)</label>
          <input type="text" id="weight" value="${lastWeight}" min="0">
          <div class="adjust-buttons">
            <button id="weight-dec-5">-5</button>
            <button id="weight-dec-2.5">-2.5</button>
            <button id="weight-inc-2.5">+2.5</button>
            <button id="weight-inc-5">+5</button>
          </div>
        </div>
        <div class="input-group">
          <label>Reps</label>
          <input type="text" id="reps" value="${lastReps}" min="0">
          <div class="adjust-buttons">
            <button id="reps-5">5</button>
            <button id="reps-8">8</button>
            <button id="reps-10">10</button>
            <button id="reps-12">12</button>
            <button id="reps-15">15</button>
          </div>
        </div>
      `;
      // Weight adjustment listeners
      document.getElementById('weight-dec-5').addEventListener('click', () => {
        const weightInput = document.getElementById('weight');
        const currentWeight = parseFloat(weightInput.value) || 0;
        if (currentWeight >= 5) weightInput.value = currentWeight - 5;
      });
      document.getElementById('weight-dec-2.5').addEventListener('click', () => {
        const weightInput = document.getElementById('weight');
        const currentWeight = parseFloat(weightInput.value) || 0;
        if (currentWeight >= 2.5) weightInput.value = currentWeight - 2.5;
      });
      document.getElementById('weight-inc-2.5').addEventListener('click', () => {
        const weightInput = document.getElementById('weight');
        weightInput.value = (parseFloat(weightInput.value) || 0) + 2.5;
      });
      document.getElementById('weight-inc-5').addEventListener('click', () => {
        const weightInput = document.getElementById('weight');
        weightInput.value = (parseFloat(weightInput.value) || 0) + 5;
      });
      // Reps adjustment listeners
      document.getElementById('reps-5').addEventListener('click', () => {
        document.getElementById('reps').value = 5;
      });
      document.getElementById('reps-8').addEventListener('click', () => {
        document.getElementById('reps').value = 8;
      });
      document.getElementById('reps-10').addEventListener('click', () => {
        document.getElementById('reps').value = 10;
      });
      document.getElementById('reps-12').addEventListener('click', () => {
        document.getElementById('reps').value = 12;
      });
      document.getElementById('reps-15').addEventListener('click', () => {
        document.getElementById('reps').value = 15;
      });
    } else if (type === 'cardio') {
      inputFields.innerHTML = `
        <div class="input-group">
          <label>Duration (minutes)</label>
          <input type="text" id="duration" value="${lastDuration}" min="0">
          <div class="adjust-buttons">
            <button id="duration-dec-5">-5</button>
            <button id="duration-dec-1">-1</button>
            <button id="duration-inc-1">+1</button>
            <button id="duration-inc-5">+5</button>
          </div>
        </div>
      `;
      // Duration adjustment listeners
      document.getElementById('duration-dec-5').addEventListener('click', () => {
        const durationInput = document.getElementById('duration');
        const current = parseFloat(durationInput.value) || 0;
        if (current >= 5) durationInput.value = current - 5;
      });
      document.getElementById('duration-dec-1').addEventListener('click', () => {
        const durationInput = document.getElementById('duration');
        const current = parseFloat(durationInput.value) || 0;
        if (current >= 1) durationInput.value = current - 1;
      });
      document.getElementById('duration-inc-1').addEventListener('click', () => {
        const durationInput = document.getElementById('duration');
        durationInput.value = (parseFloat(durationInput.value) || 0) + 1;
      });
      document.getElementById('duration-inc-5').addEventListener('click', () => {
        const durationInput = document.getElementById('duration');
        durationInput.value = (parseFloat(durationInput.value) || 0) + 5;
      });
    }
  });

  addBtn.addEventListener('click', () => {
    const name = select.value;
    if (!name) return;

    const type = select.options[select.selectedIndex].dataset.type;
    let exerciseData = { name };

    if (type === 'weight') {
      const weight = document.getElementById('weight').value;
      const reps = document.getElementById('reps').value;
      if (!weight || !reps) return alert('Enter weight and reps');
      exerciseData.weight = weight;
      exerciseData.reps = reps;
      lastWeight = parseFloat(weight); // Persist last weight
      lastReps = parseInt(reps); // Persist last reps
    } else if (type === 'cardio') {
      const duration = document.getElementById('duration').value;
      if (!duration) return alert('Enter duration');
      exerciseData.duration = duration;
      lastDuration = parseFloat(duration); // Persist last duration
    }

    session.exercises.push(exerciseData);

    // Update current list
    const li = document.createElement('li');
    li.textContent = `${name}: ${type === 'weight' ? `${exerciseData.weight} kg x ${exerciseData.reps} reps` : `${exerciseData.duration} min`}`;
    currentList.appendChild(li);

    // No reset for inputs to persist values
  });

  undoBtn.addEventListener('click', () => {
    if (session.exercises.length > 0) {
      session.exercises.pop();
      if (currentList.lastChild) currentList.removeChild(currentList.lastChild);
    }
  });

  document.getElementById('finish-session').addEventListener('click', () => {
    if (session.exercises.length > 0) {
      const history = loadHistory();
      history.push(session);
      saveHistory(history);
    }
    renderHome();
  });
}

// Function to export history as CSV
function exportHistory() {
  const history = loadHistory();
  if (history.length === 0) return;

  const csvRows = [];
  // Headers
  csvRows.push(['Date', 'Exercise', 'Weight (kg)', 'Reps', 'Duration (min)']);

  // Data rows
  history.forEach(session => {
    session.exercises.forEach(exercise => {
      const row = [
        session.date.replace(/,.*$/, ''), // Remove time portion if still present
        exercise.name,
        exercise.weight || '',
        exercise.reps || '',
        exercise.duration || ''
      ];
      csvRows.push(row);
    });
  });

  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workout_history.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

// Function to view history
function viewHistory() {
  const history = loadHistory();

  app.innerHTML = `
    <h1>Workout Tracker</h1>
    <div class="tabs">
      <button id="new-session-tab" class="tab-button">New Session</button>
      <button id="history-tab" class="tab-button active">History</button>
    </div>
    <div id="session-content">
      <ul id="history-list">
        ${history.map((sess, index) => `<li><button data-index="${index}">${sess.date}</button></li>`).join('')}
      </ul>
      <div id="session-details"></div>
      <button id="export-history" class="secondary-btn">Export History</button>
      <button id="back-home" class="secondary-btn">Back</button>
    </div>
  `;

  // Re-attach tab listeners
  document.getElementById('new-session-tab').addEventListener('click', () => startNewSession(false));
  document.getElementById('history-tab').addEventListener('click', viewHistory);

  const details = document.getElementById('session-details');
  const listItems = document.querySelectorAll('#history-list button');

  listItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const index = btn.dataset.index;
      const sess = history[index];
      details.innerHTML = `
        <h2>${sess.date}</h2>
        <ul>
          ${sess.exercises.map(ex => `
            <li>${ex.name}: ${ex.weight ? `${ex.weight} kg x ${ex.reps} reps` : `${ex.duration} min`}</li>
          `).join('')}
        </ul>
      `;
    });
  });

  document.getElementById('back-home').addEventListener('click', renderHome);
  document.getElementById('export-history').addEventListener('click', exportHistory);
}

// Initial render
renderHome();
