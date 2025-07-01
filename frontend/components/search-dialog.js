import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../styles/shared-styles.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { searchAll } from '../services/search.js';
import { fetchProjects } from '../services/projects.js';
import { fetchTasks } from '../services/tasks.js';

export class SearchDialog extends LitElement {
  static properties = {
    open: { type: Boolean },
    query: { type: String },
    results: { type: Array },
    loading: { type: Boolean },
    error: { type: String },
    recentItems: { type: Array },
    selectedIndex: { type: Number },
    showLoading: { type: Boolean },
    hasSearched: { type: Boolean }
  };

  static styles = [sharedStyles, css`
    sl-dialog::part(panel) {
      border-radius: var(--radius-lg);
      max-width: 650px;
      width: 90vw;
      box-shadow: var(--shadow-xl);
      height: min(600px, 80vh);
      display: flex;
      flex-direction: column;
    }
    sl-dialog::part(header) {
      display: none;
    }
    sl-dialog::part(body) {
      padding: 0;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }
    sl-dialog::part(footer) {
      display: none;
    }
    .search-container {
      padding: var(--space-3) var(--space-4);
      background: var(--color-bg);
      border-bottom: var(--border-1);
    }
    sl-input {
      width: 100%;
    }
    sl-input::part(base) {
      border: none;
      background: none;
    }
    sl-input::part(input) {
      font-size: var(--font-size-lg);
      padding-left: var(--space-2);
      color: var(--grey-900);
    }
    sl-input::part(input)::placeholder {
      color: var(--grey-500);
    }
    sl-input::part(prefix) {
      color: var(--grey-500);
    }
    .results {
      flex: 1;
      overflow-y: auto;
      background: var(--color-bg);
      min-height: 0;
    }
    .result-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-4);
      cursor: pointer;
      transition: all 0.1s ease;
      border-left: 2px solid transparent;
      outline: none;
    }
    
    /* Light highlight for mouse hover */
    .result-item:hover {
      background: var(--grey-50);
    }
    
    /* Stronger highlight for keyboard selection */
    .result-item.selected {
      background: var(--grey-100);
      border-left-color: var(--color-primary);
    }
    
    /* Remove focus outline since we're using border-left for focus indication */
    .result-item:focus {
      outline: none;
    }
    .result-item sl-icon {
      color: var(--grey-600);
      font-size: var(--font-size-lg);
      flex-shrink: 0;
    }
    .result-content {
      flex: 1;
      overflow: hidden;
      line-height: 1.4;
    }
    .result-title {
      color: var(--grey-900);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .result-subtitle {
      color: var(--grey-600);
      font-size: var(--font-size-small);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .highlight {
      background: var(--color-primary-100);
      color: var(--color-primary-900);
      border-radius: 2px;
      font-weight: var(--fw-medium);
    }
    .message {
      padding: var(--space-4);
      text-align: center;
      color: var(--grey-600);
      font-size: var(--font-size-small);
    }
    .error {
      color: var(--color-danger);
    }
    .keyboard-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-4);
      background: var(--grey-50);
      color: var(--grey-600);
      font-size: var(--font-size-small);
      border-top: var(--border-1);
    }
    .key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      background: var(--grey-100);
      border: var(--border-1);
      border-radius: 3px;
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--grey-700);
      box-shadow: 0 1px 1px rgba(0,0,0,0.1);
    }
    .section-title {
      padding: var(--space-2) var(--space-4);
      color: var(--grey-600);
      font-size: var(--font-size-small);
      font-weight: var(--fw-medium);
      background: var(--grey-50);
      border-bottom: var(--border-1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 32px;
    }
    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid var(--grey-200);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      margin-left: var(--space-2);
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .results-container {
      min-height: 200px;
      display: flex;
      flex-direction: column;
    }
    .results-list {
      flex: 1;
    }
  `];

  constructor() {
    super();
    this.open = false;
    this.query = '';
    this.results = [];
    this.loading = false;
    this.error = '';
    this.selectedIndex = -1;
    this.recentItems = [];
    this.showLoading = false;
    this.hasSearched = false;
    
    // For cleanup of pending searches
    this._searchController = null;
    this._loadingTimeout = null;
    this._debouncedSearch = this._debounce(this._search.bind(this), 150);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cancelPendingSearch();
    if (this._loadingTimeout) {
      clearTimeout(this._loadingTimeout);
    }
  }

  render() {
    const query = this.query.trim();
    const showResults = query.length > 0;
    const items = showResults ? (this.loading ? (this.results.length ? this.results : this.recentItems) : this.results) : this.recentItems;

    return html`
      <sl-dialog 
        ?open=${this.open}
        @sl-request-close=${this._onClose}
        @sl-initial-focus=${this._onInitialFocus}
        @keydown=${this._onKeyDown}
      >
        <div class="search-container">
          <sl-input
            placeholder="Search projects and tasks..."
            clearable
            .value=${this.query}
            @sl-input=${this._onInput}
            @sl-clear=${this._onClear}
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
          >
            <sl-icon slot="prefix" name="search"></sl-icon>
          </sl-input>
        </div>

        <div class="results">
          ${this.error ? html`
            <div class="message error">${this.error}</div>
          ` : showResults ? 
            (items.length ? html`
              ${items.map((result, index) => this._renderItem(result, index, true))}
            ` : html`
              <div class="message">No matches found</div>
            `)
            : html`
              <div class="section-title">Recent</div>
              ${this.recentItems.length ? 
                this.recentItems.map((item, index) => this._renderItem(item, index, false))
                : html`<div class="message">No recent items</div>`
              }
            `
          }
        </div>

        <div class="keyboard-hint">
          <span><span class="key">↑</span> <span class="key">↓</span> to navigate</span>
          <span><span class="key">Enter</span> to select</span>
          <span><span class="key">Esc</span> to close</span>
        </div>
      </sl-dialog>
    `;
  }

  _renderItem(item, index, highlight) {
    return html`
      <div 
        class="result-item ${index === this.selectedIndex ? 'selected' : ''}"
        role="option"
        aria-selected=${index === this.selectedIndex}
        tabindex="0"
        @click=${() => this._onResultClick(item)}
      >
        <sl-icon name=${item.type === 'project' ? 'folder' : 'check-square'}></sl-icon>
        <div class="result-content">
          <div class="result-title">${highlight ? this._highlightMatch(item.title) : item.title}</div>
          <div class="result-subtitle">${highlight ? this._highlightMatch(item.subtitle) : item.subtitle}</div>
        </div>
      </div>
    `;
  }

  show() {
    this.open = true;
    this.selectedIndex = -1;
    this.query = '';
    this._loadRecentItems();
  }

  _onClose() {
    this.open = false;
    this.query = '';
    this.results = [];
    this.error = '';
    this.selectedIndex = -1;
  }

  _onInitialFocus(e) {
    const input = this.shadowRoot.querySelector('sl-input');
    if (input) {
      e.preventDefault();
      input.focus();
    }
  }

  _onInput(e) {
    this.query = e.target.value;
    this._debouncedSearch();
  }

  _onClear() {
    this.query = '';
    this.results = [];
    this.error = '';
    this.selectedIndex = -1;
    this.hasSearched = false;
    this._loadRecentItems();
  }

  _onKeyDown(e) {
    const items = this.query.trim() ? this.results : this.recentItems;
    if (!items.length) return;
    
    const input = this.shadowRoot.querySelector('sl-input');
    const isInputFocused = document.activeElement === input;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        if (isInputFocused || this.selectedIndex === -1) {
          // Move from input to first result
          this.selectedIndex = 0;
          const firstItem = this.shadowRoot.querySelector('.result-item');
          if (firstItem) {
            input.blur();
            firstItem.focus();
          }
        } else if (this.selectedIndex < items.length - 1) {
          // Move to next result
          this.selectedIndex++;
          this._scrollSelectedIntoView();
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        if (this.selectedIndex <= 0) {
          // Move from first result back to input
          this.selectedIndex = -1;
          const currentFocused = this.shadowRoot.querySelector('.result-item:focus');
          if (currentFocused) currentFocused.blur();
          input.focus();
        } else {
          // Move to previous result
          this.selectedIndex--;
          this._scrollSelectedIntoView();
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (items.length > 0) {
          // If no item is selected but we have results, select the first one
          if (this.selectedIndex === -1) {
            this.selectedIndex = 0;
          }
          this._onResultClick(items[this.selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        this._onClose();
        break;
    }
  }

  _scrollSelectedIntoView() {
    // First remove focus from all items
    const allItems = this.shadowRoot.querySelectorAll('.result-item');
    allItems.forEach(item => item.blur());

    // Then focus and scroll the selected item
    const selected = this.shadowRoot.querySelector(`.result-item:nth-child(${this.selectedIndex + 1})`);
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
      selected.focus();
    }
  }

  async _search() {
    try {
      // Cancel any pending search
      this._cancelPendingSearch();

      // Clear error state
      this.error = null;

      // If query is empty, show recent items
      if (!this.query?.trim()) {
        this.results = [];
        this.loading = false;
        this.hasSearched = false;
        await this._loadRecentItems();
        return;
      }

      // Create new abort controller for this search
      this._searchController = new AbortController();

      // Show loading state after a delay to prevent flicker
      this._loadingTimeout = setTimeout(() => {
        if (!this.results?.length) {
          this.showLoading = true;
        }
      }, 100);

      // Perform search
      this.loading = true;
      const results = await searchAll(this.query, {
        signal: this._searchController.signal
      });

      // Update state with results
      this.results = results;
      this.recentItems = [];
      this.hasSearched = true;
      this.loading = false;
      this.showLoading = false;
      
      // Always select the first result if there are any results
      this.selectedIndex = results.length > 0 ? 0 : -1;

    } catch (err) {
      if (err.message !== 'Search cancelled') {
        console.error('Search failed:', err);
        this.error = 'Search failed. Please try again.';
        this.results = [];
      }
    } finally {
      if (this._loadingTimeout) {
        clearTimeout(this._loadingTimeout);
        this._loadingTimeout = null;
      }
      this._searchController = null;
    }
  }

  _onResultClick(result) {
    const href = result.type === 'project' ? 
      `/projects/${result.id}` : 
      result.projectId ? `/projects/${result.projectId}` : '/tasks';
    
    // First update URL
    window.history.pushState({}, '', href);
    
    // Dispatch navigation event
    this.dispatchEvent(new CustomEvent('app:navigate', { 
      bubbles: true,
      composed: true 
    }));

    // Close dialog last
    this._onClose();
  }

  _highlightMatch(text) {
    if (!this.query || !text) return text;
    const regex = new RegExp(`(${this.query})`, 'gi');
    const parts = text.split(regex);
    return parts.map(part => 
      regex.test(part) ? html`<span class="highlight">${part}</span>` : part
    );
  }

  _debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  async _loadRecentItems() {
    try {
      // Get last 5 viewed projects and tasks
      const [projects, tasks] = await Promise.all([
        fetchProjects(),
        fetchTasks()
      ]);
      
      // Sort by updated_at and take first 5
      this.recentItems = [...projects.map(p => ({
        id: p.id,
        type: 'project',
        title: p.name,
        updated_at: p.updated_at
      })), ...tasks.map(t => ({
        id: t.id,
        type: 'task',
        title: t.title,
        description: t.description,
        projectId: t.project_id,
        updated_at: t.updated_at
      }))]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5);

      this.requestUpdate();
    } catch (error) {
      console.error('Failed to load recent items:', error);
      this.error = 'Failed to load recent items.';
      this.recentItems = [];
    }
  }

  _cancelPendingSearch() {
    if (this._searchController) {
      this._searchController.abort();
      this._searchController = null;
    }
  }
}

customElements.define('search-dialog', SearchDialog); 