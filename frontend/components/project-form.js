import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared-styles.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import { createProject, updateProject } from '../services/projects.js';

export class ProjectForm extends LitElement {
  static properties = {
    open: { type: Boolean },
    loading: { type: Boolean },
    editProject: { type: Object },
  };

  static styles = [sharedStyles, css`
    sl-dialog {
      --width: 400px;
    }
    sl-dialog::part(body) {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      padding-block: var(--space-3);
    }
    sl-input::part(form-control-label),
    sl-textarea::part(form-control-label) {
      font-size: var(--font-size-small);
      color: var(--grey-700);
    }
    sl-input::part(input),
    sl-textarea::part(textarea) {
      font-size: var(--font-size-small);
    }
  `];

  constructor() {
    super();
    this.open = false;
    this.loading = false;
    this.editProject = null;
  }

  render() {
    const isEdit = !!this.editProject;
    return html`
      <sl-dialog 
        ?open=${this.open} 
        label=${isEdit ? 'Edit Project' : 'New Project'} 
        @sl-request-close=${this._onClose}
        @sl-initial-focus=${this._onInitialFocus}
        @keydown=${this._handleKeyDown}
      >
        <sl-input 
          name="name" 
          label="Name" 
          required 
          .value=${this.editProject?.name || ''}
          placeholder="Enter project name"
        ></sl-input>
        <sl-textarea 
          name="description" 
          label="Description" 
          rows="4" 
          .value=${this.editProject?.description || ''}
          placeholder="Enter project description"
        ></sl-textarea>

        <sl-button slot="footer" variant="primary" ?loading=${this.loading} @click=${this._submit}>
          ${isEdit ? 'Save' : 'Create'}
        </sl-button>
      </sl-dialog>`;
  }

  show(project = null) {
    this.editProject = project;
    this.open = true;
  }

  _onClose() {
    this.open = false;
    this.editProject = null;
  }

  _onInitialFocus(e) {
    // Prevent default focus and set focus to name input
    const nameInput = this.shadowRoot.querySelector('sl-input[name="name"]');
    if (nameInput) {
      e.preventDefault();
      nameInput.focus();
    }
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
    const nameInput = dialog.querySelector('sl-input[name="name"]');
    const descInput = dialog.querySelector('sl-textarea[name="description"]');
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    if (!name) {
      nameInput.setCustomValidity('Required');
      nameInput.reportValidity();
      return;
    }

    this.loading = true;
    try {
      let project;
      if (this.editProject) {
        project = await updateProject(this.editProject.id, { name, description });
        window.dispatchEvent(new CustomEvent('project:updated', { detail: { project } }));
      } else {
        project = await createProject({ name, description });
        window.dispatchEvent(new CustomEvent('project:created', { detail: { project } }));
      }
      this.open = false;
      nameInput.value = '';
      descInput.value = '';
      this.editProject = null;
    } catch (e) {
      alert(e.message);
    } finally {
      this.loading = false;
    }
  }
}

customElements.define('project-form', ProjectForm); 