import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { LitElement, html as baseHtml, css } from 'lit';
import { unsafeStatic, html as staticHtml } from 'lit/static-html.js';

import './components/app-shell.js';

// Set Shoelace assets base
setBasePath('/assets');

/* -------------------------------------------------------------
 * Simple client-side router (hash-free)
 * -----------------------------------------------------------*/

const routeTable = [
  { path: /^\/$/, tag: 'home-page', loader: () => import('./pages/home-page.js') },
  { path: /^\/projects\/?$/, tag: 'projects-page', loader: () => import('./pages/projects-page.js') },
  { path: /^\/projects\/([\w-]+)\/?$/, tag: 'project-detail-page', loader: () => import('./pages/project-detail-page.js'), paramKeys: ['id'] },
  { path: /^\/tasks\/?$/, tag: 'tasks-page', loader: () => import('./pages/tasks-page.js') },
  { path: /^\/settings\/?$/, tag: 'settings-page', loader: () => import('./pages/settings-page.js') },
];

function matchRoute(pathname) {
  for (const route of routeTable) {
    const match = pathname.match(route.path);
    if (match) {
      const params = {};
      if (route.paramKeys) {
        route.paramKeys.forEach((k, idx) => (params[k] = match[idx + 1]));
      }
      return { route, params };
    }
  }
  return null;
}

/* -------------------------------------------------------------
 * App root element responsible for routing & shell state
 * -----------------------------------------------------------*/
class AppRoot extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
  `;

  constructor() {
    super();
    this.currentViewTag = null;
    this.params = {};
    this._onPopState = this.handleNavigation.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', this._onPopState);
    this.addEventListener('app:navigate', () => this.handleNavigation());
    this.handleNavigation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this._onPopState);
  }

  async handleNavigation() {
    const { pathname } = window.location;
    const match = matchRoute(pathname);
    if (!match) {
      console.warn('No route matched, redirecting to /');
      window.history.replaceState({}, '', '/');
      return this.handleNavigation();
    }

    const { route, params } = match;
    await route.loader(); // ensure component is defined
    this.currentViewTag = route.tag;
    this.params = params;
    this.requestUpdate();
  }

  render() {
    const ViewTag = this.currentViewTag;

    let viewEl = null;
    if (ViewTag) {
      const tag = unsafeStatic(ViewTag);
      // Spread params as individual attributes/properties
      viewEl = staticHtml`<${tag} .params=${this.params} .projectId=${this.params.id}></${tag}>`;
    }

    // Determine page title and breadcrumbs from component static props
    let pageTitle = '';
    let breadcrumbs = [];
    if (customElements.get(ViewTag)) {
      const Ctor = customElements.get(ViewTag);
      pageTitle = Ctor.pageTitle || '';
      breadcrumbs = Ctor.breadcrumbItems || [];
      if (Ctor === customElements.get('project-detail-page')) {
        // Special case for dynamic label maybe later
      }
    }

    return baseHtml`<app-shell .pageTitle=${pageTitle} .breadcrumbs=${breadcrumbs}>${viewEl}</app-shell>`;
  }
}

customElements.define('app-root', AppRoot);

console.info('Frontend shell & router loaded'); 