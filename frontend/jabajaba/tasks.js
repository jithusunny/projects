import { request } from './base.js';

export async function fetchTasks(skip = 0, limit = 100) {
  return request(`/tasks/?skip=${skip}&limit=${limit}`);
} 