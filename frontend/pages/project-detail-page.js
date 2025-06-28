import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared-styles.js';
import { fetchProject, fetchProjectTasks, deleteProject } from '../services/projects.js';
import { deleteTask } from '../services/tasks.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '../components/task-list.js';

export class ProjectDetailPage extends LitElement {
  static pageTitle = 'Project Details';

  static styles = [sharedStyles, css`
    :host {
      display: block;
    }
    h1 {
      font-size: var(--font-size-h2);
      line-height: var(--line-height-lg);
      font-weight: var(--fw-medium);
    }
    p.description { margin-top: var(--space-2); margin-bottom: var(--space-4); max-width: 60ch; }
    h2 { font-weight: var(--fw-semibold); }
    task-list { margin-top: var(--space-1); }
  `];

  static get properties() {
    return {
      projectId: { type: String },
      project: { type: Object },
      tasks: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.project = null;
    this.tasks = [];
    this.loading = true;
    this.error = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.load();
    window.addEventListener('task:created', this._onTaskCreated);
    window.addEventListener('task:updated', this._onTaskCreated);
    window.addEventListener('task:deleted', this._onTaskCreated);
    window.addEventListener('project:updated', this._onProjectUpdated);
    window.addEventListener('project:deleted', this._onProjectDeleted);
    this.addEventListener('edit:task', e=> this._editTask(e.detail.task));
    this.addEventListener('delete:task', e=> this._deleteTask(e.detail.task));
  }

  disconnectedCallback() {
    window.removeEventListener('task:created', this._onTaskCreated);
    window.removeEventListener('task:updated', this._onTaskCreated);
    window.removeEventListener('task:deleted', this._onTaskCreated);
    window.removeEventListener('project:updated', this._onProjectUpdated);
    window.removeEventListener('project:deleted', this._onProjectDeleted);
    super.disconnectedCallback();
  }

  _onTaskCreated = (e) => {
    if (!e.detail?.task) return;
    if (e.detail.task.project_id === this.projectId) this.load();
  }

  _onProjectUpdated = (e) => {
    if (e.detail?.project?.id === this.projectId) this.load();
  };

  _onProjectDeleted = (e) => {
    if (e.detail?.id === this.projectId) {
      window.history.pushState({}, '', '/projects');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  async load() {
    if (!this.projectId) return;
    try {
      this.loading = true;
      this.error = '';
      [this.project, this.tasks] = await Promise.all([
        fetchProject(this.projectId),
        fetchProjectTasks(this.projectId),
      ]);
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  static get breadcrumbItems() {
    return [
      { label: 'Projects', href: '/projects' },
      { label: 'Details', href: window.location.pathname },
    ];
  }

  render() {
    if (this.loading) return html`<p>Loading...</p>`;
    if (this.error) return html`<p>Error: ${this.error}</p>`;
    if (!this.project) return html`<p>Project not found.</p>`;
    return html`
      <div class="container">
        <div style="display:flex;align-items:center;gap:var(--space-2);">
          <h1 style="flex:1;">${this.project.name}</h1>
          <sl-dropdown placement="bottom-end">
            <sl-icon-button slot="trigger" name="three-dots-vertical" label="Project actions"></sl-icon-button>
            <sl-menu @sl-select=${this._projectMenu}>
              <sl-menu-item value="edit">Edit</sl-menu-item>
              <sl-menu-item value="delete">Delete</sl-menu-item>
            </sl-menu>
          </sl-dropdown>
        </div>
        ${this.project.description ? html`<p class="description">${this.project.description}</p>` : ''}

        <h2>Tasks</h2>
        ${this.tasks.length ? html`<sl-card style="background:var(--color-bg); box-shadow:var(--shadow-sm); border:none;">
            <task-list .tasks=${this.tasks}></task-list>
          </sl-card>` : html`<p>No tasks yet.</p>`}
      </div>`;
  }

  _projectMenu = (e) => {
    const action = e.detail.value;
    if (action === 'edit') {
      this._edit();
    } else if (action === 'delete') {
      this._delete();
    }
  }

  _edit() {
    this.dispatchEvent(new CustomEvent('edit:project', { detail: { project: this.project }, bubbles: true, composed: true }));
  }

  async _delete() {
    if (!confirm('Delete this project? All its tasks will also be removed.')) return;
    try {
      await deleteProject(this.projectId);
      window.dispatchEvent(new CustomEvent('project:deleted', { detail: { id: this.projectId } }));
      window.history.pushState({}, '', '/projects');
      window.dispatchEvent(new Event('popstate'));
    } catch (e) {
      alert(e.message);
    }
  }

  _editTask(task) {
    this.dispatchEvent(new CustomEvent('edit:task', { detail: { task }, bubbles: true, composed: true }));
  }

  async _deleteTask(task) {
    if (!confirm('Delete task?')) return;
    try {
      await deleteTask(task.id);
      window.dispatchEvent(new CustomEvent('task:deleted', { detail: { id: task.id } }));
    } catch (e) {
      alert(e.message);
    }
  }
}

customElements.define('project-detail-page', ProjectDetailPage); 