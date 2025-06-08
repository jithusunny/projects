import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace';
setBasePath('/node_modules/@shoelace-style/shoelace/dist');

const API_URL = 'http://localhost:8000/api';
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

async function fetchProject() {
  const res = await fetch(`${API_URL}/projects/${projectId}`);
  const project = await res.json();
  document.getElementById('projectInfo').innerHTML = `
    <h1>${project.name}</h1>
    <p>${project.description || ''}</p>
  `;
  fetchTasks();
}

async function fetchTasks() {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks`);
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  const todo = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);

  // Render todo tasks
  todo.forEach(task => {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';

    const taskInfo = document.createElement('div');
    taskInfo.className = 'task-info';

    const checkbox = document.createElement('sl-checkbox');
    checkbox.checked = task.completed;
    checkbox.addEventListener('sl-change', (e) => {
      updateTaskCompleted(task.id, e.target.checked);
    });

    const title = document.createElement('span');
    title.textContent = task.title;

    taskInfo.appendChild(checkbox);
    taskInfo.appendChild(title);

    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    const editBtn = document.createElement('sl-button');
    editBtn.variant = 'neutral';
    editBtn.size = 'small';
    editBtn.innerHTML = '<sl-icon name="pencil"></sl-icon>';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showEditTaskDialog(task);
    });
    const delBtn = document.createElement('sl-button');
    delBtn.variant = 'danger';
    delBtn.size = 'small';
    delBtn.innerHTML = '<sl-icon name="trash"></sl-icon>';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showDeleteTaskDialog(task);
    });
    taskActions.appendChild(editBtn);
    taskActions.appendChild(delBtn);

    taskCard.appendChild(taskInfo);
    taskCard.appendChild(taskActions);
    taskList.appendChild(taskCard);
  });

  // Render done tasks in a collapsed section
  if (done.length > 0) {
    const doneDetails = document.createElement('sl-details');
    doneDetails.open = false;
    doneDetails.summary = `Done (${done.length})`;
    doneDetails.style.marginTop = '2rem';
    done.forEach(task => {
      const taskCard = document.createElement('div');
      taskCard.className = 'task-card';

      const taskInfo = document.createElement('div');
      taskInfo.className = 'task-info';

      const checkbox = document.createElement('sl-checkbox');
      checkbox.checked = task.completed;
      checkbox.addEventListener('sl-change', (e) => {
        updateTaskCompleted(task.id, e.target.checked);
      });

      const title = document.createElement('span');
      title.textContent = task.title;
      title.style.textDecoration = 'line-through';
      title.style.color = '#666';

      taskInfo.appendChild(checkbox);
      taskInfo.appendChild(title);

      const taskActions = document.createElement('div');
      taskActions.className = 'task-actions';
      const editBtn = document.createElement('sl-button');
      editBtn.variant = 'neutral';
      editBtn.size = 'small';
      editBtn.innerHTML = '<sl-icon name="pencil"></sl-icon>';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showEditTaskDialog(task);
      });
      const delBtn = document.createElement('sl-button');
      delBtn.variant = 'danger';
      delBtn.size = 'small';
      delBtn.innerHTML = '<sl-icon name="trash"></sl-icon>';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteTaskDialog(task);
      });
      taskActions.appendChild(editBtn);
      taskActions.appendChild(delBtn);

      taskCard.appendChild(taskInfo);
      taskCard.appendChild(taskActions);
      doneDetails.appendChild(taskCard);
    });
    taskList.appendChild(doneDetails);
  }
}

async function updateTaskCompleted(id, completed) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  fetchTasks();
}

document.getElementById('newTaskBtn').addEventListener('click', () => {
  showNewTaskDialog();
});

function showNewTaskDialog() {
  const dialog = document.createElement('sl-dialog');
  dialog.label = 'New Task';

  const form = document.createElement('form');
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '1rem';

  const input = document.createElement('sl-input');
  input.label = 'Task Title';
  input.required = true;

  const buttonGroup = document.createElement('div');
  buttonGroup.style.display = 'flex';
  buttonGroup.style.justifyContent = 'flex-end';
  buttonGroup.style.gap = '0.5rem';

  const cancelButton = document.createElement('sl-button');
  cancelButton.variant = 'neutral';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => dialog.hide());

  const submitButton = document.createElement('sl-button');
  submitButton.variant = 'primary';
  submitButton.textContent = 'Create';
  submitButton.type = 'submit';

  buttonGroup.appendChild(cancelButton);
  buttonGroup.appendChild(submitButton);

  form.appendChild(input);
  form.appendChild(buttonGroup);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (title) {
      createTask(title);
      dialog.hide();
    }
  });

  dialog.appendChild(form);
  document.body.appendChild(dialog);
  dialog.show();
}

async function createTask(title) {
  await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  fetchTasks();
}

function showEditTaskDialog(task) {
  const dialog = document.createElement('sl-dialog');
  dialog.label = 'Edit Task';

  const form = document.createElement('form');
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '1rem';

  const input = document.createElement('sl-input');
  input.label = 'Task Title';
  input.required = true;
  input.value = task.title;

  const buttonGroup = document.createElement('div');
  buttonGroup.style.display = 'flex';
  buttonGroup.style.justifyContent = 'flex-end';
  buttonGroup.style.gap = '0.5rem';

  const cancelButton = document.createElement('sl-button');
  cancelButton.variant = 'neutral';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => dialog.hide());

  const submitButton = document.createElement('sl-button');
  submitButton.variant = 'primary';
  submitButton.textContent = 'Save';
  submitButton.type = 'submit';

  buttonGroup.appendChild(cancelButton);
  buttonGroup.appendChild(submitButton);

  form.appendChild(input);
  form.appendChild(buttonGroup);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (title) {
      updateTask(task.id, title);
      dialog.hide();
    }
  });

  dialog.appendChild(form);
  document.body.appendChild(dialog);
  dialog.show();
}

async function updateTask(taskId, title) {
  await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  fetchTasks();
}

function showDeleteTaskDialog(task) {
  const dialog = document.createElement('sl-dialog');
  dialog.label = 'Delete Task';
  dialog.innerHTML = `<div>Are you sure you want to delete <strong>${task.title}</strong>?</div>`;

  const buttonGroup = document.createElement('div');
  buttonGroup.style.display = 'flex';
  buttonGroup.style.justifyContent = 'flex-end';
  buttonGroup.style.gap = '0.5rem';

  const cancelButton = document.createElement('sl-button');
  cancelButton.variant = 'neutral';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => dialog.hide());

  const deleteButton = document.createElement('sl-button');
  deleteButton.variant = 'danger';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    deleteTask(task.id);
    dialog.hide();
  });

  buttonGroup.appendChild(cancelButton);
  buttonGroup.appendChild(deleteButton);
  dialog.appendChild(buttonGroup);
  document.body.appendChild(dialog);
  dialog.show();
}

async function deleteTask(taskId) {
  await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
  fetchTasks();
}

fetchProject(); 