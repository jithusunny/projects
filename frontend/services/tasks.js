import { request } from './base.js';

export const fetchTasks = (skip = 0, limit = 100) => request(`/tasks/?skip=${skip}&limit=${limit}`);

export const createTask = data => request('/tasks/', { method: 'POST', body: JSON.stringify(data) });

export const updateTask = (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });

export const toggleTask = (id, completed) => updateTask(id, { completed }); 