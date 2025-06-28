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

  /* Touch Targets */
  button,
  a,
  sl-button::part(base),
  sl-icon-button::part(base) {
    min-width: var(--space-5);
    min-height: var(--space-5);
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

  h2, h3 { 
    margin: var(--space-6) 0 var(--space-5);
  }

  h2 { 
    font-size: var(--font-size-h2);
    line-height: var(--line-height-lg);
    font-weight: var(--fw-semibold);
  }

  h3 { 
    font-size: var(--font-size-h3);
    line-height: var(--line-height-md);
    font-weight: var(--fw-medium);
  }

  section {
    margin: var(--space-6) 0;
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

  /* Hover & Focus States */
  .clickable:focus {
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