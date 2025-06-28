import { LitElement, html, css } from 'lit';
import { fetchTasks, deleteTask } from '../services/tasks.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '../components/task-list.js';

export class TasksPage extends LitElement {
  static pageTitle = 'Tasks';
  static breadcrumbItems = [{ label: 'Tasks', href: '/tasks' }];

  static styles = css`
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: var(--space-2);
      border-bottom: var(--border-1);
    }
    th {
      text-align: left;
      font-size: var(--font-size-small);
              color: var(--grey-600);
    }
  `;

  constructor() {
    super();
    this.tasks = [];
    this.loading = true;
    this.error = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.load();
    this.addEventListener('edit:task', e=> this._edit(e.detail.task));
    this.addEventListener('delete:task', e=> this._delete(e.detail.task));
    window.addEventListener('task:created', this._onCreated);
    window.addEventListener('task:updated', this._onCreated);
    window.addEventListener('task:deleted', this._onCreated);
  }

  disconnectedCallback() {
    window.removeEventListener('task:created', this._onCreated);
    window.removeEventListener('task:updated', this._onCreated);
    window.removeEventListener('task:deleted', this._onCreated);
    super.disconnectedCallback();
  }

  _onCreated = () => this.load();

  async load() {
    try {
      this.loading = true;
      this.error = '';
      this.tasks = await fetchTasks();
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  _edit(task) {
    this.dispatchEvent(new CustomEvent('edit:task', { detail: { task }, bubbles: true, composed: true }));
  }

  async _delete(task) {
    if (!confirm('Delete task?')) return;
    try {
      await deleteTask(task.id);
      window.dispatchEvent(new CustomEvent('task:deleted', { detail: { id: task.id } }));
    } catch (e) {
      alert(e.message);
    }
  }

  render() {
    if (this.loading) return html`<p>Loading...</p>`;
    if (this.error) return html`<p>Error: ${this.error}</p>`;
    if (!this.tasks.length) return html`<p>No tasks found.</p>`;
    return html`<task-list .tasks=${this.tasks}></task-list>`;
  }
}

customElements.define('tasks-page', TasksPage); 