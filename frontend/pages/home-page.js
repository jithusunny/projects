import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared-styles.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

export class HomePage extends LitElement {
  static pageTitle = 'Home';
  static breadcrumbItems = [];

  static styles = [sharedStyles, css`
    .cards {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--space-5);
      margin-top: var(--space-8);
    }
    .menu-item {
      flex: 0 1 var(--space-12);
      max-width: var(--space-12);
      text-decoration: none;
      color: inherit;
      background: var(--color-bg);
      border: var(--border-1);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      transition: box-shadow 0.2s ease;
    }
    .menu-item:hover {
      box-shadow: var(--shadow-lg);
    }
    sl-icon {
      font-size: var(--space-6);
      width: var(--space-6);
      height: var(--space-6);
      color: var(--color-primary);
    }
    span {
      font-size: var(--font-size-lg);
    }
  `];

  render() {
    return html`
      <div class="container">
        <div class="cards">
          <a class="menu-item clickable" href="/projects" tabindex="0" @click=${this._navigate} data-testid="link-projects">
            <sl-icon name="files"></sl-icon>
            <span>Projects</span>
          </a>
          <a class="menu-item clickable" href="/tasks" tabindex="0" @click=${this._navigate} data-testid="link-tasks">
            <sl-icon name="check2-square"></sl-icon>
            <span>Tasks</span>
          </a>
        </div>
      </div>`;
  }

  _navigate(e) {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    window.history.pushState({}, '', href);
    this.dispatchEvent(new CustomEvent('app:navigate', { bubbles: true, composed: true }));
  }
}

customElements.define('home-page', HomePage); 