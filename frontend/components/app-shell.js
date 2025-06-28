import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import './plus-menu.js';
import './breadcrumb-trail.js';
import './project-form.js';
import './task-form.js';

export class AppShell extends LitElement {
  static properties = {
    pageTitle: { type: String },
    breadcrumbs: { type: Array },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-bg);
      color: var(--color-fg);
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    a.logo-link {
      font-size: var(--font-lg);
    }
    sl-icon-button::part(base), plus-menu sl-icon-button::part(base) {
      font-size: 1.15em;
    }
    .title {
      flex: 1;
      text-align: center;
      font-weight: 600;
      font-size: 1.1rem;
    }
    .left, .right {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    nav {
      padding: var(--space-2) var(--space-3) var(--space-1);
    }
    main {
      flex: 1;
      overflow: auto;
      padding: var(--space-3);
    }
    a.logo-link {
      text-decoration: none;
      color: inherit;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
  `;

  constructor() {
    super();
    this.pageTitle = '';
    this.breadcrumbs = [];
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
  }

  render() {
    return html`
      <header>
        <div class="left">
          <a class="logo-link" href="/" @click=${this._navigate}>
            <sl-icon name="layers"></sl-icon>
            Projects
          </a>
        </div>
        <div class="title">${this.pageTitle}</div>
        <div class="right">
          <plus-menu></plus-menu>
          <sl-icon-button name="gear" label="Settings" href="/settings" @click=${this._navigate}></sl-icon-button>
        </div>
      </header>
      <nav>
        <breadcrumb-trail .items=${this.breadcrumbs}></breadcrumb-trail>
      </nav>
      <main>
        <slot></slot>
      </main>
      <project-form></project-form>
      <task-form></task-form>
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
}

customElements.define('app-shell', AppShell); 