import { fetchProjects } from './projects.js';
import { fetchTasks } from './tasks.js';

// Configuration for search behavior
const SEARCH_CONFIG = {
  useServerSide: false, // Toggle this to true when implementing server-side search
  searchEndpoint: '/api/search', // Future server-side search endpoint
  resultsLimit: 20      // Maximum number of results to return
};

/**
 * Search across projects and tasks
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @param {AbortSignal} options.signal - AbortController signal for cancellation
 * @returns {Promise<Array<{id: string, type: 'project'|'task', title: string, description?: string}>>}
 */
export async function searchAll(query, { signal } = {}) {
  if (!query) {
    return [];
  }

  if (SEARCH_CONFIG.useServerSide) {
    return searchServer(query, { signal });
  } else {
    return searchClient(query, { signal });
  }
}

/**
 * Server-side search implementation
 */
async function searchServer(query, { signal } = {}) {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`${SEARCH_CONFIG.searchEndpoint}?${params}`, { signal });
  
  if (!response.ok) {
    throw new Error('Server search failed');
  }

  return response.json();
}

/**
 * Client-side search implementation with multi-term matching
 */
async function searchClient(query, { signal } = {}) {
  // Load data with abort signal
  const [projects, tasks] = await Promise.all([
    fetch('/api/projects', { signal }).then(r => r.json()),
    fetch('/api/tasks', { signal }).then(r => r.json())
  ]);

  const searchTerms = query.toLowerCase().split(/\s+/);
  const results = [];

  // Helper to check if all search terms match text
  const matchesAllTerms = (text) => {
    if (!text) return false;
    text = text.toLowerCase();
    return searchTerms.every(term => text.includes(term));
  };

  // Search projects
  for (const project of projects) {
    const titleMatch = matchesAllTerms(project.name);
    const descMatch = matchesAllTerms(project.description);
    
    if (titleMatch || descMatch) {
      results.push({
        id: project.id,
        type: 'project',
        title: project.name,
        description: project.description,
        matchType: titleMatch ? 'title' : 'description',
        score: titleMatch ? 2 : 1
      });
    }
  }

  // Search tasks
  for (const task of tasks) {
    const titleMatch = matchesAllTerms(task.title);
    const descMatch = matchesAllTerms(task.description);
    
    if (titleMatch || descMatch) {
      results.push({
        id: task.id,
        type: 'task',
        title: task.title,
        description: task.description,
        projectId: task.project_id,
        matchType: titleMatch ? 'title' : 'description',
        score: titleMatch ? 2 : 1
      });
    }
  }

  // Sort results by score and type
  results.sort((a, b) => {
    // Score takes precedence
    if (b.score !== a.score) return b.score - a.score;
    
    // Then sort by type (projects first)
    if (a.type === 'project' && b.type !== 'project') return -1;
    if (b.type === 'project' && a.type !== 'project') return 1;
    
    return 0;
  });

  // Limit results
  return results.slice(0, SEARCH_CONFIG.resultsLimit);
} 