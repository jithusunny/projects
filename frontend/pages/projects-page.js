import { LitElement, html, css } from 'lit';
import { fetchProjects } from '../services/projects.js';
import '../components/project-card.js';

export class ProjectsPage extends LitElement {
  static pageTitle = 'Projects';
  static breadcrumbItems = [{ label: 'Projects', href: '/projects' }];

  static styles = css`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: var(--space-3);
    }
  `;

  constructor() {
    super();
    this.projects = [];
    this.loading = true;
    this.error = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.load();
    window.addEventListener('project:created', this._onCreated);
    window.addEventListener('project:updated', this._onCreated);
    window.addEventListener('project:deleted', this._onCreated);
  }

  disconnectedCallback() {
    window.removeEventListener('project:created', this._onCreated);
    window.removeEventListener('project:updated', this._onCreated);
    window.removeEventListener('project:deleted', this._onCreated);
    super.disconnectedCallback();
  }

  _onCreated = () => this.load();

  async load() {
    try {
      this.loading = true;
      this.error = '';
      this.projects = await fetchProjects();
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
    if (!this.projects.length) return html`<p>No projects yet.</p>`;
    return html`<div class="grid">
      ${this.projects.map(p => html`<project-card .project=${p}></project-card>`)}
    </div>`;
  }
}

customElements.define('projects-page', ProjectsPage); 