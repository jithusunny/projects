import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared-styles.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import { toggleTask } from '../services/tasks.js';

export class TaskList extends LitElement {
  static properties = {
    tasks: { type: Array },
    selectedIndex: { type: Number, state: true }
  };

  static styles = [sharedStyles, css`
    ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap: var(--space-2); }
    li { 
      display:flex; 
      align-items:center; 
      padding: var(--space-2); 
      border-radius: var(--radius-sm); 
      gap: var(--space-2);
      cursor: pointer;
      outline: none;
      position: relative; /* For flash effect */
    }
    li:hover { background: rgba(0, 0, 0, var(--opacity-25)); }
    li:focus { 
      background: var(--color-primary-100);
      outline: 2px solid var(--color-primary);
    }

    /* Flash animation for Enter key press */
    @keyframes flash {
      0% { background: var(--color-primary-200); }
      100% { background: transparent; }
    }
    
    .flash {
      position: absolute;
      inset: 0;
      border-radius: var(--radius-sm);
      pointer-events: none;
      animation: flash 0.3s ease-out forwards;
    }

    sl-checkbox { --size: var(--font-size-body); margin-top: var(--space-1); }
    .title { flex:1; font-size: var(--font-size-small); color: var(--grey-600); }
    .done { text-decoration: line-through; color: var(--grey-500); }
    .row-actions { opacity:0; transition:opacity .1s ease; }
    li:hover .row-actions, li:focus .row-actions { opacity:1; }
    sl-dropdown::part(base){padding:0;}
  `];

  constructor() {
    super();
    this.tasks = [];
    this.selectedIndex = -1;
  }

  connectedCallback() {
    super.connectedCallback();
    // Add keyboard event listener
    this.addEventListener('keydown', this._handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeyDown);
  }

  _handleKeyDown(e) {
    if (!this.tasks.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (this.selectedIndex < this.tasks.length - 1) {
          this.selectedIndex++;
          this._focusSelectedItem();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (this.selectedIndex > 0) {
          this.selectedIndex--;
          this._focusSelectedItem();
        }
        break;

      case 'Delete':
        e.preventDefault();
        if (this.selectedIndex >= 0) {
          const task = this.tasks[this.selectedIndex];
          this._onAction({ detail: { item: { value: 'delete' } } }, task);
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0) {
          const task = this.tasks[this.selectedIndex];
          this._showFlashEffect(this.selectedIndex);
          this._onAction({ detail: { item: { value: 'edit' } } }, task);
        }
        break;
    }
  }

  _focusSelectedItem() {
    requestAnimationFrame(() => {
      const selectedItem = this.shadowRoot.querySelector(`li:nth-child(${this.selectedIndex + 1})`);
      if (selectedItem) {
        selectedItem.focus();
      }
    });
  }

  _showFlashEffect(index) {
    const item = this.shadowRoot.querySelector(`li:nth-child(${index + 1})`);
    if (!item) return;

    // Remove any existing flash elements
    const existingFlash = item.querySelector('.flash');
    if (existingFlash) {
      existingFlash.remove();
    }

    // Create and add new flash element
    const flash = document.createElement('div');
    flash.className = 'flash';
    item.appendChild(flash);

    // Remove the element after animation completes
    flash.addEventListener('animationend', () => flash.remove());
  }

  render() {
    if (!this.tasks?.length) return html`<p>No tasks yet.</p>`;
    return html`<ul>
      ${this.tasks.map((t, index) => html`<li
        tabindex="0"
        @click=${() => this._onSelect(index)}
        @focus=${() => this.selectedIndex = index}
        @keydown=${e => {
          if (e.key === 'Enter') {
            this._showFlashEffect(index);
            this._onAction({ detail: { item: { value: 'edit' } } }, t);
          }
        }}
      >
        <sl-checkbox 
          ?checked=${t.completed} 
          @sl-change=${e => this._toggle(t,e)}
          @click=${e => e.stopPropagation()}
        ></sl-checkbox>
        <span class="title ${t.completed?'done':''}">${t.title}</span>
        <div class="row-actions">
          <sl-dropdown placement="bottom-end">
            <sl-icon-button 
              slot="trigger" 
              name="three-dots-vertical" 
              label="Actions"
              @click=${e => e.stopPropagation()}
            ></sl-icon-button>
            <sl-menu @sl-select=${e=>this._onAction(e,t)}>
              <sl-menu-item value="edit">Edit</sl-menu-item>
              <sl-menu-item value="delete">Delete</sl-menu-item>
            </sl-menu>
          </sl-dropdown>
        </div>
      </li>`)}
    </ul>`;
  }

  _onSelect(index) {
    this.selectedIndex = index;
    this._focusSelectedItem();
  }

  _onAction(e, task) {
    const val = e.detail.item.value;
    const evtName = `${val}:task`;
    this.dispatchEvent(new CustomEvent(evtName,{detail:{task},bubbles:true,composed:true}));
  }

  async _toggle(task, e) {
    const checked = e.target.checked;
    try {
      await toggleTask(task.id, checked);
      window.dispatchEvent(new CustomEvent('task:updated', { detail:{task:{...task, completed:checked}} }));
    } catch(err) { 
      alert(err.message); 
      e.target.checked = !checked; 
    }
  }
}

customElements.define('task-list', TaskList); 