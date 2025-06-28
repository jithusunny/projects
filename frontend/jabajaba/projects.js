import { request } from './base.js';

export async function fetchProjects(skip = 0, limit = 100) {
  return request(`/projects/?skip=${skip}&limit=${limit}`);
}

export async function fetchProject(id) {
  return request(`/projects/${id}`);
}

export async function fetchProjectTasks(id) {
  return request(`/projects/${id}/tasks`);
} 