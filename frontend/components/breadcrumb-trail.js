import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

export class BreadcrumbTrail extends LitElement {
  static properties = {
    items: { type: Array },
  };

  static styles = css`
    nav {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: 0.85rem;
      margin-top: var(--space-2);
    }
    a {
      color: var(--color-primary);
      text-decoration: none;
    }
    sl-icon {
      font-size: 0.7rem;
      color: #999;
    }
    span.current {
      color: #555;
      font-weight: 500;
    }
  `;

  constructor() {
    super();
    this.items = [];
  }

  render() {
    if (!this.items?.length) return html``;
    const lastIndex = this.items.length - 1;
    return html`<nav>
      ${this.items.map((item, idx) => html`
        ${idx > 0 ? html`<sl-icon name="chevron-right"></sl-icon>` : ''}
        ${idx === lastIndex ? html`<span class="current">${item.label}</span>` : html`<a href="${item.href}" @click=${this._navigate}>${item.label}</a>`}
      `)}
    </nav>`;
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

customElements.define('breadcrumb-trail', BreadcrumbTrail); 