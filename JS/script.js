function uid() {
  return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

const selectors = {
  form: '#todo-form',
  input: '#todo-input',
  date: '#date-input',
  addBtn: '#add-btn',
  clearBtn: '#clear-btn',
  todoList: '#todo-list',
  error: '#form-error',
  emptyMsg: '#empty-message',
  search: '#search-input',
  filterStatus: '#filter-status',
};

let todos = [];

function loadTodos() {
  const raw = localStorage.getItem('todos');
  todos = raw ? JSON.parse(raw) : [];
}
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
  const listEl = document.querySelector(selectors.todoList);
  const empty = document.querySelector(selectors.emptyMsg);
  listEl.innerHTML = '';

  const search = document.querySelector(selectors.search).value.trim().toLowerCase();
  const status = document.querySelector(selectors.filterStatus).value;

  const filtered = todos.filter(t => {
    if (status === 'pending' && t.completed) return false;
    if (status === 'completed' && !t.completed) return false;
    if (search && !t.text.toLowerCase().includes(search)) return false;
    return true;
  });

  empty.style.display = filtered.length === 0 ? 'block' : 'none';

  filtered.forEach(item => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (item.completed ? ' completed' : '');
    li.dataset.id = item.id;

    li.innerHTML = `
      <div class="todo-main">
        <input type="checkbox" class="complete-toggle" ${item.completed ? 'checked' : ''}>
        <span class="todo-text">${escapeHtml(item.text)} (${item.date})</span>
      </div>
      <div class="todo-actions">
        <button class="btn-toggle">${item.completed ? '↺' : '✔'}</button>
        <button class="btn-delete">✖</button>
      </div>
    `;

    li.querySelector('.complete-toggle').addEventListener('change', () => toggleComplete(item.id));
    li.querySelector('.btn-toggle').addEventListener('click', () => toggleComplete(item.id));
    li.querySelector('.btn-delete').addEventListener('click', () => {
      if (confirm('Yakin hapus tugas ini?')) deleteTodo(item.id);
    });

    listEl.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

function addTodo(text, date) {
  todos.push({ id: uid(), text: text.trim(), date, completed: false });
  saveTodos();
  renderTodos();
}
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}
function toggleComplete(id) {
  const t = todos.find(x => x.id === id);
  if (t) t.completed = !t.completed;
  saveTodos();
  renderTodos();
}
function clearAll() {
  if (confirm('Hapus semua tugas?')) {
    todos = [];
    saveTodos();
    renderTodos();
  }
}

function validateInputs(text, date) {
  const err = document.querySelector(selectors.error);
  err.textContent = '';
  if (!text.trim()) { err.textContent = 'Tugas tidak boleh kosong'; return false; }
  if (!date) { err.textContent = 'Pilih tanggal'; return false; }
  return true;
}

function attachListeners() {
  const form = document.querySelector(selectors.form);
  const input = document.querySelector(selectors.input);
  const dateIn = document.querySelector(selectors.date);
  const clearBtn = document.querySelector(selectors.clearBtn);
  const search = document.querySelector(selectors.search);
  const filterStatus = document.querySelector(selectors.filterStatus);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value, date = dateIn.value;
    if (!validateInputs(text, date)) return;
    addTodo(text, date);
    input.value = ''; dateIn.value = '';
  });

  clearBtn.addEventListener('click', clearAll);
  search.addEventListener('input', renderTodos);
  filterStatus.addEventListener('change', renderTodos);
}

document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  attachListeners();
  renderTodos();
});
