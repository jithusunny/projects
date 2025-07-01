import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import { createTask, updateTask } from '../services/tasks.js';

export class TaskForm extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    projectId: { type: String },
    loading: { type: Boolean },
    editMode: { type: Boolean },
    editTaskObj: { type: Object },
  };

  static styles = css``;

  constructor() {
    super();
    this.open = false;
    this.projectId = null;
    this.loading = false;
    this.editMode = false;
    this.editTaskObj = null;
  }

  show({projectId = null, task = null} = {}) {
    this.projectId = projectId;
    console.log('debugging projectId', projectId);
    this.editTaskObj = task;
    this.editMode = !!task;
    this.open = true;
  }

  _onClose() {
    this.open = false;
    this.editMode = false;
    this.editTaskObj = null;
  }

  _onInitialFocus(e) {
    // Prevent default focus and set focus to title input
    const titleInput = this.shadowRoot.querySelector('sl-input[name="title"]');
    if (titleInput) {
      e.preventDefault();
      titleInput.focus();
    }
  }

  _getField(field) {
    return this.editMode && this.editTaskObj ? (this.editTaskObj[field] ?? '') : '';
  }

  render() {
    const isEdit = this.editMode;
    return html`<sl-dialog 
      ?open=${this.open} 
      label=${isEdit ? 'Edit Task':'New Task'} 
      @sl-request-close=${this._onClose}
      @sl-initial-focus=${this._onInitialFocus}
      @keydown=${this._handleKeyDown}
    >
      <sl-input name="title" label="Title" required .value=${isEdit ? this._getField('title'):''}></sl-input>
      <sl-textarea name="description" label="Description" rows="3" .value=${isEdit ? this._getField('description'):''}></sl-textarea>
      ${this.projectId ? html`<p slot="footer">Project: ${this.projectId}</p>` : ''}
      <sl-button slot="footer" variant="primary" ?loading=${this.loading} @click=${this._submit}>${this.editMode ? 'Update' : 'Create'}</sl-button>
    </sl-dialog>`;
  }

  _handleKeyDown(e) {
    // Only handle Enter key
    if (e.key !== 'Enter') return;

    // Don't handle Enter if it's in a textarea or if any modifier keys are pressed
    if (e.target.tagName.toLowerCase() === 'textarea' || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

    // Don't handle if it's in a select element or its children
    if (e.target.closest('sl-select')) return;

    e.preventDefault();
    this._submit();
  }

  async _submit() {
    const dialog = this.shadowRoot.querySelector('sl-dialog');
    const titleInput = dialog.querySelector('sl-input[name="title"]');
    const descInput = dialog.querySelector('sl-textarea[name="description"]');
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    if (!title) {
      titleInput.setCustomValidity('Required');
      titleInput.reportValidity();
      return;
    }
    this.loading = true;
    try {
      const taskData = { title, description };
      if (this.projectId) taskData.project_id = this.projectId;
      let task;
      if (this.editMode) {
        task = await updateTask(this.editTaskObj.id, taskData);
        window.dispatchEvent(new CustomEvent('task:updated', { detail: { task } }));
      } else {
        task = await createTask(taskData);
        window.dispatchEvent(new CustomEvent('task:created', { detail: { task } }));
      }
      this.open = false;
      titleInput.value = '';
      descInput.value = '';
      this.editMode = false;
      this.editTaskObj = null;
    } catch (e) {
      alert(e.message);
    } finally {
      this.loading = false;
    }
  }
}

customElements.define('task-form', TaskForm); 