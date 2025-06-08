import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace';

setBasePath('/node_modules/@shoelace-style/shoelace/dist');

const API_URL = 'http://localhost:8000/api';

// DOM Elements
const projectList = document.getElementById('projectList');
const newProjectBtn = document.getElementById('newProjectBtn');

// Fetch all projects
async function fetchProjects() {
    try {
        const response = await fetch(`${API_URL}/projects/`);
        const projects = await response.json();
        renderProjects(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}

// Create a new project
async function createProject(name, description) {
    try {
        const response = await fetch(`${API_URL}/projects/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description }),
        });
        if (response.ok) {
            fetchProjects();
        }
    } catch (error) {
        console.error('Error creating project:', error);
    }
}

// Render projects
function renderProjects(projects) {
    projectList.innerHTML = '';
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        const projectInfo = document.createElement('div');
        projectInfo.className = 'project-info';
        
        const title = document.createElement('h3');
        title.textContent = project.name;
        
        const description = document.createElement('p');
        description.textContent = project.description || 'No description';
        description.style.color = '#666';
        
        projectInfo.appendChild(title);
        projectInfo.appendChild(description);
        
        const projectActions = document.createElement('div');
        projectActions.className = 'project-actions';
        
        const editButton = document.createElement('sl-button');
        editButton.variant = 'neutral';
        editButton.size = 'small';
        editButton.innerHTML = '<sl-icon name="pencil"></sl-icon>';
        editButton.addEventListener('click', () => {
            showEditProjectDialog(project);
        });
        
        const deleteButton = document.createElement('sl-button');
        deleteButton.variant = 'danger';
        deleteButton.size = 'small';
        deleteButton.innerHTML = '<sl-icon name="trash"></sl-icon>';
        deleteButton.addEventListener('click', () => {
            showDeleteProjectDialog(project);
        });
        
        projectActions.appendChild(editButton);
        projectActions.appendChild(deleteButton);
        
        projectCard.appendChild(projectInfo);
        projectCard.appendChild(projectActions);
        
        projectCard.addEventListener('click', (e) => {
            if (e.target.closest('sl-button')) return;
            window.location.href = `/pages/project.html?id=${project.id}`;
        });
        
        projectList.appendChild(projectCard);
    });
}

// EDIT: Add function to show edit dialog and update project
async function updateProject(id, name, description) {
    try {
        const response = await fetch(`${API_URL}/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description }),
        });
        if (response.ok) {
            fetchProjects();
        }
    } catch (error) {
        console.error('Error updating project:', error);
    }
}

function showEditProjectDialog(project) {
    const dialog = document.createElement('sl-dialog');
    dialog.label = 'Edit Project';

    const form = document.createElement('form');
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '1rem';

    const nameInput = document.createElement('sl-input');
    nameInput.label = 'Project Name';
    nameInput.required = true;
    nameInput.value = project.name;

    const descInput = document.createElement('sl-textarea');
    descInput.label = 'Description';
    descInput.value = project.description || '';

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

    form.appendChild(nameInput);
    form.appendChild(descInput);
    form.appendChild(buttonGroup);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        if (name) {
            updateProject(project.id, name, description);
            dialog.hide();
        }
    });

    dialog.appendChild(form);
    document.body.appendChild(dialog);
    dialog.show();
}

// DELETE: Add function to show delete confirmation and delete project
async function deleteProject(id) {
    try {
        const response = await fetch(`${API_URL}/projects/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            fetchProjects();
        }
    } catch (error) {
        console.error('Error deleting project:', error);
    }
}

function showDeleteProjectDialog(project) {
    const dialog = document.createElement('sl-dialog');
    dialog.label = 'Delete Project';
    dialog.innerHTML = `<div>Are you sure you want to delete <strong>${project.name}</strong>?</div>`;

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
        deleteProject(project.id);
        dialog.hide();
    });

    buttonGroup.appendChild(cancelButton);
    buttonGroup.appendChild(deleteButton);
    dialog.appendChild(buttonGroup);
    document.body.appendChild(dialog);
    dialog.show();
}

// Event Listeners
newProjectBtn.addEventListener('click', () => {
    const dialog = document.createElement('sl-dialog');
    dialog.label = 'New Project';

    const form = document.createElement('form');
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '1rem';

    const nameInput = document.createElement('sl-input');
    nameInput.label = 'Project Name';
    nameInput.required = true;

    const descInput = document.createElement('sl-textarea');
    descInput.label = 'Description';

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

    form.appendChild(nameInput);
    form.appendChild(descInput);
    form.appendChild(buttonGroup);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        if (name) {
            createProject(name, description);
            dialog.hide();
        }
    });

    dialog.appendChild(form);
    document.body.appendChild(dialog);
    dialog.show();
});

// Initial load
fetchProjects(); 