import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace';

setBasePath('/node_modules/@shoelace-style/shoelace/dist');

// DOM Elements
const projectsCard = document.getElementById('projectsCard');
const tasksCard = document.getElementById('tasksCard');

// Navigation
if (projectsCard) {
    projectsCard.addEventListener('click', () => {
        window.location.href = '/pages/projects.html';
    });
}

if (tasksCard) {
    tasksCard.addEventListener('click', () => {
        window.location.href = '/pages/tasks.html';
    });
} 