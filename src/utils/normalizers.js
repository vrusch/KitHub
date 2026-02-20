/**
 * Pomocné funkce pro normalizaci vstupních dat (názvy, kódy, ID).
 * Zajišťuje konzistenci dat v databázi (např. odstranění mezer v ID, formátování názvů).
 */
export const Normalizer = {
  /**
   * Normalizuje název značky (první velké, zbytek malé).
   * @param {string} val - Vstupní řetězec.
   * @returns {string} Normalizovaný řetězec (např. "Tamiya").
   */
  brand: (val) =>
    val && val.length > 0
      ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
      : val,
  /**
   * Převede text na malá písmena (pro názvy modelů).
   * @param {string} val - Vstupní řetězec.
   * @returns {string} Text malými písmeny.
   */
  name: (val) => (val ? val.toLowerCase() : val),
  /**
   * Převede kód na velká písmena (pro kódy barev/modelů).
   * @param {string} val - Vstupní řetězec.
   * @returns {string} Text velkými písmeny.
   */
  code: (val) => (val ? val.toUpperCase() : val),
  /**
   * Připraví řetězec pro vyhledávání (malá písmena, odstranění speciálních znaků).
   * @param {string} val - Vstupní řetězec.
   * @returns {string} Čistý řetězec pro porovnávání.
   */
  search: (val) => (val ? val.toLowerCase().replace(/[^a-z0-9]/g, "") : ""),
  /**
   * Vygeneruje unikátní ID pro barvu na základě značky a kódu.
   * Odstraní mezery a tečky, převede na velká písmena.
   *
   * @param {string} brand - Značka (např. "Tamiya").
   * @param {string} code - Kód (např. "XF-1").
   * @returns {string|null} ID (např. "TAMIYA_XF1") nebo null, pokud chybí vstupy.
   */
  generateId: (brand, code) => {
    if (!brand || !code) return null;
    return `${brand.toUpperCase().replace(/\s+/g, "").replace(/\./g, "")}_${code.toUpperCase().replace(/[\s\-\.]/g, "")}`;
  },
};
