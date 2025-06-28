import { request } from './base.js';

export const exportData = () => request('/admin/export/');

export const importData = (files) => {
  const fd = new FormData();
  files.forEach(f => fd.append('files', f));
  return request('/admin/import/', { method: 'POST', body: fd, headers: {} });
};

export const deleteAll = () => request('/admin/delete_all/', { method: 'POST' }); 