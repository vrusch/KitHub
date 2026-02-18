/**
 * src/data/paints/index.js
 * Centrální přístupový bod pro všechna data o barvách a specifikacích.
 */

// Importy surových dat (předpokládáme existenci těchto souborů)
import tamiyaPaints from "./tamiya.json";
import gunzePaints from "./gunze.json";
import tamiyaSpecs from "./tamiya_spec.json";
import gunzeSpecs from "./gunze_spec.json";

// Definice podporovaných značek
export const BRANDS = {
  TAMIYA: "tamiya",
  GUNZE: "gunze",
};

/**
 * Vrací barvy podle značky nebo všechny barvy najednou.
 * @param {string|null} brandId - ID značky (tamiya/gunze) nebo null pro vše.
 * @returns {Object} Objekt s barvami
 */
export const getPaints = (brandId = null) => {
  if (brandId === BRANDS.TAMIYA) return tamiyaPaints;
  if (brandId === BRANDS.GUNZE) return gunzePaints;

  // Pokud není zadáno, vrátíme vše (mergnuté)
  // Poznámka: V praxi je lepší s tímto šetřit kvůli výkonu
  return { ...tamiyaPaints, ...gunzePaints };
};

/**
 * Vrací technické specifikace řad pro danou značku.
 * @param {string} brandId
 * @returns {Object}
 */
export const getSpecs = (brandId) => {
  if (brandId === BRANDS.TAMIYA) return tamiyaSpecs;
  if (brandId === BRANDS.GUNZE) return gunzeSpecs;
  return {};
};

/**
 * Vyhledá detaily konkrétní řady (např. "Akryl" u Tamiye)
 * @param {string} brandId
 * @param {string} typeKey
 */
export const getSeriesDetail = (brandId, typeKey) => {
  const specs = getSpecs(brandId);
  return specs[typeKey] || null;
};

/**
 * Helper pro UI: Vrátí seznam značek pro filtry
 */
export const getManufacturers = () => [
  {
    id: BRANDS.TAMIYA,
    name: "Tamiya",
    count: Object.keys(tamiyaPaints).length,
  },
  {
    id: BRANDS.GUNZE,
    name: "Gunze (Mr. Hobby)",
    count: Object.keys(gunzePaints).length,
  },
];

// Defaultní export jako jedno API
export default {
  getPaints,
  getSpecs,
  getSeriesDetail,
  getManufacturers,
  BRANDS,
};
