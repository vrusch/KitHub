/**
 * Bezpečně vykreslí hodnotu do React komponenty.
 * Pokud je hodnota objekt (např. omylem předaný), převede ho na string, aby aplikace nespadla.
 *
 * @param {any} value - Hodnota k vykreslení.
 * @returns {string|number|null} Bezpečná hodnota pro JSX.
 */
export const safeRender = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return value;
};
