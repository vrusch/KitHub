import React, { useState } from "react";
import {
  Layers,
  Puzzle,
  ExternalLink,
  Trash2,
  Plus,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Youtube,
  Link as LinkIcon,
  ShoppingCart,
  CheckCircle2,
  Pencil,
  Save,
  X,
} from "lucide-react";
import ConfirmModal from "../../ui/ConfirmModal";

const KitResourcesTab = ({ data, setData }) => {
  const [newAccessory, setNewAccessory] = useState({
    name: "",
    status: "owned",
    url: "",
  });
  const [newAttachment, setNewAttachment] = useState({
    name: "",
    url: "",
    type: "manual", // manual, photo, video, other
  });
  const [editingId, setEditingId] = useState(null);
  const [editingAttachmentId, setEditingAttachmentId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const handleSaveAccessory = () => {
    if (!newAccessory.name.trim()) return;

    if (editingId) {
      setData({
        ...data,
        accessories: data.accessories.map((a) =>
          a.id === editingId ? { ...newAccessory, id: editingId } : a,
        ),
      });
      setEditingId(null);
    } else {
      setData({
        ...data,
        accessories: [
          ...(data.accessories || []),
          { id: Date.now(), ...newAccessory },
        ],
      });
    }
    setNewAccessory({ name: "", status: "owned", url: "" });
  };

  const startEditing = (acc) => {
    setNewAccessory({
      name: acc.name,
      status: acc.status,
      url: acc.url || "",
    });
    setEditingId(acc.id);
  };

  const cancelEditing = () => {
    setNewAccessory({ name: "", status: "owned", url: "" });
    setEditingId(null);
  };

  const deleteAccessory = (id) => {
    setConfirmConfig({
      title: "Smazat doplněk",
      message: "Opravdu chcete smazat tento doplněk?",
      confirmText: "Smazat",
      isDestructive: true,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          accessories: prev.accessories.filter((a) => a.id !== id),
        }));
        if (editingId === id) {
          setNewAccessory({ name: "", status: "owned", url: "" });
          setEditingId(null);
        }
        setConfirmConfig(null);
      },
    });
  };

  const handleSaveAttachment = () => {
    if (!newAttachment.name.trim() || !newAttachment.url.trim()) return;

    if (editingAttachmentId) {
      setData({
        ...data,
        attachments: data.attachments.map((a) =>
          a.id === editingAttachmentId
            ? { ...newAttachment, id: editingAttachmentId }
            : a,
        ),
      });
      setEditingAttachmentId(null);
    } else {
      setData({
        ...data,
        attachments: [
          ...(data.attachments || []),
          { id: Date.now(), ...newAttachment },
        ],
      });
    }
    setNewAttachment({ name: "", url: "", type: "manual" });
  };

  const startEditingAttachment = (att) => {
    setNewAttachment({
      name: att.name,
      url: att.url,
      type: att.type || "manual",
    });
    setEditingAttachmentId(att.id);
  };

  const cancelEditingAttachment = () => {
    setNewAttachment({ name: "", url: "", type: "manual" });
    setEditingAttachmentId(null);
  };

  const deleteAttachment = (id) => {
    setConfirmConfig({
      title: "Smazat přílohu",
      message: "Opravdu chcete odstranit tento odkaz/soubor?",
      confirmText: "Smazat",
      isDestructive: true,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          attachments: prev.attachments.filter((a) => a.id !== id),
        }));
        if (editingAttachmentId === id) {
          setNewAttachment({ name: "", url: "", type: "manual" });
          setEditingAttachmentId(null);
        }
        setConfirmConfig(null);
      },
    });
  };

  const getAttachmentIcon = (type) => {
    switch (type) {
      case "manual":
        return <FileText size={14} className="text-orange-400" />;
      case "photo":
        return <ImageIcon size={14} className="text-blue-400" />;
      case "video":
        return <Youtube size={14} className="text-red-400" />;
      default:
        return <LinkIcon size={14} className="text-slate-400" />;
    }
  };

  const isImageUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(urlObj.pathname);
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-6 p-4">
      {confirmConfig && (
        <ConfirmModal
          isOpen={true}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          isDestructive={confirmConfig.isDestructive}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
      {/* SEKCE 1: DOPLŇKY */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
          <Puzzle size={14} className="text-purple-400" /> Doplňky (Aftermarket)
        </h4>

        {/* Input Row */}
        <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
          <input
            className="bg-transparent border-none text-xs text-white placeholder-slate-600 focus:ring-0 px-2"
            placeholder="Název doplňku (např. Eduard Plechy)..."
            value={newAccessory.name}
            onChange={(e) =>
              setNewAccessory({ ...newAccessory, name: e.target.value })
            }
          />
          <select
            className="bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-300 py-1 px-2 outline-none focus:border-blue-500"
            value={newAccessory.status}
            onChange={(e) =>
              setNewAccessory({ ...newAccessory, status: e.target.value })
            }
          >
            <option value="owned">Mám</option>
            <option value="wanted">Chci</option>
          </select>
          <input
            className="bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-600 px-2 py-1"
            placeholder="URL (volitelné)..."
            value={newAccessory.url}
            onChange={(e) =>
              setNewAccessory({ ...newAccessory, url: e.target.value })
            }
          />
          <div className="flex gap-1">
            {editingId && (
              <button
                onClick={cancelEditing}
                className="bg-slate-700 hover:bg-slate-600 text-white p-1.5 rounded transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={handleSaveAccessory}
              disabled={!newAccessory.name.trim()}
              className={`${
                editingId
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-purple-600 hover:bg-purple-500"
              } disabled:opacity-50 text-white p-1.5 rounded transition-colors`}
            >
              {editingId ? <Save size={16} /> : <Plus size={16} />}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {data.accessories?.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 p-2 rounded border border-slate-700/50 transition-colors group"
            >
              {acc.status === "owned" ? (
                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
              ) : (
                <ShoppingCart size={14} className="text-orange-400 shrink-0" />
              )}
              <span className="text-sm text-slate-200 font-medium flex-1 truncate">
                {acc.name}
              </span>
              {acc.url && (
                <a
                  href={acc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 p-1"
                  title="Otevřít odkaz"
                >
                  <ExternalLink size={14} />
                </a>
              )}
              <div className="flex gap-1">
                <button
                  onClick={() => startEditing(acc)}
                  className="text-slate-400 hover:text-blue-400 p-1 hover:bg-slate-700 rounded"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteAccessory(acc.id)}
                  className="text-slate-400 hover:text-red-400 p-1 hover:bg-slate-700 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {(!data.accessories || data.accessories.length === 0) && (
            <p className="text-xs text-slate-600 italic text-center py-2">
              Žádné doplňky.
            </p>
          )}
        </div>
      </div>

      {/* SEKCE 2: PŘÍLOHY */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
          <Layers size={14} className="text-blue-400" /> Podklady a Návody
        </h4>

        {/* Input Row */}
        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
          <input
            className="bg-transparent border-none text-xs text-white placeholder-slate-600 focus:ring-0 px-2"
            placeholder="Název (např. Návod PDF)..."
            value={newAttachment.name}
            onChange={(e) =>
              setNewAttachment({ ...newAttachment, name: e.target.value })
            }
          />
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded px-2 py-1">
            <LinkIcon size={12} className="text-slate-500" />
            <input
              className="bg-transparent border-none text-xs text-white placeholder-slate-600 focus:ring-0 w-full p-0"
              placeholder="https://..."
              value={newAttachment.url}
              onChange={(e) =>
                setNewAttachment({ ...newAttachment, url: e.target.value })
              }
            />
          </div>
          <select
            className="bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-300 py-1 px-2 outline-none focus:border-blue-500"
            value={newAttachment.type}
            onChange={(e) =>
              setNewAttachment({ ...newAttachment, type: e.target.value })
            }
          >
            <option value="manual">Návod</option>
            <option value="photo">Fotky</option>
            <option value="video">Video</option>
            <option value="other">Jiné</option>
          </select>
          <div className="flex gap-1">
            {editingAttachmentId && (
              <button
                onClick={cancelEditingAttachment}
                className="bg-slate-700 hover:bg-slate-600 text-white p-1.5 rounded transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={handleSaveAttachment}
              disabled={!newAttachment.name.trim() || !newAttachment.url.trim()}
              className={`${
                editingAttachmentId
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-blue-600 hover:bg-blue-500"
              } disabled:opacity-50 text-white p-1.5 rounded transition-colors`}
            >
              {editingAttachmentId ? <Save size={16} /> : <Plus size={16} />}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {data.attachments?.map((att) => (
            <a
              key={att.id}
              href={att.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 p-2 rounded border border-slate-700/50 transition-colors group"
            >
              {isImageUrl(att.url) ? (
                <img
                  src={att.url}
                  alt={att.name}
                  className="w-10 h-10 object-cover rounded border border-slate-700 shrink-0 bg-slate-900"
                />
              ) : (
                <div className="bg-slate-900 p-1.5 rounded border border-slate-700 shrink-0">
                  {getAttachmentIcon(att.type)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-200 font-medium truncate">
                  {att.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {att.url}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    startEditingAttachment(att);
                  }}
                  className="text-slate-400 hover:text-blue-400 p-2 hover:bg-slate-700 rounded"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    deleteAttachment(att.id);
                  }}
                  className="text-slate-400 hover:text-red-400 p-2 hover:bg-slate-700 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </a>
          ))}
          {(!data.attachments || data.attachments.length === 0) && (
            <p className="text-xs text-slate-600 italic text-center py-2">
              Žádné přílohy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KitResourcesTab;
