import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared-styles.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

export class BreadcrumbTrail extends LitElement {
  static properties = {
    items: { type: Array },
  };

  static styles = [sharedStyles, css`
    nav {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--font-size-small);
      margin-top: var(--space-2);
    }
    a {
      color: var(--color-primary);
      text-decoration: none;
      display: flex;
      align-items: center;
    }
    sl-icon {
      font-size: var(--font-size-small);
      color: var(--grey-400);
      position: relative;
      top: 1px;
    }
    span.current {
      color: var(--grey-600);
      font-weight: var(--fw-medium);
      display: flex;
      align-items: center;
    }
  `];

  constructor() {
    super();
    this.items = [];
  }

  render() {
    // Don't render if no items or only one item
    if (!this.items?.length || this.items.length === 1) return html``;
    
    const lastIndex = this.items.length - 1;
    return html`<nav>
      ${this.items.map((item, idx) => html`
        ${idx > 0 ? html`<sl-icon name="chevron-right"></sl-icon>` : ''}
        ${idx === lastIndex ? html`<span class="current">${item.label}</span>` : html`<a href="${item.href}" class="clickable" tabindex="0" @click=${this._navigate}>${item.label}</a>`}
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