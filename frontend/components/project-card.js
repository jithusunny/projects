import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared-styles.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { relativeTime } from '../utils/format.js';

export class ProjectCard extends LitElement {
  static properties = {
    project: { type: Object },
  };

  static styles = [sharedStyles, css`
    :host {
      display: block;
      height: 100%;
    }
    a {
      display: block;
      height: 100%;
      text-decoration: none;
      color: inherit;
    }
    sl-card {
      cursor: pointer;
      height: 100%;
      min-height: var(--space-11);
      overflow: hidden;
      width: 100%;
    }
    sl-card::part(base) {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: var(--space-4);
      background: var(--color-bg);
    }
    sl-card::part(header) {
      padding: 0;
      margin-bottom: var(--space-3);
      font-size: var(--font-size-lg);
      font-weight: var(--fw-medium);
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
    .meta {
      font-size: var(--font-size-small);
      color: var(--grey-500);
      display: flex;
      align-items: center;
      gap: var(--space-1);
      margin-top: auto;
    }
    .meta sl-icon {
      font-size: var(--icon-sm);
      width: var(--icon-sm);
      height: var(--icon-sm);
    }
    .meta span { font-size: var(--font-size-small); }
    p.description {
      font-size: var(--font-size-small);
      color: var(--grey-600);
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
      padding: var(--space-2) 0 0;
      margin-top: auto;
    }
  `];

  render() {
    if (!this.project) return html``;
    const { id, name, description, created_at } = this.project;
    return html`<a href="/projects/${id}" class="clickable" tabindex="0" @click=${this._navigate}>
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