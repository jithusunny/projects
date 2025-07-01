import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared-styles.js';
import { fetchProjects } from '../services/projects.js';
import '../components/project-card.js';
import '../components/project-form.js';

export class ProjectsPage extends LitElement {
  static properties = {
    projects: { type: Array },
    loading: { type: Boolean },
    error: { type: String },
    _focusedIndex: { state: true }
  };

  static pageTitle = 'Projects';
  static breadcrumbItems = [{ label: 'Projects', href: '/projects' }];

  static styles = [sharedStyles, css`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-4);
      padding: var(--space-4);
    }
    project-card:focus-within {
      outline: none;
    }
    project-card {
      height: 100%;
    }
  `];

  constructor() {
    super();
    this.projects = [];
    this.loading = true;
    this.error = '';
    this._focusedIndex = -1;
    this._onProjectEvent = this._onProjectEvent.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadProjects();
    window.addEventListener('project:created', this._onProjectEvent);
    window.addEventListener('project:updated', this._onProjectEvent);
    window.addEventListener('project:deleted', this._onProjectEvent);
  }

  disconnectedCallback() {
    window.removeEventListener('project:created', this._onProjectEvent);
    window.removeEventListener('project:updated', this._onProjectEvent);
    window.removeEventListener('project:deleted', this._onProjectEvent);
    super.disconnectedCallback();
  }

  async _loadProjects() {
    try {
      this.loading = true;
      this.error = '';
      this.projects = await fetchProjects();
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  _onProjectEvent(event) {
    // Reload projects to get fresh data
    this._loadProjects();
    
    // If it was a deletion, handle focus
    if (event.type === 'project:deleted' && this._focusedIndex >= this.projects.length) {
      this._focusedIndex = Math.max(0, this.projects.length - 1);
      if (this.projects.length > 0) {
        requestAnimationFrame(() => {
          this.renderRoot.querySelectorAll('project-card')[this._focusedIndex]
            ?.renderRoot?.querySelector('.card-wrapper')
            ?.focus();
        });
      }
    }
  }

  _handleKeyDown(e) {
    if (!this.projects?.length) return;
    
    const gridColumns = Math.floor(this.renderRoot.querySelector('.grid').offsetWidth / 300);
    const currentIndex = this._focusedIndex === -1 ? 0 : this._focusedIndex;
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
        newIndex = Math.min(currentIndex + 1, this.projects.length - 1);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + gridColumns, this.projects.length - 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - gridColumns, 0);
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      e.preventDefault();
      this._focusedIndex = newIndex;
      this.renderRoot.querySelectorAll('project-card')[newIndex]
        ?.renderRoot?.querySelector('.card-wrapper')
        ?.focus();
    }
  }

  _handleProjectClick(project) {
    window.history.pushState({}, '', `/projects/${project.id}`);
    window.dispatchEvent(new CustomEvent('app:navigate'));
  }

  render() {
    if (this.loading) {
      return html`<sl-spinner></sl-spinner>`;
    }

    if (this.error) {
      return html`<sl-alert variant="danger" open>${this.error}</sl-alert>`;
    }

    if (!this.projects.length) {
      return html`<sl-alert variant="neutral" open>No projects yet.</sl-alert>`;
    }

    return html`
      <div class="grid" @keydown=${this._handleKeyDown}>
        ${this.projects.map((project, index) => html`
          <project-card 
            .project=${project}
            tabindex="0"
            @click=${() => this._handleProjectClick(project)}
          ></project-card>
        `)}
      </div>
    `;
  }
}

customElements.define('projects-page', ProjectsPage); 