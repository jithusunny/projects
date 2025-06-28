import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared-styles.js';
import { fetchProjects } from '../services/projects.js';
import '../components/project-card.js';

export class ProjectsPage extends LitElement {
  static pageTitle = 'Projects';
  static breadcrumbItems = [{ label: 'Projects', href: '/projects' }];

  static styles = [sharedStyles, css`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-4);
      margin-top: var(--space-4);
      align-items: stretch;
    }
    project-card {
      min-width: 0;
      height: 100%;
    }
  `];

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
    if (this.loading) return html`<div class="container"><p>Loading...</p></div>`;
    if (this.error) return html`<div class="container"><p>Error: ${this.error}</p></div>`;
    if (!this.projects.length) return html`<div class="container"><p>No projects yet.</p></div>`;
    return html`<div class="container">
      <div class="grid">
        ${this.projects.map(p => html`<project-card .project=${p}></project-card>`)}
      </div>
    </div>`;
  }
}

customElements.define('projects-page', ProjectsPage); 