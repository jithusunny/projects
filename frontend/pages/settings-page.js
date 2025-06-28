import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import { exportData, importData, deleteAll } from '../services/admin.js';

export class SettingsPage extends LitElement {
  static pageTitle = 'Settings';
  static breadcrumbItems = [{ label: 'Settings', href: '/settings' }];

  static styles = css`
    .grid {
      display: grid;
      gap: var(--space-4);
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
    sl-card::part(base) {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
  `;

  render() {
    return html`
      <div class="grid">
        <sl-card>
          <strong>Export Data</strong>
          <sl-button variant="primary" @click=${this._export}>Download CSVs</sl-button>
        </sl-card>

        <sl-card>
          <strong>Import Data</strong>
          <input type="file" id="importInput" multiple />
          <sl-button variant="primary" @click=${this._import}>Upload</sl-button>
        </sl-card>

        <sl-card>
          <strong>Delete All Data</strong>
          <sl-button variant="danger" @click=${this._confirmDelete}>Delete</sl-button>
        </sl-card>
      </div>

      <sl-dialog label="Confirm Delete" id="confirmDlg">
        All projects and tasks will be permanently removed. Are you sure?
        <sl-button slot="footer" variant="primary" @click=${this._doDelete}>Yes, delete</sl-button>
      </sl-dialog>`;
  }

  async _export() {
    try {
      const res = await exportData();
      (res.exported || []).forEach(filename => {
        window.open(`/exports/${filename}`, '_blank');
      });
    } catch (e) {
      alert(e.message);
    }
  }

  async _import() {
    const input = this.renderRoot.querySelector('#importInput');
    if (!input.files.length) {
      alert('Select one or more CSV files');
      return;
    }
    try {
      await importData(Array.from(input.files));
      alert('Import successful');
    } catch (e) {
      alert(e.message);
    }
  }

  _confirmDelete() {
    this.renderRoot.querySelector('#confirmDlg').show();
  }

  async _doDelete() {
    try {
      await deleteAll();
      alert('All data deleted');
    } catch (e) {
      alert(e.message);
    }
    this.renderRoot.querySelector('#confirmDlg').hide();
  }
}

customElements.define('settings-page', SettingsPage); 