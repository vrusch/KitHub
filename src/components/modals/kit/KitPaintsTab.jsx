import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  Check,
  FlaskConical,
  Plus,
  Package,
  Wand2,
  Palette,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { Normalizer } from "../../../utils/normalizers";
import MASTER_CATALOG from "../../../data/catalog.json";
import BRANDS from "../../../data/brands.json";

const KitPaintsTab = ({ data, setData, allPaints, onQuickCreatePaint }) => {
  const [paintSearch, setPaintSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const handleAddPaint = (paintId) => {
    setData((prev) => {
      if (prev.paints?.some((p) => p.id === paintId)) return prev;
      return {
        ...prev,
        paints: [...(prev.paints || []), { id: paintId, note: "" }],
      };
    });
  };

  const handleRemovePaint = (paintId) => {
    setData((prev) => ({
      ...prev,
      paints: prev.paints.filter((p) => p.id !== paintId),
    }));
  };

  const handleUpdatePaintNote = (paintId, note) => {
    setData((prev) => ({
      ...prev,
      paints: prev.paints.map((p) => (p.id === paintId ? { ...p, note } : p)),
    }));
  };

  const handleCatalogAdd = (key, val) => {
    let brand = "Neznámý";
    if (key.startsWith("TAMIYA")) brand = "Tamiya";
    else if (key.startsWith("GUNZE")) brand = "Gunze";
    else if (key.startsWith("AKINTERACTIVE")) brand = "AK Interactive";
    else if (key.startsWith("VALLEJO")) brand = "Vallejo";
    else if (key.startsWith("MRP")) brand = "MRP";
    else if (key.startsWith("AMMO")) brand = "Ammo by MIG";
    else if (key.startsWith("HATAKA")) brand = "Hataka";
    const newId = onQuickCreatePaint({
      brand,
      code: val.displayCode,
      name: val.name,
      type: val.type,
      finish: val.finish,
      hex: val.hex,
      status: "wanted",
    });
    handleAddPaint(newId);
  };

  const handleCustomCreate = () => {
    const newId = onQuickCreatePaint({
      brand: selectedBrand,
      code: paintSearch || "???",
      name: "Nová barva",
      type: "Akryl",
      finish: "Matná",
      hex: "#cccccc",
      status: "wanted",
    });
    handleAddPaint(newId);
  };

  const rackPaints = useMemo(() => {
    if (!selectedBrand) return { inventory: [], catalog: [] };
    const searchNormalized = Normalizer.search(paintSearch);
    const inventory = allPaints.filter((p) => {
      const isAlreadyAdded = data.paints?.some((kp) => kp.id === p.id);
      const matchesBrand = p.brand === selectedBrand;
      const matchesSearch =
        !paintSearch ||
        Normalizer.search(p.code).includes(searchNormalized) ||
        Normalizer.search(p.name).includes(searchNormalized);
      return !isAlreadyAdded && matchesBrand && matchesSearch;
    });
    const catalog = Object.entries(MASTER_CATALOG).filter(([key, val]) => {
      let brandFromKey = "Jiné";
      if (key.startsWith("TAMIYA")) brandFromKey = "Tamiya";
      else if (key.startsWith("GUNZE")) brandFromKey = "Gunze";
      else if (key.startsWith("AKINTERACTIVE")) brandFromKey = "AK Interactive";
      else if (key.startsWith("VALLEJO")) brandFromKey = "Vallejo";
      else if (key.startsWith("MRP")) brandFromKey = "MRP";
      else if (key.startsWith("AMMO")) brandFromKey = "Ammo by MIG";
      else if (key.startsWith("HATAKA")) brandFromKey = "Hataka";
      const matchesBrand = brandFromKey === selectedBrand;
      const matchesSearch =
        !paintSearch ||
        Normalizer.search(val.displayCode).includes(searchNormalized) ||
        Normalizer.search(val.name).includes(searchNormalized);
      const inInventory = allPaints.some(
        (p) =>
          p.id === Normalizer.generateId(key.split("_")[0], val.displayCode),
      );
      return matchesBrand && matchesSearch && !inInventory;
    });
    return { inventory, catalog };
  }, [allPaints, data.paints, paintSearch, selectedBrand]);

  return (
    <div className="flex flex-col h-full relative">
      <div className="bg-slate-950 border-b border-slate-800 p-3 shrink-0">
        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
          KROK 1: Vyber výrobce
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() =>
              setSelectedBrand(
                selectedBrand === "Vlastní Mix" ? "" : "Vlastní Mix",
              )
            }
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
              selectedBrand === "Vlastní Mix"
                ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/50 scale-105"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
            }`}
          >
            🧪 Mixy
          </button>
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() =>
                setSelectedBrand(brand === selectedBrand ? "" : brand)
              }
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
                selectedBrand === brand
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/50 scale-105"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-900 relative">
        {selectedBrand ? (
          <div className="p-3">
            <div className="sticky top-0 z-10 bg-slate-900 pb-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={14}
                  />
                  <input
                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 pl-9 text-xs text-white focus:border-blue-500 outline-none placeholder-slate-500"
                    placeholder={`Hledat v katalogu ${selectedBrand}...`}
                    value={paintSearch}
                    onChange={(e) => setPaintSearch(e.target.value)}
                    autoFocus
                  />
                  {paintSearch && (
                    <button
                      onClick={() => setPaintSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSelectedBrand("")}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg shrink-0 flex items-center justify-center transition-colors"
                >
                  <Check size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {selectedBrand === "Vlastní Mix" ? (
                <div>
                  <h4 className="text-[10px] font-bold text-purple-500 uppercase mb-2 flex items-center gap-1 border-b border-slate-800 pb-1">
                    <FlaskConical size={10} /> Moje Mixy (
                    {allPaints.filter((p) => p.isMix).length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allPaints
                      .filter(
                        (p) =>
                          p.isMix &&
                          (!paintSearch ||
                            p.name
                              .toLowerCase()
                              .includes(paintSearch.toLowerCase())),
                      )
                      .map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleAddPaint(p.id)}
                          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500 p-2 rounded cursor-pointer flex items-center gap-2 transition-colors"
                        >
                          <div className="w-6 h-6 rounded border border-slate-600 shrink-0 flex items-center justify-center bg-slate-900">
                            <FlaskConical
                              size={12}
                              className="text-white opacity-50"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white">
                              {p.code}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {p.name}
                            </div>
                          </div>
                          <Plus size={14} className="ml-auto text-purple-500" />
                        </div>
                      ))}
                    {allPaints.filter((p) => p.isMix).length === 0 && (
                      <p className="text-xs text-slate-500 italic col-span-2 text-center">
                        Zatím žádné vlastní mixy.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {rackPaints.inventory.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-green-500 uppercase mb-2 flex items-center gap-1 border-b border-slate-800 pb-1">
                        <Package size={10} /> Máš skladem (
                        {rackPaints.inventory.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {rackPaints.inventory.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleAddPaint(p.id)}
                            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 p-2 rounded cursor-pointer flex items-center gap-2 transition-colors"
                          >
                            <div
                              className="w-6 h-6 rounded border border-slate-600 shrink-0"
                              style={{ backgroundColor: p.hex }}
                            ></div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white">
                                {p.code}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {p.name}
                              </div>
                            </div>
                            <Check
                              size={14}
                              className="ml-auto text-green-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {rackPaints.catalog.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-purple-400 uppercase mb-2 flex items-center gap-1 border-b border-slate-800 pb-1">
                        <Wand2 size={10} /> Katalog (Přidat do nákupu)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {rackPaints.catalog.map(([key, val]) => (
                          <div
                            key={key}
                            onClick={() => handleCatalogAdd(key, val)}
                            className="bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-purple-500 p-2 rounded cursor-pointer flex items-center gap-2 transition-colors group"
                          >
                            <div
                              className="w-6 h-6 rounded border border-slate-700 shrink-0 opacity-80"
                              style={{ backgroundColor: val.hex }}
                            ></div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-300 group-hover:text-white">
                                {val.displayCode}
                              </div>
                              <div className="text-[10px] text-slate-500 group-hover:text-slate-400 truncate">
                                {val.name}
                              </div>
                            </div>
                            <Plus
                              size={14}
                              className="ml-auto text-slate-600 group-hover:text-purple-400"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {selectedBrand !== "Vlastní Mix" &&
                rackPaints.inventory.length === 0 &&
                rackPaints.catalog.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-500 mb-2">
                      Žádná shoda v katalogu.
                    </p>
                    <button
                      onClick={handleCustomCreate}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded border border-slate-700"
                    >
                      + Vytvořit vlastní barvu
                    </button>
                  </div>
                )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <Palette size={14} className="text-blue-400" /> Recept modelu (
                {data.paints?.length || 0})
              </h4>
            </div>
            {data.paints && data.paints.length > 0 ? (
              <div className="space-y-2 pb-20">
                {data.paints.map((paintLink, idx) => {
                  let fullPaint = allPaints.find((p) => p.id === paintLink.id);
                  if (!fullPaint) {
                    fullPaint = {
                      id: paintLink.id,
                      code: "???",
                      name: "Neznámá",
                      hex: "#333",
                      status: "scrap",
                      isOrphan: true,
                    };
                  }
                  return (
                    <div
                      key={`${paintLink.id}_${idx}`}
                      className="bg-slate-800 p-2 rounded border border-slate-700"
                    >
                      <div className="text-white text-sm font-bold">
                        {fullPaint.code} - {fullPaint.name}
                      </div>
                      <input
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500 mt-1"
                        placeholder="Poznámka (např. trup, kokpit...)"
                        value={paintLink.note || ""}
                        onChange={(e) =>
                          handleUpdatePaintNote(paintLink.id, e.target.value)
                        }
                      />
                      <button
                        onClick={() => handleRemovePaint(paintLink.id)}
                        className="text-red-400 text-xs mt-1"
                      >
                        Odstranit
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-600 text-center">
                <ArrowRight size={32} className="mb-2 opacity-20 -rotate-90" />
                <p className="text-sm">Vyber nahoře značku a přidej barvy.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KitPaintsTab;
