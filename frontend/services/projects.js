import { request } from './base.js';

export const fetchProjects = (skip = 0, limit = 100) => request(`/projects/?skip=${skip}&limit=${limit}`);
export const fetchProject = id => request(`/projects/${id}`);
export const fetchProjectTasks = id => request(`/projects/${id}/tasks`);
export const createProject = data => request('/projects/', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProject = (id) => request(`/projects/${id}`, { method: 'DELETE' }); 