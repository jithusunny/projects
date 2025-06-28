import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import { createProject, updateProject } from '../services/projects.js';

export class ProjectForm extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    loading: { type: Boolean },
    editProject: { type: Object },
  };

  static styles = css``;

  constructor() {
    super();
    this.open = false;
    this.loading = false;
    this.editProject = null;
  }

  render() {
    const isEdit = !!this.editProject;
    return html`
      <sl-dialog ?open=${this.open} label=${isEdit ? 'Edit Project' : 'New Project'} @sl-request-close=${this._onClose}>
        <sl-input name="name" label="Name" required .value=${this.editProject?.name || ''}></sl-input>
        <sl-textarea name="description" label="Description" rows="3" .value=${this.editProject?.description || ''}></sl-textarea>

        <sl-button slot="footer" variant="primary" ?loading=${this.loading} @click=${this._submit}>${isEdit ? 'Save' : 'Create'}</sl-button>
      </sl-dialog>`;
  }

  show(project = null) {
    this.editProject = project;
    this.open = true;
  }

  _onClose() {
    this.open = false;
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