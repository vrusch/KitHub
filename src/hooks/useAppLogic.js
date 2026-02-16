import { useState, useMemo } from "react";

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
    });
  const hasActiveFilters = Object.values(activeFilters).some(
    (arr) => arr.length > 0,
  );

  const filteredKits = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return kits.filter(
      (k) =>
        (k.name + k.brand + (k.subject || ""))
          .toLowerCase()
          .includes(lowerSearch) &&
        (activeFilters.scales.length === 0 ||
          activeFilters.scales.includes(k.scale)) &&
        (activeFilters.brands.length === 0 ||
          activeFilters.brands.includes(k.brand)) &&
        (activeFilters.kitStatuses.length === 0 ||
          activeFilters.kitStatuses.includes(k.status)),
    );
  }, [kits, searchTerm, activeFilters]);

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