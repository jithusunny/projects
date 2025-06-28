import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';

export class PlusMenu extends LitElement {
  static styles = css``;

  render() {
    return html`
      <sl-dropdown placement="bottom-end">
        <sl-icon-button slot="trigger" name="plus" label="New"></sl-icon-button>
        <sl-menu @sl-select=${this._onSelect}>
          <sl-menu-item value="project">New Project</sl-menu-item>
          <sl-menu-item value="task">New Task</sl-menu-item>
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