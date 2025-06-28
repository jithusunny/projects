import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/card/card.js';

export class HomePage extends LitElement {
  static pageTitle = 'Home';
  static breadcrumbItems = [];

  static styles = css`
    .cards {
      display: flex;
      justify-content: flex-start;
      gap: var(--space-5);
      margin-top: var(--space-5);
      flex-wrap: wrap;
    }
    a.card {
      flex: 0 0 200px;
      text-decoration: none;
      color: inherit;
    }
    sl-card { cursor: pointer; min-height: var(--card-h); width: 100%; }
    sl-card::part(base):hover { box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .tile { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-4); }
    sl-icon { font-size: 2rem; color: var(--color-primary); }
  `;

  render() {
    return html`
      <div class="cards">
        <a class="card" href="/projects" @click=${this._navigate}>
          <sl-card>
            <div class="tile" data-testid="link-projects">
              <sl-icon name="files"></sl-icon>
              <span>Projects</span>
            </div>
          </sl-card>
        </a>
        <a class="card" href="/tasks" @click=${this._navigate}>
          <sl-card>
            <div class="tile" data-testid="link-tasks">
              <sl-icon name="check2-square"></sl-icon>
              <span>Tasks</span>
            </div>
          </sl-card>
        </a>
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