import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace';

setBasePath('/node_modules/@shoelace-style/shoelace/dist');

const API_URL = 'http://localhost:8000/api';

// DOM Elements
const taskList = document.getElementById('taskList');
const newTaskBtn = document.getElementById('newTaskBtn');

// Create a new task
async function createTask(title) {
    try {
        const response = await fetch(`${API_URL}/tasks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, completed: false }),
        });
        if (response.ok) {
            fetchTasks();
        }
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

// Fetch all tasks
async function fetchTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks/`);
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Render tasks
function renderTasks(tasks) {
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
        
        const editButton = document.createElement('sl-button');
        editButton.variant = 'neutral';
        editButton.size = 'small';
        editButton.innerHTML = '<sl-icon name="pencil"></sl-icon>';
        editButton.addEventListener('click', () => {
            showEditTaskDialog(task);
        });
        
        const deleteButton = document.createElement('sl-button');
        deleteButton.variant = 'danger';
        deleteButton.size = 'small';
        deleteButton.innerHTML = '<sl-icon name="trash"></sl-icon>';
        deleteButton.addEventListener('click', () => {
            showDeleteTaskDialog(task);
        });
        
        taskActions.appendChild(editButton);
        taskActions.appendChild(deleteButton);
        
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
            
            const editButton = document.createElement('sl-button');
            editButton.variant = 'neutral';
            editButton.size = 'small';
            editButton.innerHTML = '<sl-icon name="pencil"></sl-icon>';
            editButton.addEventListener('click', () => {
                showEditTaskDialog(task);
            });
            
            const deleteButton = document.createElement('sl-button');
            deleteButton.variant = 'danger';
            deleteButton.size = 'small';
            deleteButton.innerHTML = '<sl-icon name="trash"></sl-icon>';
            deleteButton.addEventListener('click', () => {
                showDeleteTaskDialog(task);
            });
            
            taskActions.appendChild(editButton);
            taskActions.appendChild(deleteButton);
            
            taskCard.appendChild(taskInfo);
            taskCard.appendChild(taskActions);
            
            doneDetails.appendChild(taskCard);
        });
        taskList.appendChild(doneDetails);
    }
}

// Event Listeners
if (newTaskBtn) {
    newTaskBtn.addEventListener('click', () => {
        // Create a dialog for new task
        const dialog = document.createElement('sl-dialog');
        dialog.label = 'New Task';
        
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.gap = '1rem';
        
        const input = document.createElement('sl-input');
        input.name = 'title';
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
    });
}

// Initial load
if (taskList) {
    fetchTasks();
}

// EDIT: Add function to show edit dialog and update task
async function updateTask(id, title) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        });
        if (response.ok) {
            fetchTasks();
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
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

// DELETE: Add function to show delete confirmation and delete task
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            fetchTasks();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
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

async function updateTaskCompleted(id, completed) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed }),
        });
        if (response.ok) {
            fetchTasks();
        }
    } catch (error) {
        console.error('Error updating task status:', error);
    }
} 