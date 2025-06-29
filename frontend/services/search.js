import { fetchProjects } from './projects.js';
import { fetchTasks } from './tasks.js';

// Configuration for search behavior
const SEARCH_CONFIG = {
  useServerSide: false, // Toggle this to true when implementing server-side search
  minQueryLength: 2,    // Minimum characters before searching
  searchEndpoint: '/api/search' // Future server-side search endpoint
};

/**
 * Search across projects and tasks
 * @param {string} query - Search query
 * @returns {Promise<Array<{id: string, type: 'project'|'task', title: string, description?: string}>>}
 */
export async function searchAll(query) {
  if (!query || query.length < SEARCH_CONFIG.minQueryLength) {
    return [];
  }

  if (SEARCH_CONFIG.useServerSide) {
    return searchServer(query);
  } else {
    return searchClient(query);
  }
}

/**
 * Client-side search implementation
 * @param {string} query 
 */
async function searchClient(query) {
  const [projects, tasks] = await Promise.all([
    fetchProjects(),
    fetchTasks()
  ]);

  const normalizedQuery = query.toLowerCase();
  const results = [];

  // Search projects
  projects.forEach(project => {
    const titleMatch = project.name.toLowerCase().includes(normalizedQuery);
    const descMatch = project.description?.toLowerCase().includes(normalizedQuery);
    
    if (titleMatch || descMatch) {
      results.push({
        id: project.id,
        type: 'project',
        title: project.name,
        description: project.description,
        matchType: titleMatch ? 'title' : 'description'
      });
    }
  });

  // Search tasks
  tasks.forEach(task => {
    const titleMatch = task.title.toLowerCase().includes(normalizedQuery);
    const descMatch = task.description?.toLowerCase().includes(normalizedQuery);
    
    if (titleMatch || descMatch) {
      results.push({
        id: task.id,
        type: 'task',
        title: task.title,
        description: task.description,
        projectId: task.project_id,
        matchType: titleMatch ? 'title' : 'description'
      });
    }
  });

  // Sort results: title matches first, then by type (projects first), then by updated date
  return results.sort((a, b) => {
    // Title matches take precedence
    if (a.matchType === 'title' && b.matchType !== 'title') return -1;
    if (b.matchType === 'title' && a.matchType !== 'title') return 1;
    
    // Then sort by type (projects first)
    if (a.type === 'project' && b.type !== 'project') return -1;
    if (b.type === 'project' && a.type !== 'project') return 1;
    
    return 0;
  });
}

/**
 * Server-side search implementation (to be implemented later)
 * @param {string} query 
 */
async function searchServer(query) {
  // TODO: Implement when adding server-side search
  const response = await fetch(`${SEARCH_CONFIG.searchEndpoint}?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Search failed');
  }
  return response.json();
} 