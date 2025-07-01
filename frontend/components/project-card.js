import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared-styles.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import { relativeTime } from '../utils/format.js';
import { deleteProject } from '../services/projects.js';

export class ProjectCard extends LitElement {
  static properties = {
    project: { type: Object },
  };

  static styles = [sharedStyles, css`
    :host {
      display: block;
      height: 100%;
    }
    .card-wrapper {
      display: block;
      height: 100%;
      text-decoration: none;
      color: inherit;
      position: relative;
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
      position: relative;
      border: none;
    }
    .title {
      font-size: var(--font-size-lg);
      font-weight: var(--fw-medium);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      padding-right: var(--space-8);
    }
    .actions {
      position: absolute;
      top: 0;
      right: calc(var(--space-2) * -1);
      opacity: 0;
      transition: opacity 0.1s ease;
    }
    sl-card:hover .actions,
    sl-card:focus-within .actions {
      opacity: 1;
    }
    sl-card:focus-within {
      outline: 2px solid var(--color-primary);
      border-radius: var(--radius-md);
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

    /* Dropdown menu styling */
    sl-dropdown::part(panel) {
      --sl-panel-background-color: var(--sl-color-neutral-0);
      --sl-panel-border-color: var(--sl-color-neutral-200);
      --sl-panel-border-radius: var(--radius-sm);
      --sl-panel-border-width: 1px;
    }

    sl-menu {
      min-width: 120px;
      padding: var(--space-1) 0;
      max-height: none;
      overflow: visible;
    }
    
    sl-menu-item::part(base) {
      font-size: var(--font-size-sm);
      padding: var(--space-1) var(--space-3);
      gap: var(--space-2);
    }

    sl-menu-item::part(label) {
      color: var(--sl-color-neutral-900);
    }

    sl-menu-item[value="delete"]::part(label) {
      color: var(--sl-color-danger-600);
    }

    sl-menu-item:hover::part(base),
    sl-menu-item:focus-visible::part(base) {
      background-color: var(--sl-color-neutral-100);
    }

    sl-menu-item[value="delete"]:hover::part(base),
    sl-menu-item[value="delete"]:focus-visible::part(base) {
      background-color: var(--sl-color-danger-50);
    }

    /* Flash animation for Enter key press */
    @keyframes flash {
      0% { background: var(--color-primary-200); }
      100% { background: transparent; }
    }
    
    .flash {
      position: absolute;
      inset: 0;
      border-radius: var(--radius-md);
      pointer-events: none;
      animation: flash 0.3s ease-out forwards;
    }
  `];

  constructor() {
    super();
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeyDown);
  }

  _handleKeyDown(e) {
    if (e.key === 'Delete') {
      e.preventDefault();
      this._deleteProject();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this._showFlashEffect();
      this._navigate(e);
    }
  }

  _showFlashEffect() {
    // Remove any existing flash elements
    const existingFlash = this.shadowRoot.querySelector('.flash');
    if (existingFlash) {
      existingFlash.remove();
    }

    // Create and add new flash element
    const flash = document.createElement('div');
    flash.className = 'flash';
    this.shadowRoot.querySelector('.card-wrapper').appendChild(flash);

    // Remove the element after animation completes
    flash.addEventListener('animationend', () => flash.remove());
  }

  async _deleteProject() {
    if (!confirm('Delete project?')) return;
    
    try {
      await deleteProject(this.project.id);
      window.dispatchEvent(new CustomEvent('project:deleted', { 
        detail: { id: this.project.id },
        bubbles: true,
        composed: true
      }));
    } catch (e) {
      alert(e.message);
    }
  }

  render() {
    if (!this.project) return html``;
    const { id, name, description, created_at } = this.project;
    return html`
      <div class="card-wrapper" tabindex="0">
        <sl-card>
          <div slot="header">
            <div class="title" title="${name}">${name}</div>
            <div class="actions">
              <sl-dropdown 
                placement="bottom-end" 
                @click=${e => e.stopPropagation()}
                @keydown=${e => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                  }
                }}
              >
                <sl-icon-button 
                  slot="trigger" 
                  name="three-dots-vertical" 
                  label="Actions"
                ></sl-icon-button>
                <sl-menu @sl-select=${this._onMenuSelect}>
                  <sl-menu-item value="edit">Edit</sl-menu-item>
                  <sl-menu-item value="delete">Delete</sl-menu-item>
                </sl-menu>
              </sl-dropdown>
            </div>
          </div>
          <div class="body">
            ${description ? html`<p class="description" title=${description}>${unsafeHTML(description)}</p>` : ''}
          </div>
          <div slot="footer">
            <div class="meta">
              <sl-icon name="clock"></sl-icon>
              <span title=${new Date(this.project.updated_at || created_at).toLocaleString()}>
                ${relativeTime(this.project.updated_at || created_at)}
              </span>
            </div>
          </div>
        </sl-card>
      </div>`;
  }

  _onMenuSelect(e) {
    const action = e.detail.item.value;
    if (action === 'edit') {
      this.dispatchEvent(new CustomEvent('edit:project', {
        detail: { project: this.project },
        bubbles: true,
        composed: true
      }));
    } else if (action === 'delete') {
      this._deleteProject();
    }
  }

  _navigate(event) {
    event.preventDefault();
    const href = `/projects/${this.project.id}`;
    window.history.pushState({}, '', href);
    this.dispatchEvent(new CustomEvent('app:navigate', { bubbles: true, composed: true }));
  }
}

customElements.define('project-card', ProjectCard); 