import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import { toggleTask } from '../services/tasks.js';

export class TaskList extends LitElement {
  static properties = {
    tasks: { type: Array },
  };

  static styles = css`
    ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap: var(--space-2); }
    li { display:flex; align-items:center; padding: var(--space-2); border-radius: var(--radius-sm); gap: var(--space-2); }
    li:hover { background: rgba(0,0,0,0.03); }
    sl-checkbox { --size: 1rem; margin-top:2px; }
    .title { flex:1; font-size: 0.9rem; color:#555; }
    .done { text-decoration: line-through; color:#777; }
    .row-actions { opacity:0; transition:opacity .1s ease; }
    li:hover .row-actions { opacity:1; }
    sl-dropdown::part(base){padding:0;}
  `;

  constructor() {
    super();
    this.tasks = [];
  }

  render() {
    if (!this.tasks?.length) return html`<p>No tasks yet.</p>`;
    return html`<ul>
      ${this.tasks.map(t=>html`<li>
        <sl-checkbox ?checked=${t.completed} @sl-change=${e => this._toggle(t,e)}></sl-checkbox>
        <span class="title ${t.completed?'done':''}">${t.title}</span>
        <div class="row-actions">
          <sl-dropdown placement="bottom-end">
            <sl-icon-button slot="trigger" name="three-dots-vertical" label="Actions"></sl-icon-button>
            <sl-menu @sl-select=${e=>this._onAction(e,t)}>
              <sl-menu-item value="edit">Edit</sl-menu-item>
              <sl-menu-item value="delete">Delete</sl-menu-item>
            </sl-menu>
          </sl-dropdown>
        </div>
      </li>`)}
    </ul>`;
  }

  _onAction(e, task){
    const val = e.detail.item.value;
    const evtName = `${val}:task`;
    this.dispatchEvent(new CustomEvent(evtName,{detail:{task},bubbles:true,composed:true}));
  }

  async _toggle(task, e){
    const checked = e.target.checked;
    try {
      await toggleTask(task.id, checked);
      window.dispatchEvent(new CustomEvent('task:updated', { detail:{task:{...task, completed:checked}} }));
    }catch(err){ alert(err.message); e.target.checked = !checked; }
  }
}

customElements.define('task-list', TaskList); 