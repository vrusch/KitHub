import React, { useState } from "react";
import {
  Layers,
  Check,
  Package,
  ExternalLink,
  Trash2,
  Plus,
  Paperclip,
  FileText,
  ImageIcon,
  BookOpen,
  AlertTriangle,
} from "lucide-react";

const KitResourcesTab = ({ data, setData }) => {
  const [newAccessory, setNewAccessory] = useState({
    name: "",
    status: "owned",
    url: "",
  });
  const [newAttachment, setNewAttachment] = useState({
    name: "",
    url: "",
    type: "manual",
  });

  const addAccessory = () => {
    if (!newAccessory.name.trim()) return;
    setData({
      ...data,
      accessories: [
        ...(data.accessories || []),
        { id: Date.now(), ...newAccessory },
      ],
    });
    setNewAccessory({ name: "", status: "owned", url: "" });
  };

  const deleteAccessory = (id) => {
    setData({
      ...data,
      accessories: data.accessories.filter((a) => a.id !== id),
    });
  };

  const addAttachment = () => {
    if (newAttachment.name.trim() && newAttachment.url.trim()) {
      setData({
        ...data,
        attachments: [
          ...(data.attachments || []),
          { id: Date.now(), ...newAttachment },
        ],
      });
      setNewAttachment({ name: "", url: "", type: "manual" });
    }
  };

  const deleteAttachment = (id) => {
    setData({
      ...data,
      attachments: data.attachments.filter((a) => a.id !== id),
    });
  };

  return (
    <div className="space-y-4 p-4">
      {/* SEKCE 1: DOPLŇKY */}
      <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
          <Layers size={14} /> Doplňky pro tento model
        </h4>
        <div className="mb-3 p-2 bg-slate-900 rounded border border-slate-700">
          <input
            className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white mb-2"
            placeholder="Název (např. Eduard Plechy)"
            value={newAccessory.name}
            onChange={(e) =>
              setNewAccessory({ ...newAccessory, name: e.target.value })
            }
          />
          <div className="flex gap-2">
            <button
              onClick={addAccessory}
              className="bg-green-600 text-white px-3 rounded"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {data.accessories?.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700"
            >
              <span className="text-sm text-white">{acc.name}</span>
              <button
                onClick={() => deleteAccessory(acc.id)}
                className="text-slate-600 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SEKCE 2: PŘÍLOHY */}
      <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
          <Paperclip size={14} /> Knihovna odkazů
        </h4>
        <div className="bg-slate-900 p-2 rounded border border-slate-700 mb-3">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white"
              placeholder="URL..."
              value={newAttachment.url}
              onChange={(e) =>
                setNewAttachment({ ...newAttachment, url: e.target.value })
              }
            />
            <button
              onClick={addAttachment}
              className="bg-purple-600 text-white px-3 rounded"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {data.attachments?.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700"
            >
              <span className="text-xs text-white truncate">{att.name}</span>
              <button
                onClick={() => deleteAttachment(att.id)}
                className="text-slate-600 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KitResourcesTab;
