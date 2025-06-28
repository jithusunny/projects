import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { relativeTime } from '../utils/format.js';

export class ProjectCard extends LitElement {
  static properties = {
    project: { type: Object },
  };

  static styles = css`
    sl-card {
      cursor: pointer;
      height: var(--card-h);
      overflow: hidden;
      width: 100%;
    }
    sl-card::part(base) {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: var(--space-3) var(--space-3) var(--space-2);
    }
    sl-card::part(header) {
      padding: 0;
      margin-bottom: calc(var(--space-2) + 2px);
      font-weight: 500;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      border: none;
    }
    sl-card::part(body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 0;
    }
    sl-card::part(base):hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .meta {
      font-size: var(--font-sm);
      color: #777;
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
    .meta span { font-size: 0.9em; }
    a {
      text-decoration: none;
      color: inherit;
    }
    p.description {
      font-size: var(--font-sm);
      color: #555;
      margin: 0;
      margin-bottom: var(--space-2);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      width: 100%;
    }
    sl-card::part(footer) {
      border: none;
      padding: var(--space-1) 0 0;
    }
  `;

  render() {
    if (!this.project) return html``;
    const { id, name, description, created_at } = this.project;
    return html`<a href="/projects/${id}" @click=${this._navigate}>
      <sl-card>
        <div slot="header">${name}</div>
        <div class="body">
          ${description ? html`<p class="description" title=${description}>${unsafeHTML(description)}</p>` : ''}
        </div>
        <div slot="footer" class="meta">
          <sl-icon name="clock"></sl-icon>
          <span title=${new Date(this.project.updated_at || created_at).toLocaleString()}>${relativeTime(this.project.updated_at || created_at)}</span>
        </div>
      </sl-card>
    </a>`;
  }

  _navigate(event) {
    event.preventDefault();
    const href = event.currentTarget.getAttribute('href');
    window.history.pushState({}, '', href);
    this.dispatchEvent(new CustomEvent('app:navigate', { bubbles: true, composed: true }));
  }
}

customElements.define('project-card', ProjectCard); 