import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  ExternalLink,
  Search,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  ImageOff,
  Check,
  Copy,
  Plus,
  Trash2,
  AlertTriangle,
  Package,
  Hammer,
  Trophy,
  ShoppingCart,
  Skull,
  Folder,
} from "lucide-react";
import { FloatingInput, FloatingTextarea } from "../../ui/FormElements";
import { Normalizer } from "../../../utils/normalizers";
import { scrapeScalemates } from "../../../utils/sm_scraper";
import KIT_BRANDS from "../../../data/brands-kits.json";

const COMMON_SCALES = [
  "1/6",
  "1/9",
  "1/12",
  "1/16",
  "1/24",
  "1/32",
  "1/35",
  "1/48",
  "1/72",
  "1/76",
  "1/100",
  "1/144",
  "1/200",
  "1/350",
  "1/700",
];

const CustomSelect = ({
  label,
  value,
  onChange,
  options,
  className = "",
  placeholder = "Vyberte...",
  labelColor = "text-slate-500",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label
          className={`absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] font-bold z-10 ${labelColor}`}
        >
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full bg-slate-950 border border-slate-700 rounded px-3 py-2.5 text-sm text-left flex items-center justify-between focus:border-blue-500 transition-colors outline-none h-[42px] ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div
          className={`flex items-center gap-2 truncate ${selectedOption ? "text-white" : "text-slate-500"}`}
        >
          {selectedOption?.icon && (
            <selectedOption.icon size={14} className={labelColor} />
          )}
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-800 transition-colors flex items-center justify-between ${value === opt.value ? "bg-blue-600/10 text-blue-400" : "text-slate-300"}`}
            >
              <div className="flex items-center gap-2 truncate">
                {opt.icon && (
                  <opt.icon
                    size={14}
                    className={
                      value === opt.value ? "text-blue-400" : "text-slate-500"
                    }
                  />
                )}
                <span>{opt.label}</span>
              </div>
              {value === opt.value && (
                <Check size={14} className="shrink-0 ml-2" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const KitInfoTab = ({ data, setData, projects, allKits, preferences }) => {
  const [isScraping, setIsScraping] = useState(false);
  const [showMarkings, setShowMarkings] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [brandSuggestions, setBrandSuggestions] = useState([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [scaleSuggestions, setScaleSuggestions] = useState([]);
  const [showScaleSuggestions, setShowScaleSuggestions] = useState(false);
  const [highlightedScaleIndex, setHighlightedScaleIndex] = useState(0);

  // State pro přidání vlastní nabídky
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOffer, setNewOffer] = useState({
    shopName: "",
    price: "",
    shopUrl: "",
  });

  const isScaleValid = (s) => !s || /^\d+\/\d+$/.test(s);

  // Validace výrobce: Varování, pokud není v seznamu (a není prázdný)
  const isUnknownBrand =
    data.brand &&
    data.brand.length > 1 &&
    !KIT_BRANDS.some((b) => b.toLowerCase() === data.brand.toLowerCase());

  // Validace měřítka: Varování, pokud není v seznamu běžných (ale formát je OK)
  const isUnknownScale =
    data.scale &&
    data.scale.length > 0 &&
    isScaleValid(data.scale) &&
    !COMMON_SCALES.includes(data.scale);

  // Validace duplicit (Soft Warning)
  const duplicateKit = useMemo(() => {
    if (!data.brand || !data.catNum || !allKits) return null;

    // Hledáme shodu: Stejný výrobce + Stejné kat. číslo
    // A zároveň to nesmí být ten samý kit (pokud editujeme)
    return allKits.find(
      (k) =>
        k.id !== data.id && // Ignorujeme sami sebe
        k.brand.toLowerCase() === data.brand.toLowerCase() &&
        k.catNum === data.catNum,
    );
  }, [data.brand, data.catNum, data.id, allKits]);

  const handleScrape = async () => {
    if (!data.scalematesUrl) return;
    setIsScraping(true);
    try {
      const scraped = await scrapeScalemates(data.scalematesUrl);
      if (scraped) {
        setData((prev) => ({
          ...prev,
          brand: Normalizer.brand(scraped.brand) || prev.brand,
          catNum: Normalizer.code(scraped.catNo) || prev.catNum,
          scale: scraped.scale ? scraped.scale.replace(":", "/") : prev.scale,
          subject: scraped.title || prev.subject,
          image: scraped.imageSrc || prev.image,
          year: scraped.year || prev.year,
          ean: scraped.ean || prev.ean,
          markings: scraped.instructionIsExact
            ? scraped.markingsHTML || prev.markings
            : prev.markings,
          marketplace: scraped.marketplace || prev.marketplace,
          notes:
            !scraped.instructionIsExact &&
            (!prev.notes || !prev.notes.includes("Stažený návod není přesně"))
              ? (prev.notes ? prev.notes + "\n\n" : "") +
                "⚠️ POZOR: Stažený návod není přesně pro tuto krabici (Scalemates nenašel přesnou shodu)."
              : prev.notes,
          attachments:
            scraped.instructionUrl &&
            !prev.attachments?.some((a) => a.url === scraped.instructionUrl)
              ? [
                  ...(prev.attachments || []),
                  {
                    id: Date.now(),
                    name: scraped.instructionIsExact
                      ? "Návod (Scalemates)"
                      : "Návod (Pouze podobný!)",
                    url: scraped.instructionUrl,
                    type: "manual",
                  },
                ]
              : prev.attachments,
        }));
      }
    } catch (error) {
      console.error("Scraping error:", error);
      alert(
        "Nepodařilo se stáhnout data. Zkontrolujte URL nebo to zkuste později.",
      );
    } finally {
      setIsScraping(false);
    }
  };

  const handleBrandChange = (e) => {
    const val = e.target.value;
    // Ponecháme normalizaci pro ruční psaní, ale našeptávač nabídne správný tvar z JSONu
    setData({ ...data, brand: Normalizer.brand(val) });
    setHighlightedIndex(0);

    if (val.length > 0) {
      const lowerVal = val.toLowerCase();
      const matches = KIT_BRANDS.filter((b) =>
        b.toLowerCase().includes(lowerVal),
      )
        .sort((a, b) => {
          const aStarts = a.toLowerCase().startsWith(lowerVal);
          const bStarts = b.toLowerCase().startsWith(lowerVal);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.localeCompare(b);
        })
        .slice(0, 6); // Max 6 návrhů
      setBrandSuggestions(matches);
      setShowBrandSuggestions(matches.length > 0);
    } else {
      setShowBrandSuggestions(false);
    }
  };

  const selectBrand = (brand) => {
    setData((prev) => ({ ...prev, brand }));
    setShowBrandSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (!showBrandSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < brandSuggestions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : brandSuggestions.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (brandSuggestions[highlightedIndex]) {
        selectBrand(brandSuggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowBrandSuggestions(false);
    }
  };

  const handleScaleChange = (e) => {
    const val = e.target.value;
    setData({ ...data, scale: val });
    setHighlightedScaleIndex(0);

    const matches = COMMON_SCALES.filter((s) => s.includes(val));
    setScaleSuggestions(matches);
    setShowScaleSuggestions(matches.length > 0);
  };

  const selectScale = (scale) => {
    setData((prev) => ({ ...prev, scale }));
    setShowScaleSuggestions(false);
  };

  const handleScaleKeyDown = (e) => {
    if (!showScaleSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedScaleIndex((prev) =>
        prev < scaleSuggestions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedScaleIndex((prev) =>
        prev > 0 ? prev - 1 : scaleSuggestions.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (scaleSuggestions[highlightedScaleIndex]) {
        selectScale(scaleSuggestions[highlightedScaleIndex]);
      }
    } else if (e.key === "Escape") {
      setShowScaleSuggestions(false);
    }
  };

  // --- MARKETPLACE HANDLERS ---
  const handleAddOffer = () => {
    if (!newOffer.shopName || !newOffer.price) return;
    const offer = { ...newOffer, status: "Vlastní" };
    setData((prev) => ({
      ...prev,
      marketplace: [...(prev.marketplace || []), offer],
    }));
    setNewOffer({ shopName: "", price: "", shopUrl: "" });
    setShowAddOffer(false);
  };

  const handleDeleteOffer = (index) => {
    setData((prev) => ({
      ...prev,
      marketplace: prev.marketplace.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4 p-4">
      <style>{`
        .scalemates-content ul { list-style: disc; padding-left: 1.2rem; margin: 0.5rem 0; }
        .scalemates-content li { margin-bottom: 0.25rem; }
        .scalemates-content a { color: #60a5fa; }
        .scalemates-content a:hover { text-decoration: underline; }
        .scalemates-content img { display: inline; vertical-align: middle; margin-right: 4px; max-height: 14px; }
        .scalemates-content b, .scalemates-content strong { color: #e2e8f0; }
      `}</style>
      {/* HLAVIČKA: OBRÁZEK A ZÁKLADNÍ DATA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-32 shrink-0">
          {data.image ? (
            <img
              src={data.image}
              alt="Boxart"
              className="w-full rounded-lg shadow-md border border-slate-700 object-cover"
            />
          ) : (
            <div className="w-full h-32 sm:h-full min-h-[8rem] bg-slate-800/50 rounded-lg border-2 border-slate-700 border-dashed flex items-center justify-center text-slate-600">
              <ImageOff size={32} className="opacity-50" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-3 sm:flex gap-3">
            <div className="col-span-3 sm:flex-1 relative">
              <FloatingInput
                className="w-full"
                label="Výrobce *"
                value={data.brand || ""}
                onChange={handleBrandChange}
                onFocus={(e) => {
                  if (e.target.value) handleBrandChange(e);
                }}
                onBlur={() =>
                  setTimeout(() => setShowBrandSuggestions(false), 200)
                }
                onKeyDown={handleKeyDown}
                placeholder="Kinetic"
                labelColor={
                  isUnknownBrand ? "text-yellow-500" : "text-blue-400"
                }
                classNameInput={isUnknownBrand ? "border-yellow-500/50" : ""}
                autoComplete="off"
              />
              {showBrandSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/10 animate-in fade-in zoom-in-95">
                  <div className="max-h-60 overflow-y-auto p-2">
                    {brandSuggestions.map((brand, index) => (
                      <div
                        key={brand}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Zabrání ztrátě fokusu inputu (blur)
                          selectBrand(brand);
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`
                          group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all mb-1 last:mb-0
                          ${
                            index === highlightedIndex
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-slate-300 hover:bg-slate-800"
                          }
                        `}
                      >
                        <span className="font-medium">{brand}</span>
                        {data.brand === brand && (
                          <Check
                            size={16}
                            className={
                              index === highlightedIndex
                                ? "text-white"
                                : "text-blue-500"
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isUnknownBrand && !showBrandSuggestions && (
                <div className="absolute top-full left-0 mt-1 text-[10px] text-yellow-500 font-bold animate-in fade-in z-10 pointer-events-none flex items-center gap-1">
                  <AlertTriangle size={10} /> Neznámý výrobce
                </div>
              )}
            </div>
            <div className="col-span-1 sm:w-20 relative">
              <FloatingInput
                className="w-full"
                label="Měřítko *"
                value={data.scale || ""}
                onChange={handleScaleChange}
                onFocus={(e) => {
                  const val = data.scale || "";
                  const matches = COMMON_SCALES.filter((s) => s.includes(val));
                  setScaleSuggestions(matches);
                  setShowScaleSuggestions(true);
                }}
                onBlur={() =>
                  setTimeout(() => setShowScaleSuggestions(false), 200)
                }
                onKeyDown={handleScaleKeyDown}
                placeholder="1/48"
                labelColor={
                  !isScaleValid(data.scale)
                    ? "text-red-500"
                    : isUnknownScale
                      ? "text-yellow-500"
                      : "text-blue-400"
                }
                classNameInput={
                  !isScaleValid(data.scale)
                    ? "border-red-500"
                    : isUnknownScale
                      ? "border-yellow-500/50"
                      : ""
                }
                autoComplete="off"
              />
              {showScaleSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/10 animate-in fade-in zoom-in-95 min-w-[100px]">
                  <div className="max-h-60 overflow-y-auto p-2">
                    {scaleSuggestions.map((scale, index) => (
                      <div
                        key={scale}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectScale(scale);
                        }}
                        onMouseEnter={() => setHighlightedScaleIndex(index)}
                        className={`
                          group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all mb-1 last:mb-0
                          ${
                            index === highlightedScaleIndex
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-slate-300 hover:bg-slate-800"
                          }
                        `}
                      >
                        <span className="font-medium">{scale}</span>
                        {data.scale === scale && (
                          <Check
                            size={14}
                            className={
                              index === highlightedScaleIndex
                                ? "text-white"
                                : "text-blue-500"
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isUnknownScale && (
                <div className="absolute top-full left-0 mt-1 text-[10px] text-yellow-500 font-bold animate-in fade-in z-10 pointer-events-none whitespace-nowrap flex items-center gap-1">
                  <AlertTriangle size={10} /> Atypické
                </div>
              )}
            </div>
            <FloatingInput
              className="col-span-1 sm:w-24"
              label="Kat. č."
              value={data.catNum || ""}
              onChange={(e) =>
                setData({ ...data, catNum: Normalizer.code(e.target.value) })
              }
              placeholder="48000"
              autoComplete="off"
            />
            <FloatingInput
              className="col-span-1 sm:w-20"
              label="Rok"
              value={data.year || ""}
              onChange={(e) => setData({ ...data, year: e.target.value })}
              placeholder="2024"
              autoComplete="off"
            />
          </div>
          <FloatingInput
            className="w-full"
            label="Název *"
            value={data.subject || ""}
            onChange={(e) => setData({ ...data, subject: e.target.value })}
            placeholder="TF-104G"
            labelColor="text-blue-400"
            autoComplete="off"
          />
          <p className="text-[10px] text-blue-400/60 font-bold leading-tight">
            * Povinné údaje. Bez vyplnění Výrobce, Měřítka a Názvu nebude
            fungovat vyhledávání na Scalemates.
          </p>
        </div>
      </div>

      {/* DUPLICATE WARNING */}
      {duplicateKit && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="bg-yellow-500/20 p-2 rounded-full text-yellow-500 shrink-0">
            <Copy size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-yellow-500">
              Možná duplicita
            </h4>
            <p className="text-xs text-yellow-200/80 mt-1">
              Tento model už máte ve skladu:{" "}
              <strong>
                {duplicateKit.brand} {duplicateKit.subject}
              </strong>{" "}
              (Status:{" "}
              {duplicateKit.status === "new"
                ? "V kitníku"
                : duplicateKit.status === "wip"
                  ? "Na stole"
                  : duplicateKit.status === "finished"
                    ? "Hotovo"
                    : duplicateKit.status === "wishlist"
                      ? "V nákupním seznamu"
                      : "Vrakoviště"}
              ).
            </p>
            <p className="text-[10px] text-yellow-500/60 mt-2 italic">
              Pokud je to záměr (např. druhý kus), můžete toto varování
              ignorovat.
            </p>
          </div>
        </div>
      )}

      {/* SCALEMATES INTEGRATION */}
      {!preferences?.disableScalemates && (
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <img
                src="https://www.scalemates.com/favicon.ico"
                alt="SM"
                className="w-3 h-3 opacity-50 grayscale"
              />
              Scalemates Integrace
            </h4>
            {data.scalematesUrl && (
              <a
                href={data.scalematesUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
              >
                Otevřít <ExternalLink size={10} />
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-colors"
              placeholder="Vložte URL kitu ze Scalemates..."
              value={data.scalematesUrl || ""}
              onChange={(e) =>
                setData({ ...data, scalematesUrl: e.target.value })
              }
            />
            <button
              onClick={() => {
                const query = data.catNum
                  ? `${data.brand} ${data.catNum}`
                  : `${data.brand} ${data.subject} ${data.scale}`;
                window.open(
                  `https://www.scalemates.com/search.php?q=${encodeURIComponent(query)}`,
                  "_blank",
                );
              }}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded border border-slate-600 transition-colors"
              title="Najít na Scalemates (otevře nové okno)"
            >
              <Search size={16} />
            </button>
            <button
              onClick={handleScrape}
              disabled={!data.scalematesUrl || isScraping}
              className={`p-2 rounded border flex items-center gap-2 transition-all ${
                data.scalematesUrl
                  ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-lg shadow-blue-900/20"
                  : "bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed"
              }`}
              title="Načíst data (Scraper)"
            >
              {isScraping ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <CustomSelect
            label="Status"
            value={data.status}
            onChange={(val) => setData({ ...data, status: val })}
            options={[
              { value: "new", label: "Skladem", icon: Package },
              { value: "wip", label: "Rozestavěno", icon: Hammer },
              { value: "finished", label: "Hotovo", icon: Trophy },
              { value: "wishlist", label: "Chci koupit", icon: ShoppingCart },
              { value: "scrap", label: "Vrakoviště", icon: Skull },
            ]}
          />
        </div>
        <div>
          <CustomSelect
            label="Projekt"
            value={data.projectId || ""}
            onChange={(val) => setData({ ...data, projectId: val || null })}
            placeholder="-- Žádný --"
            options={projects.map((p) => ({
              value: p.id,
              label: p.name,
              icon: Folder,
            }))}
          />
        </div>
      </div>

      {/* MARKINGS (Varianty) */}
      <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/30">
        <button
          onClick={() => setShowMarkings(!showMarkings)}
          className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <span>Varianty zbarvení (Markings)</span>
          {showMarkings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showMarkings && (
          <div className="p-3 text-xs text-slate-400 border-t border-slate-700 bg-slate-900/50">
            {data.markings ? (
              <div
                className="scalemates-content space-y-1"
                dangerouslySetInnerHTML={{ __html: data.markings }}
              />
            ) : (
              <p className="italic opacity-50">
                Žádné varianty. (Zde bude možné přidat vlastní nebo AI
                generované)
              </p>
            )}
          </div>
        )}
      </div>

      {/* MARKETPLACE (Ceny) */}
      <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/30">
        <button
          onClick={() => setShowMarketplace(!showMarketplace)}
          className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <span>Tržiště / Ceny ({data.marketplace?.length || 0})</span>
          {showMarketplace ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </button>
        {showMarketplace && (
          <div className="p-2 border-t border-slate-700 bg-slate-900/50 space-y-1">
            {/* Seznam nabídek */}
            {data.marketplace && data.marketplace.length > 0
              ? data.marketplace.map((offer, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded hover:bg-slate-800 transition-colors group gap-2"
                  >
                    <a
                      href={offer.shopUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-between min-w-0"
                    >
                      <span className="text-xs text-blue-400 font-medium group-hover:underline truncate mr-2">
                        {offer.shopName}
                      </span>
                      <div className="text-right shrink-0">
                        <span className="block text-xs font-bold text-green-400">
                          {offer.price}
                        </span>
                        {offer.status && (
                          <span className="block text-[9px] text-slate-500">
                            {offer.status}
                          </span>
                        )}
                      </div>
                    </a>
                    <button
                      onClick={() => handleDeleteOffer(idx)}
                      className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Odstranit nabídku"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              : !showAddOffer && (
                  <p className="text-xs text-slate-500 italic p-2">
                    Žádné nabídky.
                  </p>
                )}

            {/* Přidání nové nabídky */}
            {showAddOffer ? (
              <div className="p-2 bg-slate-800 rounded border border-slate-600 mt-2 animate-in fade-in">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    placeholder="Obchod (např. MN Modelář)"
                    className="bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white outline-none focus:border-blue-500"
                    value={newOffer.shopName}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, shopName: e.target.value })
                    }
                  />
                  <input
                    placeholder="Cena (např. 450 Kč)"
                    className="bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white outline-none focus:border-blue-500"
                    value={newOffer.price}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, price: e.target.value })
                    }
                  />
                </div>
                <input
                  placeholder="URL odkazu (volitelné)"
                  className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white outline-none focus:border-blue-500 mb-2"
                  value={newOffer.shopUrl}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, shopUrl: e.target.value })
                  }
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddOffer(false)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1"
                  >
                    Zrušit
                  </button>
                  <button
                    onClick={handleAddOffer}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded font-bold"
                  >
                    Přidat
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-1 mt-1">
                <button
                  onClick={() => setShowAddOffer(true)}
                  className="w-full py-1.5 border border-dashed border-slate-600 rounded text-xs text-slate-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-slate-800 transition-all flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> Přidat vlastní cenu / obchod
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <FloatingTextarea
          label="Poznámky"
          value={data.notes || ""}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          height="h-32"
        />
      </div>
    </div>
  );
};

export default KitInfoTab;
