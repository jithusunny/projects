import { css } from 'lit';

export const sharedStyles = css`
  /* Host & Background Tone */
  :host {
    background: var(--grey-50);
    font-family: var(--font-family);
    font-size: var(--font-size-body);
    line-height: var(--line-height-md);
    font-weight: var(--fw-regular);
    color: var(--color-fg);
  }

  /* Container */
  .container {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: var(--space-5) var(--space-4);
  }

  /* Typography */
  h1 { 
    font-size: var(--font-size-h1);
    line-height: var(--line-height-lg);
    font-weight: var(--fw-bold);
    margin: 0;
  }

  h2 { 
    font-size: var(--font-size-h2);
    line-height: var(--line-height-lg);
    font-weight: var(--fw-semibold);
    margin: 0;
  }

  h3 { 
    font-size: var(--font-size-h3);
    line-height: var(--line-height-md);
    font-weight: var(--fw-medium);
    margin: 0;
  }

  p { 
    margin: 0 0 var(--space-4) 0;
  }

  small { 
    font-size: var(--font-size-small);
    color: var(--grey-500);
  }

  /* Flex/Grid Helpers */
  .flex {
    display: flex;
    gap: var(--space-3);
  }

  .flex-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .grid {
    display: grid;
    gap: var(--space-3);
  }

  /* Card Styles */
  .card,
  sl-card::part(base) {
    background: var(--color-bg);
    border: var(--border-1);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: var(--space-4);
  }

  /* Hover & Focus States */
  .clickable:hover,
  sl-card::part(base):hover {
    box-shadow: var(--shadow-lg);
    transition: box-shadow 0.2s ease;
  }

  .clickable:focus-visible,
  sl-card::part(base):focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: var(--space-1);
  }

  /* Icon Sizing */
  .icon-sm {
    font-size: var(--icon-sm);
    width: var(--icon-sm);
    height: var(--icon-sm);
  }

  .icon-md {
    font-size: var(--icon-md);
    width: var(--icon-md);
    height: var(--icon-md);
  }

  .icon-lg {
    font-size: var(--icon-lg);
    width: var(--icon-lg);
    height: var(--icon-lg);
  }
`; 