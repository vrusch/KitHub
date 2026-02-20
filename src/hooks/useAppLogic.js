import { useState, useMemo } from "react";

/**
 * Hlavní prezentační logika aplikace.
 * Řeší filtrování, vyhledávání a přípravu dat pro různé pohledy (Kits, Projects, Paints, Shopping).
 *
 * @param {Array} kits - Seznam všech modelů.
 * @param {Array} projects - Seznam všech projektů.
 * @param {Array} paints - Seznam všech barev.
 * @returns {Object} Objekt obsahující stavy UI a vyfiltrovaná data.
 * @returns {string} return.view - Aktuální pohled (kits, projects, paints, shopping).
 * @returns {Function} return.setView - Funkce pro změnu pohledu.
 * @returns {string} return.searchTerm - Hledaný výraz.
 * @returns {Object} return.activeFilters - Aktivní filtry.
 * @returns {Object} return.shoppingList - Data pro nákupní seznam (kits, accessories, paints).
 * @returns {Array} return.filteredKits - Vyfiltrovaný seznam modelů.
 * @returns {Array} return.filteredProjects - Vyfiltrovaný seznam projektů.
 * @returns {Array} return.filteredPaints - Vyfiltrovaný seznam barev.
 * @returns {Object} return.groupedKits - Modely seskupené podle statusu (wip, new, atd.).
 * @returns {Object} return.groupedPaints - Barvy seskupené (inventory, wishlist).
 */
export const useAppLogic = (kits, projects, paints) => {
  const [view, setView] = useState("kits");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    scales: [],
    brands: [],
    kitStatuses: [],
    projectStatuses: [],
    paintBrands: [],
    paintTypes: [],
    readyToBuild: false,
  });

  const shoppingList = useMemo(() => {
    const wishlistKits = kits.filter((k) => k.status === "wishlist");
    const kitAccessories = kits
      .filter((k) => k.status !== "finished")
      .flatMap((k) =>
        (k.accessories || [])
          .filter((a) => a.status === "wanted")
          .map((a) => ({
            ...a,
            parentId: k.id,
            parentName: `${k.brand} ${k.subject || ""} ${k.name}`,
            parentType: "kit",
          })),
      );
    const projectAccessories = projects
      .filter((p) => p.status !== "finished")
      .flatMap((p) =>
        (p.accessories || [])
          .filter((a) => a.status === "wanted")
          .map((a) => ({
            ...a,
            parentId: p.id,
            parentName: p.name,
            parentType: "project",
          })),
      );

    const wishlistPaints = paints.filter(
      (p) => !p.isMix && (p.status === "wanted" || p.status === "low"),
    );

    return {
      kits: wishlistKits,
      accessories: [...kitAccessories, ...projectAccessories],
      paints: wishlistPaints,
    };
  }, [kits, projects, paints]);

  const availableScales = useMemo(
    () => [...new Set(kits.map((k) => k.scale).filter(Boolean))].sort(),
    [kits],
  );
  const availableBrands = useMemo(
    () => [...new Set(kits.map((k) => k.brand).filter(Boolean))].sort(),
    [kits],
  );
  const availablePaintBrands = useMemo(
    () => [...new Set(paints.map((p) => p.brand).filter(Boolean))].sort(),
    [paints],
  );
  const availablePaintTypes = useMemo(
    () => [...new Set(paints.map((p) => p.type).filter(Boolean))].sort(),
    [paints],
  );

  const toggleFilter = (type, value) => {
    setActiveFilters((prev) => {
      if (type === "readyToBuild") {
        return { ...prev, readyToBuild: !prev.readyToBuild };
      }
      const current = prev[type];
      const next = current.includes(value)
        ? current.filter((i) => i !== value)
        : [...current, value];
      return { ...prev, [type]: next };
    });
  };
  const clearFilters = () =>
    setActiveFilters({
      scales: [],
      brands: [],
      kitStatuses: [],
      projectStatuses: [],
      paintBrands: [],
      paintTypes: [],
      readyToBuild: false,
    });
  const hasActiveFilters = Object.entries(activeFilters).some(([key, val]) => {
    if (key === "readyToBuild") return val === true;
    return Array.isArray(val) && val.length > 0;
  });

  const filteredKits = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return kits.filter((k) => {
      const basicMatch =
        (k.name + k.brand + (k.subject || ""))
          .toLowerCase()
          .includes(lowerSearch) &&
        (activeFilters.scales.length === 0 ||
          activeFilters.scales.includes(k.scale)) &&
        (activeFilters.brands.length === 0 ||
          activeFilters.brands.includes(k.brand)) &&
        (activeFilters.kitStatuses.length === 0 ||
          activeFilters.kitStatuses.includes(k.status));

      if (!basicMatch) return false;

      if (activeFilters.readyToBuild) {
        const accessories = k.accessories || [];
        const paints = k.paints || [];

        // Pokud model nemá definované žádné barvy ani doplňky, nepovažujeme ho za "Ready"
        // (eliminujeme tím nově přidané, nevyplněné modely)
        if (accessories.length === 0 && paints.length === 0) return false;

        const accessoriesReady = accessories.every(
          (acc) => acc.status === "owned",
        );
        if (!accessoriesReady) return false;

        const paintsReady = paints.every((kitPaint) => {
          const inventoryPaint = paints.find((p) => p.id === kitPaint.id);
          return (
            inventoryPaint &&
            ["in_stock", "low"].includes(inventoryPaint.status)
          );
        });
        if (!paintsReady) return false;
      }

      return true;
    });
  }, [kits, paints, searchTerm, activeFilters]);

  const filteredProjects = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) &&
        (activeFilters.projectStatuses.length === 0 ||
          activeFilters.projectStatuses.includes(p.status)),
    );
  }, [projects, searchTerm, activeFilters]);

  const filteredPaints = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return paints.filter(
      (p) =>
        (p.name + p.code + p.brand).toLowerCase().includes(lowerSearch) &&
        (activeFilters.paintBrands.length === 0 ||
          activeFilters.paintBrands.includes(p.brand)) &&
        (activeFilters.paintTypes.length === 0 ||
          activeFilters.paintTypes.includes(p.type)),
    );
  }, [paints, searchTerm, activeFilters]);

  const groupedKits = useMemo(
    () => ({
      wip: filteredKits.filter((k) => k.status === "wip"),
      new: filteredKits.filter((k) => k.status === "new"),
      wishlist: filteredKits.filter((k) => k.status === "wishlist"),
      finished: filteredKits.filter((k) => k.status === "finished"),
      scrap: filteredKits.filter((k) => k.status === "scrap"),
    }),
    [filteredKits],
  );
  const groupedPaints = useMemo(
    () => ({
      inventory: filteredPaints.filter((p) =>
        ["in_stock", "low", "empty"].includes(p.status),
      ),
      wishlist: filteredPaints.filter((p) => p.status === "wanted"),
    }),
    [filteredPaints],
  );

  return {
    view,
    setView,
    searchTerm,
    setSearchTerm,
    showFilter,
    setShowFilter,
    activeFilters,
    toggleFilter,
    clearFilters,
    hasActiveFilters,
    shoppingList,
    availableScales,
    availableBrands,
    availablePaintBrands,
    availablePaintTypes,
    filteredKits,
    filteredProjects,
    filteredPaints,
    groupedKits,
    groupedPaints,
  };
};
