import React from "react";
import { Palette, Trash2 } from "lucide-react";

const KitPaintsTab = ({ data, setData, allPaints }) => {
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

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
          <Palette size={14} className="text-blue-400" /> Barvy modelu (
          {data.paints?.length || 0})
        </h4>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {data.paints && data.paints.length > 0 ? (
          data.paints.map((paintLink, idx) => {
            let fullPaint = allPaints.find((p) => p.id === paintLink.id);
            if (!fullPaint) {
              fullPaint = {
                id: paintLink.id,
                code: "???",
                name: "Neznámá",
                hex: "#333",
                status: "scrap",
              };
            }
            return (
              <div
                key={`${paintLink.id}_${idx}`}
                className="bg-slate-800 p-3 rounded border border-slate-700 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-slate-600"
                      style={{ backgroundColor: fullPaint.hex }}
                    ></div>
                    <span className="text-sm font-bold text-white">
                      {fullPaint.code} - {fullPaint.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemovePaint(paintLink.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <input
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500"
                  placeholder="Poznámka (např. trup, kokpit...)"
                  value={paintLink.note || ""}
                  onChange={(e) =>
                    handleUpdatePaintNote(paintLink.id, e.target.value)
                  }
                />
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-600 italic">
            Zatím žádné přiřazené barvy.
          </div>
        )}
      </div>
    </div>
  );
};

export default KitPaintsTab;
