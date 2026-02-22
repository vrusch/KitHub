import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  ShoppingBag,
  Trash2,
  Box,
  Package,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
import { safeRender } from "../../utils/helpers";

/**
 * Karta zobrazující detail barvy v seznamu (Sklad, Nákupní seznam).
 * Zobrazuje kód, název, status, použití v modelech a stav ingrediencí (pokud jde o mix).
 *
 * @param {Object} props
 * @param {Object} props.paint - Data barvy.
 * @param {Function} [props.onClick] - Handler kliknutí na kartu (otevření detailu).
 * @param {Function} [props.onDelete] - Handler pro smazání barvy.
 * @param {Function} [props.onBuy] - Handler pro přidání do košíku/označení jako koupené.
 * @param {Array} [props.allPaints] - Seznam všech barev (pro výpočet dostupnosti ingrediencí u mixů).
 * @param {Array} [props.allKits] - Seznam všech modelů (pro výpočet použití barvy).
 * @param {Function} [props.onShowUsage] - Handler pro zobrazení filtru modelů používajících tuto barvu.
 * @returns {JSX.Element}
 */
const PaintCard = React.memo(
  ({ paint, onClick, onDelete, onBuy, allPaints, allKits, onShowUsage }) => {
    const getStatusStyle = (s) => {
      switch (s) {
        case "in_stock":
          return "border-l-green-500";
        case "low":
          return "border-l-orange-500";
        case "wanted":
          return "border-l-purple-500 border-dashed";
        case "empty":
          return "border-l-purple-500 border-dashed"; // Empty se nyní tváří jako Wanted (Koupit)
        default:
          return "border-l-slate-700";
      }
    };

    // Výpočet ingrediencí pro mix
    const mixStats = React.useMemo(() => {
      if (!paint.isMix || !paint.mixParts || !allPaints) return null;
      const total = paint.mixParts.length;
      if (total === 0) return null;

      const owned = paint.mixParts.filter((part) => {
        const ingredient = allPaints.find((p) => p.id === part.paintId);
        return ingredient && ingredient.status === "in_stock";
      }).length;

      return { total, owned };
    }, [paint.isMix, paint.mixParts, allPaints]);

    let mixStatusIcon = null;
    let mixStatusColor = "";
    let mixStatusText = "";

    if (paint.isMix && paint.status !== "in_stock" && mixStats) {
      if (mixStats.owned === mixStats.total) {
        mixStatusIcon = <CheckCircle2 size={14} />;
        mixStatusColor = "text-yellow-400";
        mixStatusText = "Namíchat";
      } else if (mixStats.owned === 0) {
        mixStatusIcon = <FlaskConical size={14} />;
        mixStatusColor = "text-slate-500";
        mixStatusText = "Jen recept";
      } else {
        mixStatusIcon = <AlertCircle size={14} />;
        mixStatusColor = "text-red-500";
        mixStatusText = "Chybí složky";
      }
    }

    // Výpočet použití v modelech
    const usageCount = React.useMemo(() => {
      if (!allKits) return 0;
      return allKits.filter((k) => k.paints?.some((p) => p.id === paint.id))
        .length;
    }, [allKits, paint.id]);

    return (
      <div
        onClick={() => onClick && onClick(paint)}
        className={`bg-slate-800 rounded-lg p-3 mb-2 shadow-sm hover:bg-slate-750 cursor-pointer transition-all border border-slate-700 border-l-4 ${getStatusStyle(paint.status)} flex items-center justify-between group`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-8 h-8 rounded-full shadow-inner border border-slate-600 shrink-0 flex items-center justify-center bg-slate-900"
            style={{ backgroundColor: paint.hex || "#999" }}
            title={paint.hex}
          >
            {paint.isMix && (
              <FlaskConical size={14} className="text-white opacity-50" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
                {safeRender(paint.brand)}
              </span>
              <span
                className={`text-xs ${paint.isMix ? "text-slate-500 font-normal" : "font-bold text-white"} truncate`}
              >
                {safeRender(paint.code)}
              </span>
            </div>
            <p
              className={`truncate ${paint.isMix ? "text-sm font-bold text-white" : "text-xs text-slate-400"}`}
            >
              {safeRender(paint.name)}
            </p>
          </div>
        </div>
        <div className="ml-2 flex flex-col items-end shrink-0 gap-1">
          {onBuy ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy(paint);
              }}
              className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg shadow-lg flex items-center justify-center transition-all active:scale-95"
            >
              <ShoppingBag size={20} />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 ${mixStatusColor ? "bg-slate-900 border border-slate-700 " + mixStatusColor : paint.status === "in_stock" ? "bg-green-500/10 text-green-500" : paint.status === "low" ? "bg-orange-500/10 text-orange-500" : paint.status === "wanted" ? "bg-purple-500/10 text-purple-500" : "bg-red-500/10 text-red-500"}`}
                  >
                    {mixStatusIcon ? (
                      <>
                        {mixStatusIcon}
                        {mixStatusText}
                      </>
                    ) : paint.status === "in_stock" ? (
                      <>
                        <Package size={14} />
                        {paint.isMix ? "Mám namícháno" : "Skladem"}
                      </>
                    ) : paint.status === "low" ? (
                      <>
                        <AlertTriangle size={14} />
                        Dochází
                      </>
                    ) : paint.status === "wanted" ||
                      paint.status === "empty" ? (
                      <>
                        <ShoppingCart size={14} />
                        Koupit
                      </>
                    ) : (
                      "?"
                    )}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {paint.isMix ? "Vlastní Mix" : safeRender(paint.type)}
                  </span>
                </div>
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(paint.id);
                    }}
                    className="text-slate-600 hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                {/* Badge použití v modelech */}
                {usageCount > 0 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onShowUsage) onShowUsage(paint);
                    }}
                    className={`flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 shrink-0 ${onShowUsage ? "cursor-pointer hover:bg-blue-500/20 hover:border-blue-500/40" : ""}`}
                  >
                    <Box size={10} />
                    <span>{usageCount}</span>
                  </div>
                )}
                {/* Badge ingrediencí (pro mixy) */}
                {mixStats && (
                  <div
                    className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      mixStats.owned === mixStats.total
                        ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    <FlaskConical size={10} />
                    <span>
                      {mixStats.owned}/{mixStats.total}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  },
);

export default PaintCard;
