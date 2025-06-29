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
      projectId: { type: String },
      project: { type: Object },
      tasks: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
      breadcrumbs: { type: Array },
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
      margin-bottom: var(--space-6);
    }
    .description {
      color: var(--grey-600);
      flex: 1;
      margin: 0;
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
    }
  `];

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
          ` : ''}
          <sl-dropdown class="actions-menu">
            <sl-button slot="trigger" size="small" variant="text">
              <sl-icon slot="prefix" name="gear"></sl-icon>
              Project Settings
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
}

customElements.define('project-detail-page', ProjectDetailPage); 