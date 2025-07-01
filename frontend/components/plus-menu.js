import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';

export class PlusMenu extends LitElement {
  static styles = css`
    .shortcut {
      color: var(--grey-600);
      font-size: var(--font-size-small);
      margin-left: var(--space-3);
    }
  `;

  render() {
    return html`
      <sl-dropdown placement="bottom-end">
        <sl-icon-button slot="trigger" name="plus" label="New"></sl-icon-button>
        <sl-menu @sl-select=${this._onSelect}>
          <sl-menu-item value="project">
            New Project
            <span class="shortcut">P</span>
          </sl-menu-item>
          <sl-menu-item value="task">
            New Task
            <span class="shortcut">T</span>
          </sl-menu-item>
        </sl-menu>
      </sl-dropdown>
    `;
  }

  _onSelect(event) {
    const value = event.detail.item.value;
    let detail = {};
    if (value === 'task') {
      const match = window.location.pathname.match(/^\/projects\/([\w-]+)/);
      if (match) detail.projectId = match[1];
    }
    this.dispatchEvent(new CustomEvent('create:' + value, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('plus-menu', PlusMenu); 