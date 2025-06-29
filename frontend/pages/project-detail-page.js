import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared-styles.js';
import { fetchProject, fetchProjectTasks, deleteProject } from '../services/projects.js';
import { deleteTask } from '../services/tasks.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '../components/task-list.js';

export class ProjectDetailPage extends LitElement {
  static get properties() {
    return {
      params: { type: Object },
      project: { type: Object, state: true },
      tasks: { type: Array, state: true },
      loading: { type: Boolean, state: true },
      error: { type: String, state: true }
    };
  }

  static styles = [sharedStyles, css`
    :host {
      display: block;
    }
    .project-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      margin: var(--space-3) 0 var(--space-4);
    }
    .description {
      color: var(--grey-600);
      margin: 0;
      flex: 1;
    }
    .tasks-section {
      background: var(--color-bg);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
    }
    .tasks-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }
    h2 {
      font-size: var(--font-size-h3);
      font-weight: var(--fw-semibold);
      margin: 0;
    }
    task-list {
      margin-top: var(--space-2);
    }
    task-list::part(task-item) {
      border-radius: var(--radius-sm);
      transition: background-color 0.2s ease;
    }
    task-list::part(task-item):hover {
      background-color: var(--grey-50);
    }
    .actions-menu::part(base) {
      color: var(--grey-700);
      font-size: var(--font-size-small);
    }
    .actions-menu sl-icon {
      font-size: var(--icon-sm);
      width: var(--icon-sm);
      height: var(--icon-sm);
    }
    .actions-menu sl-menu-item::part(base) {
      font-size: var(--font-size-small);
      color: var(--grey-600);
      padding: var(--space-2) var(--space-3);
    }
    .actions-menu sl-menu-item::part(prefix) {
      color: var(--grey-500);
    }
  `];

  constructor() {
    super();
    this.project = null;
    this.tasks = [];
    this.loading = true;
    this.error = '';
  }

  get projectId() {
    return this.params?.id;
  }

  connectedCallback() {
    super.connectedCallback();
    this.load();
    window.addEventListener('task:created', this._onTaskChanged);
    window.addEventListener('task:updated', this._onTaskChanged);
    window.addEventListener('task:deleted', this._onTaskChanged);
    window.addEventListener('project:updated', this._onProjectUpdated);
    window.addEventListener('project:deleted', this._onProjectDeleted);
    this.addEventListener('edit:task', e => this._editTask(e.detail.task));
    this.addEventListener('delete:task', e => this._deleteTask(e.detail.task));
  }

  disconnectedCallback() {
    window.removeEventListener('task:created', this._onTaskChanged);
    window.removeEventListener('task:updated', this._onTaskChanged);
    window.removeEventListener('task:deleted', this._onTaskChanged);
    window.removeEventListener('project:updated', this._onProjectUpdated);
    window.removeEventListener('project:deleted', this._onProjectDeleted);
    super.disconnectedCallback();
  }

  _onTaskChanged = (e) => {
    if (!e.detail?.task) return;
    if (e.detail.task.project_id === this.projectId) this.load();
  }

  _onProjectUpdated = (e) => {
    if (e.detail?.project?.id === this.projectId) this.load();
  };

  _onProjectDeleted = (e) => {
    if (e.detail?.id === this.projectId) {
      window.history.pushState({}, '', '/projects');
      this.dispatchEvent(new CustomEvent('app:navigate', { 
        bubbles: true, 
        composed: true 
      }));
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
      // Update breadcrumbs with project name
      this.dispatchEvent(new CustomEvent('update-navigation', { 
        detail: { 
          title: this.project.name,
          breadcrumbs: [
            { label: 'Projects', href: '/projects' },
            { label: this.project.name, href: window.location.pathname }
          ]
        },
        bubbles: true, 
        composed: true 
      }));
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  render() {
    if (this.loading) return html`<p>Loading...</p>`;
    if (this.error) return html`<p>Error: ${this.error}</p>`;
    if (!this.project) return html`<p>Project not found.</p>`;

    return html`
      <div class="container">
        <div class="project-header">
          ${this.project.description ? html`
            <p class="description">${this.project.description}</p>
          ` : html`<div class="description"></div>`}
          <sl-dropdown class="actions-menu">
            <sl-button slot="trigger" size="small" variant="text">
              <sl-icon slot="prefix" name="gear"></sl-icon>
              Settings
              <sl-icon slot="suffix" name="chevron-down"></sl-icon>
            </sl-button>
            <sl-menu @sl-select=${this._handleAction}>
              <sl-menu-item value="edit">
                <sl-icon slot="prefix" name="pencil"></sl-icon>
                Edit Project
              </sl-menu-item>
              <sl-menu-item value="delete">
                <sl-icon slot="prefix" name="trash"></sl-icon>
                Delete Project
              </sl-menu-item>
            </sl-menu>
          </sl-dropdown>
        </div>

        <div class="tasks-section">
          <div class="tasks-header">
            <h2>Tasks</h2>
            <sl-button size="small" variant="primary" @click=${this._createTask}>
              <sl-icon slot="prefix" name="plus"></sl-icon>
              Add Task
            </sl-button>
          </div>

          ${this.tasks.length ? html`
            <task-list 
              .tasks=${this.tasks}
              @edit:task=${this._editTask}
              @delete:task=${this._deleteTask}
            ></task-list>
          ` : html`
            <p>No tasks yet. Click "Add Task" to create one.</p>
          `}
        </div>
      </div>
    `;
  }

  _createTask() {
    this.dispatchEvent(new CustomEvent('create:task', {
      detail: { projectId: this.projectId },
      bubbles: true,
      composed: true
    }));
  }

  _editTask(e) {
    this.dispatchEvent(new CustomEvent('edit:task', {
      detail: { task: e.detail.task },
      bubbles: true,
      composed: true
    }));
  }

  async _deleteTask(e) {
    try {
      await deleteTask(e.detail.task.id);
      this.tasks = this.tasks.filter(t => t.id !== e.detail.task.id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }

  _handleAction(e) {
    const action = e.detail.item.value;
    if (action === 'edit') {
      this.dispatchEvent(new CustomEvent('edit:project', {
        detail: { project: this.project },
        bubbles: true,
        composed: true
      }));
    } else if (action === 'delete') {
      if (!confirm('Delete this project? All its tasks will also be removed.')) return;
      this._deleteProject();
    }
  }

  async _deleteProject() {
    try {
      await deleteProject(this.projectId);
      window.history.pushState({}, '', '/projects');
      this.dispatchEvent(new CustomEvent('app:navigate', { 
        bubbles: true, 
        composed: true 
      }));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  }

  willUpdate(changedProps) {
    if (changedProps.has('params') && this.projectId) {
      this.load();
    }
  }
}

customElements.define('project-detail-page', ProjectDetailPage); 