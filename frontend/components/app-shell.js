import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared-styles.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import './plus-menu.js';
import './breadcrumb-trail.js';
import './project-form.js';
import './task-form.js';
import './search-dialog.js';

export class AppShell extends LitElement {
  static properties = {
    pageTitle: { type: String },
    breadcrumbs: { type: Array },
  };

  static styles = [sharedStyles, css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: var(--border-1);
      background: var(--color-bg);
    }
    header .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding-top: var(--space-3);
      padding-bottom: var(--space-3);
    }
    a.logo-link {
      font-size: var(--font-size-h3);
      line-height: var(--line-height-md);
    }
    sl-icon-button::part(base), plus-menu sl-icon-button::part(base) {
      font-size: var(--space-4);
      padding: var(--space-2);
    }
    sl-icon-button::part(base) sl-icon, plus-menu sl-icon-button::part(base) sl-icon {
      width: var(--space-4);
      height: var(--space-4);
    }
    .title {
      flex: 1;
      text-align: center;
      font-weight: var(--fw-semibold);
      font-size: var(--font-size-h3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
    }
    .title sl-icon {
      color: var(--grey-600);
      font-size: var(--font-size-h3);
    }
    .left, .right {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    nav {
      background: var(--grey-50);
    }
    nav .container {
      padding-top: var(--space-2);
      padding-bottom: var(--space-2);
    }
    main {
      flex: 1;
      overflow: auto;
      background: var(--grey-50);
    }
    a.logo-link {
      text-decoration: none;
      color: inherit;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
    a.logo-link sl-icon {
      font-size: var(--font-size-h3);
      width: var(--font-size-h3);
      height: var(--font-size-h3);
      display: flex;
      align-items: center;
    }
  `];

  constructor() {
    super();
    this.pageTitle = '';
    this.breadcrumbs = [];
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.addEventListener('create:project', () => {
      this.shadowRoot.querySelector('project-form').show();
    });
    this.addEventListener('create:task', (e) => {
      const form = this.shadowRoot.querySelector('task-form');
      form.show({ projectId: e.detail.projectId || null });
    });
    this.addEventListener('edit:project', (e) => {
      const form = this.shadowRoot.querySelector('project-form');
      form.show(e.detail.project);
    });
    this.addEventListener('edit:task', (e) => {
      const form = this.shadowRoot.querySelector('task-form');
      form.show({ projectId: e.detail.task.project_id ?? null, task: e.detail.task });
    });
    this.addEventListener('update-navigation', (e) => {
      this.pageTitle = e.detail.title;
      this.breadcrumbs = e.detail.breadcrumbs;
    });
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this._handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this._handleKeyDown);
  }

  _handleKeyDown(e) {
    // Don't trigger if typing in a form control or if modifier keys are pressed
    const composedPath = e.composedPath();
    const isFormControl = composedPath.some(el => {
      if (!el.tagName) return false;
      const tag = el.tagName.toLowerCase();
      
      // Check for native form controls
      if (tag === 'input' || tag === 'textarea') {
        return true;
      }
      
      // Check for Shoelace form controls
      if (tag === 'sl-input' || tag === 'sl-textarea' || tag === 'sl-select') {
        return true;
      }
      
      // Only prevent search in project/task forms
      if (tag === 'project-form' || tag === 'task-form') {
        return true;
      }
      
      return false;
    });

    if (isFormControl || e.metaKey || e.ctrlKey || e.altKey) {
      return;
    }

    // Open search dialog on '/' key
    if (e.key === '/') {
      e.preventDefault();
      this._openSearch();
    }

    // Create new project with 'p' key
    if (e.key === 'p') {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('create:project', {
        bubbles: true,
        composed: true
      }));
    }

    // Create new task with 't' key
    if (e.key === 't') {
      e.preventDefault();
      const match = window.location.pathname.match(/^\/projects\/([\w-]+)/);
      this.dispatchEvent(new CustomEvent('create:task', {
        bubbles: true,
        composed: true,
        detail: { projectId: match ? match[1] : null }
      }));
    }

    // Navigate to home page with 'h' key
    if (e.key === 'h') {
      e.preventDefault();
      window.history.pushState({}, '', '/');
      this.dispatchEvent(new CustomEvent('app:navigate', {
        bubbles: true,
        composed: true
      }));
    }
  }

  render() {
    return html`
      <header>
        <div class="container">
          <div class="left">
            <a class="logo-link" href="/" @click=${this._navigate}>
              <sl-icon name="stars"></sl-icon>
              Zuperb
            </a>
          </div>
          <div class="title">
            ${this.pageTitle === 'Projects' || window.location.pathname.startsWith('/projects/') ? html`
              <sl-icon name="folder"></sl-icon>
            ` : ''}
            ${this.pageTitle}
          </div>
          <div class="right">
            <sl-icon-button 
              name="search" 
              label="Search (Press '/' to open)"
              @click=${this._openSearch}
            ></sl-icon-button>
            <plus-menu></plus-menu>
            <sl-icon-button name="gear" label="Settings" href="/settings" @click=${this._navigate}></sl-icon-button>
          </div>
        </div>
      </header>
      <nav>
        <div class="container">
          <breadcrumb-trail .items=${this.breadcrumbs}></breadcrumb-trail>
        </div>
      </nav>
      <main>
        <div class="container">
          <slot></slot>
        </div>
      </main>
      <project-form></project-form>
      <task-form></task-form>
      <search-dialog></search-dialog>
    `;
  }

  _navigate(event) {
    event.preventDefault();
    const href = event.currentTarget.getAttribute('href');
    if (href) {
      window.history.pushState({}, '', href);
      this.dispatchEvent(new CustomEvent('app:navigate', { bubbles: true, composed: true }));
    }
  }

  _openSearch() {
    const searchDialog = this.shadowRoot.querySelector('search-dialog');
    if (searchDialog) {
      searchDialog.show();
    }
  }
}

customElements.define('app-shell', AppShell); 