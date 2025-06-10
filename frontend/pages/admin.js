import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace';

setBasePath('/node_modules/@shoelace-style/shoelace/dist');

const API_URL = 'http://localhost:8000/api';

const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');

if (importBtn) {
  importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.multiple = true;
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', async () => {
      if (input.files.length === 0) return;
      const formData = new FormData();
      for (const file of input.files) {
        formData.append('files', file);
      }
      try {
        const res = await fetch(`${API_URL}/admin/import/`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Import failed');
        const data = await res.json();
        const files = data.imported.join(', ');
        showToast(`Imported: ${files}`);
      } catch (err) {
        showToast('Import failed', 'danger');
      }
      document.body.removeChild(input);
    });
    input.click();
  });
}

if (exportBtn) {
  exportBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_URL}/admin/export/`);
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const files = data.exported.join(', ');
      showToast(`Exported: ${files}`);
    } catch (err) {
      showToast('Export failed', 'danger');
    }
  });
}

if (deleteAllBtn) {
  deleteAllBtn.addEventListener('click', () => {
    const dialog = document.createElement('sl-dialog');
    dialog.label = 'Delete All Data';
    dialog.innerHTML = `
      <div style="margin-bottom:1rem;">Are you sure you want to <b>permanently delete</b> all projects and tasks? This action cannot be undone.</div>
      <sl-button slot="footer" variant="danger" id="confirmDeleteBtn">Delete All Data</sl-button>
      <sl-button slot="footer" variant="neutral" id="cancelDeleteBtn">Cancel</sl-button>
    `;
    document.body.appendChild(dialog);
    dialog.show();
    dialog.querySelector('#cancelDeleteBtn').addEventListener('click', () => dialog.hide());
    dialog.querySelector('#confirmDeleteBtn').addEventListener('click', async () => {
      dialog.hide();
      try {
        const res = await fetch(`${API_URL}/admin/delete_all/`, { method: 'POST' });
        if (!res.ok) throw new Error('Delete failed');
        showToast('All data deleted', 'success');
      } catch (err) {
        showToast('Delete failed', 'danger');
      }
      document.body.removeChild(dialog);
    });
  });
}

function showToast(message, variant = 'success') {
  const toast = document.createElement('sl-alert');
  toast.variant = variant;
  toast.duration = 4000;
  toast.closable = true;
  toast.innerHTML = `<sl-icon slot="icon" name="info-circle"></sl-icon> ${message}`;
  document.body.appendChild(toast);
  toast.toast();
} 