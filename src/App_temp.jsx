import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Folder,
  Plus,
  Search,
  Filter,
  X,
  Save,
  Trash2,
  ExternalLink,
  Paperclip,
  CheckSquare,
  Hammer,
  ShoppingCart,
  Box,
  Archive,
  FileText,
  ChevronRight,
  Calendar,
  Layers,
  Link as LinkIcon,
  Check,
  Image as ImageIcon,
  BookOpen,
  Download,
  Edit,
  Link2,
  Unlink,
  History,
} from "lucide-react";

// ==========================================
// 🔧 KONFIGURACE A DATOVÉ MODELY
// ==========================================

const APP_VERSION = "v1.5.0-ui-final";

// Výchozí data pro ukázku
const DEMO_KITS = [
  {
    id: 1,
    status: "wip",
    brand: "Tamiya",
    catNum: "35216",
    scale: "1/35",
    name: "Tiger I Early Production",
    projectId: 1,
    progress: 45,
    todo: [
      { id: "t1", text: "Slepit podvozek", done: true },
      { id: "t2", text: "Nabarvit kola", done: true },
      { id: "t3", text: "Zimmerit", done: false },
      { id: "t4", text: "Weathering", done: false },
    ],
    accessories: [
      { id: "a1", name: "Kovová hlaveň (Aber)", status: "owned", url: "" },
      {
        id: "a2",
        name: "Friul pásy",
        status: "wanted",
        url: "https://super-hobby.cz",
      },
    ],
    scalematesUrl:
      "https://www.scalemates.com/kits/tamiya-35216-tiger-i--132865",
    attachments: [
      { id: 1, name: "Návod PDF (Drive)", url: "#", type: "manual" },
      {
        id: 2,
        name: "Walkaround PrimePortal",
        url: "http://www.primeportal.net/tanks/tiger.htm",
        type: "ref",
      },
    ],
    notes: "Pozor na geometrii věže. Plánuji zimní kamufláž.",
  },
  {
    id: 2,
    status: "new",
    brand: "Eduard",
    catNum: "82151",
    scale: "1/48",
    name: "Spitfire Mk.IXc",
    projectId: null,
    progress: 0,
    todo: [],
    accessories: [],
    scalematesUrl: "",
    attachments: [],
    notes: "",
  },
  {
    id: 3,
    status: "wishlist",
    brand: "Meng",
    catNum: "TS-031",
    scale: "1/35",
    name: "King Tiger (Henschel)",
    projectId: 1,
    progress: 0,
    todo: [],
    accessories: [],
    scalematesUrl: "",
    attachments: [],
    notes: "Čekám na slevu.",
  },
];

const DEMO_PROJECTS = [
  {
    id: 1,
    name: "Zimní ofenzíva 1944",
    description: "Dioráma z Arden. Tiger + King Tiger + figurky.",
    status: "active",
    accessories: [
      { id: "pa1", name: "Sádra na terén", status: "owned", url: "" },
      { id: "pa2", name: "Statická tráva (zimní)", status: "wanted", url: "" },
    ],
  },
  {
    id: 2,
    name: "Bitva o Británii",
    description: "Série letadel RAF vs Luftwaffe.",
    status: "planned",
    accessories: [],
  },
];

// ==========================================
// 🧩 KOMPONENTY
// ==========================================

// --- HLAVNÍ KARTA MODELU (MINIMALISTICKÁ) ---
const KitCard = ({ kit, onClick, projectName }) => {
  const getStatusColor = (s) => {
    switch (s) {
      case "new":
        return "border-l-4 border-l-blue-500";
      case "wip":
        return "border-l-4 border-l-orange-500";
      case "finished":
        return "border-l-4 border-l-green-500 opacity-70";
      case "wishlist":
        return "border-l-4 border-l-purple-500 border-dashed";
      default:
        return "border-slate-700";
    }
  };

  return (
    <div
      onClick={() => onClick(kit)}
      className={`bg-slate-800 rounded-lg p-3 mb-2 shadow-sm hover:bg-slate-750 cursor-pointer transition-all border border-slate-700 ${getStatusColor(kit.status)} relative group`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
              {kit.scale}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              {kit.brand} {kit.catNum && `• ${kit.catNum}`}
            </span>
          </div>
          <h3 className="font-bold text-slate-100 leading-tight mb-1">
            {kit.name}
          </h3>

          {/* Zobrazení Projektu (Aktivní nebo Historie) */}
          {projectName && (
            // ZVĚTŠENÁ IKONA A PÍSMO PRO PROJEKT
            <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-2 font-medium">
              <Folder size={14} /> <span>{projectName}</span>
            </div>
          )}
          {!projectName && kit.legacyProject && (
            <div
              className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 italic"
              title="Tento model byl součástí projektu, který byl smazán."
            >
              <History size={14} /> <span>Ex-projekt: {kit.legacyProject}</span>
            </div>
          )}
        </div>
        {kit.status === "wip" && (
          <div className="flex flex-col items-end">
            <span className="text-xs font-mono text-orange-400">
              {kit.progress}%
            </span>
            <div className="w-12 h-1 bg-slate-700 rounded-full mt-1">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${kit.progress}%` }}
              ></div>
            </div>
          </div>
        )}
        {kit.status === "wishlist" && (
          <ShoppingCart size={16} className="text-purple-400" />
        )}

        {/* Indikátor příloh */}
        {(kit.scalematesUrl ||
          (kit.attachments && kit.attachments.length > 0)) && (
          <div className="absolute bottom-2 right-2 text-slate-600">
            <Paperclip size={14} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- MODÁLNÍ OKNO DETAILU PROJEKTU (VYLEPŠENÉ) ---
const ProjectDetailModal = ({
  project,
  onClose,
  onSave,
  onDelete,
  allKits,
  onUpdateKitLink,
  onCreateWishlistKit,
}) => {
  const [data, setData] = useState({ accessories: [], ...project });
  const [activeTab, setActiveTab] = useState("info");

  // States for Kits management
  const [showLinkKit, setShowLinkKit] = useState(false);
  const [selectedKitId, setSelectedKitId] = useState("");
  const [newWishlistKit, setNewWishlistKit] = useState({
    brand: "",
    name: "",
    scale: "",
  });
  const [showAddWishlist, setShowAddWishlist] = useState(false);

  // States for Accessories
  const [newAccessory, setNewAccessory] = useState({
    name: "",
    status: "owned",
    url: "",
  });

  // Derived: Kits in this project
  const projectKits = allKits.filter((k) => k.projectId === project.id);
  // Derived: Available kits (not in any project)
  const availableKits = allKits.filter((k) => !k.projectId);

  const handleLinkKit = () => {
    if (selectedKitId) {
      onUpdateKitLink(Number(selectedKitId), project.id);
      setShowLinkKit(false);
      setSelectedKitId("");
    }
  };

  const handleUnlinkKit = (kitId) => {
    if (confirm("Odebrat model z projektu? (Model zůstane ve skladu)")) {
      onUpdateKitLink(kitId, null);
    }
  };

  const handleCreateWishlistKit = () => {
    if (newWishlistKit.name) {
      onCreateWishlistKit({
        ...newWishlistKit,
        status: "wishlist",
        projectId: project.id,
      });
      setNewWishlistKit({ brand: "", name: "", scale: "" });
      setShowAddWishlist(false);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-lg rounded-xl border border-slate-700 shadow-2xl flex flex-col max-h-[95vh]">
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center rounded-t-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Folder size={20} className="text-blue-400" />{" "}
            {project.id ? "Upravit projekt" : "Nový projekt"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-slate-800 bg-slate-950">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === "info" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-500"}`}
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === "content" ? "text-orange-400 border-b-2 border-orange-400" : "text-slate-500"}`}
          >
            Modely a Doplňky
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto bg-slate-900">
          {activeTab === "info" && (
            <>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Název projektu
                </label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                  placeholder="Např. Bitva u Kurska"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Popis
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white h-24 focus:border-blue-500 outline-none resize-none"
                  placeholder="Popis záměru, kontextu..."
                  value={data.description}
                  onChange={(e) =>
                    setData({ ...data, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Stav
                </label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                  value={data.status}
                  onChange={(e) => setData({ ...data, status: e.target.value })}
                >
                  <option value="planned">📅 Plánováno</option>
                  <option value="active">🔥 Aktivní</option>
                  <option value="finished">✅ Dokončeno</option>
                  <option value="hold">⏸️ Pozastaveno</option>
                </select>
              </div>
            </>
          )}

          {activeTab === "content" && (
            <>
              {/* --- SEKCE MODELY --- */}
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Box size={14} /> Modely v projektu
                </h4>

                <div className="space-y-2 mb-3">
                  {projectKits.map((k) => (
                    <div
                      key={k.id}
                      className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {k.status === "wishlist" && (
                          <ShoppingCart
                            size={14}
                            className="text-purple-400 shrink-0"
                          />
                        )}
                        <span className="text-sm truncate">{k.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {k.scale}
                        </span>
                      </div>
                      <button
                        onClick={() => handleUnlinkKit(k.id)}
                        className="text-slate-600 hover:text-red-400 p-1"
                      >
                        <Unlink size={16} />
                      </button>
                    </div>
                  ))}
                  {projectKits.length === 0 && (
                    <p className="text-xs text-slate-600 italic">
                      Žádné modely.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setShowLinkKit(!showLinkKit);
                      setShowAddWishlist(false);
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs py-2 rounded flex items-center justify-center gap-1"
                  >
                    <Link2 size={14} /> Připojit ze skladu
                  </button>
                  <button
                    onClick={() => {
                      setShowAddWishlist(!showAddWishlist);
                      setShowLinkKit(false);
                    }}
                    className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs py-2 rounded flex items-center justify-center gap-1"
                  >
                    <ShoppingCart size={14} /> Přidat do nákupu
                  </button>
                </div>

                {/* Form: Připojit existující */}
                {showLinkKit && (
                  <div className="mt-3 p-2 bg-slate-900 rounded border border-slate-700 animate-in slide-in-from-top-2">
                    <select
                      className="w-full bg-slate-800 text-white text-xs p-2 rounded mb-2 border border-slate-600"
                      value={selectedKitId}
                      onChange={(e) => setSelectedKitId(e.target.value)}
                    >
                      <option value="">-- Vyber model ze skladu --</option>
                      {availableKits.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.name} ({k.scale})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleLinkKit}
                      disabled={!selectedKitId}
                      className="w-full bg-blue-600 text-white text-xs py-1.5 rounded disabled:opacity-50"
                    >
                      Připojit
                    </button>
                  </div>
                )}

                {/* Form: Přidat k nákupu */}
                {showAddWishlist && (
                  <div className="mt-3 p-2 bg-slate-900 rounded border border-slate-700 animate-in slide-in-from-top-2 space-y-2">
                    <input
                      className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-white"
                      placeholder="Název modelu"
                      value={newWishlistKit.name}
                      onChange={(e) =>
                        setNewWishlistKit({
                          ...newWishlistKit,
                          name: e.target.value,
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <input
                        className="flex-1 bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-white"
                        placeholder="Výrobce"
                        value={newWishlistKit.brand}
                        onChange={(e) =>
                          setNewWishlistKit({
                            ...newWishlistKit,
                            brand: e.target.value,
                          })
                        }
                      />
                      <input
                        className="w-20 bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-white"
                        placeholder="Měřítko"
                        value={newWishlistKit.scale}
                        onChange={(e) =>
                          setNewWishlistKit({
                            ...newWishlistKit,
                            scale: e.target.value,
                          })
                        }
                      />
                    </div>
                    <button
                      onClick={handleCreateWishlistKit}
                      disabled={!newWishlistKit.name}
                      className="w-full bg-purple-600 text-white text-xs py-1.5 rounded disabled:opacity-50"
                    >
                      Přidat do nákupního seznamu
                    </button>
                  </div>
                )}
              </div>

              {/* --- SEKCE DOPLŇKY PROJEKTU --- */}
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Layers size={14} /> Doplňky projektu
                </h4>

                <div className="mb-3 p-2 bg-slate-800 rounded border border-slate-700">
                  <input
                    className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white mb-2"
                    placeholder="Název (např. Sádra, Podložka)"
                    value={newAccessory.name}
                    onChange={(e) =>
                      setNewAccessory({ ...newAccessory, name: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <select
                      className="bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white"
                      value={newAccessory.status}
                      onChange={(e) =>
                        setNewAccessory({
                          ...newAccessory,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="owned">Mám</option>
                      <option value="wanted">Koupit</option>
                    </select>
                    <input
                      className="flex-1 bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white"
                      placeholder="URL..."
                      value={newAccessory.url}
                      onChange={(e) =>
                        setNewAccessory({
                          ...newAccessory,
                          url: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={addAccessory}
                      className="bg-green-600 text-white px-3 rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {data.accessories &&
                    data.accessories.map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {acc.status === "owned" ? (
                            <Check
                              size={14}
                              className="text-green-400 shrink-0"
                            />
                          ) : (
                            <ShoppingCart
                              size={14}
                              className="text-purple-400 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate">
                              {acc.name}
                            </p>
                            {acc.url && (
                              <a
                                href={acc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <LinkIcon size={10} /> Link
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteAccessory(acc.id)}
                          className="text-slate-600 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  {(!data.accessories || data.accessories.length === 0) && (
                    <p className="text-xs text-slate-600 italic">
                      Žádné doplňky projektu.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-between rounded-b-xl">
          {data.id ? (
            <button
              onClick={() => onDelete(data.id)}
              className="text-red-400 hover:text-red-300 px-3 py-2 text-sm flex items-center gap-2"
            >
              <Trash2 size={16} /> Smazat
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={() => onSave(data)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2"
          >
            <Save size={18} /> Uložit
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MODÁLNÍ OKNO DETAILU KITU ---
const KitDetailModal = ({ kit, onClose, onSave, onDelete, projects }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [data, setData] = useState({ ...kit });
  const [newTodo, setNewTodo] = useState("");
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

  const handleSave = () => onSave(data);

  // Todo List Logic
  const addTodo = () => {
    if (!newTodo.trim()) return;
    setData({
      ...data,
      todo: [
        ...(data.todo || []),
        { id: Date.now(), text: newTodo, done: false },
      ],
    });
    setNewTodo("");
  };
  const toggleTodo = (id) => {
    const updated = data.todo.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t,
    );
    const doneCount = updated.filter((t) => t.done).length;
    const newProgress =
      updated.length > 0 ? Math.round((doneCount / updated.length) * 100) : 0;
    setData({ ...data, todo: updated, progress: newProgress });
  };
  const deleteTodo = (id) => {
    setData({ ...data, todo: data.todo.filter((t) => t.id !== id) });
  };

  // Accessories Logic
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

  // Attachments Logic
  const addAttachment = () => {
    if (!newAttachment.name.trim() || !newAttachment.url.trim()) return;
    setData({
      ...data,
      attachments: [
        ...(data.attachments || []),
        { id: Date.now(), ...newAttachment },
      ],
    });
    setNewAttachment({ name: "", url: "", type: "manual" });
  };
  const deleteAttachment = (id) => {
    setData({
      ...data,
      attachments: data.attachments.filter((a) => a.id !== id),
    });
  };

  const openScalematesSearch = () => {
    const query = encodeURIComponent(
      `${data.brand} ${data.catNum} ${data.name}`,
    );
    window.open(`https://www.scalemates.com/search.php?q=${query}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl border border-slate-700 flex flex-col max-h-[95vh] shadow-2xl">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-start rounded-t-xl">
          <div className="flex-1 mr-4">
            <input
              className="text-xl font-bold bg-transparent border-none text-white w-full focus:ring-0 p-0 placeholder-slate-500"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Název modelu"
            />
            <div className="flex gap-2 mt-2">
              <input
                className="bg-slate-950 text-xs text-slate-300 border border-slate-700 rounded px-2 py-1 w-20 text-center"
                value={data.scale}
                onChange={(e) => setData({ ...data, scale: e.target.value })}
                placeholder="Měřítko"
              />
              <input
                className="bg-slate-950 text-xs text-slate-300 border border-slate-700 rounded px-2 py-1 flex-1"
                value={data.brand}
                onChange={(e) => setData({ ...data, brand: e.target.value })}
                placeholder="Výrobce"
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 min-w-[80px] py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === "info" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-500"}`}
          >
            <FileText size={16} />{" "}
            <span className="hidden sm:inline">Info</span>
          </button>
          <button
            onClick={() => setActiveTab("build")}
            className={`flex-1 min-w-[80px] py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === "build" ? "text-orange-400 border-b-2 border-orange-400" : "text-slate-500"}`}
          >
            <Hammer size={16} />{" "}
            <span className="hidden sm:inline">Stavba</span>
          </button>
          <button
            onClick={() => setActiveTab("parts")}
            className={`flex-1 min-w-[80px] py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === "parts" ? "text-green-400 border-b-2 border-green-400" : "text-slate-500"}`}
          >
            <Layers size={16} />{" "}
            <span className="hidden sm:inline">Doplňky</span>
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`flex-1 min-w-[80px] py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === "files" ? "text-purple-400 border-b-2 border-purple-400" : "text-slate-500"}`}
          >
            <Paperclip size={16} />{" "}
            <span className="hidden sm:inline">Přílohy</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
          {activeTab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={data.status}
                    onChange={(e) =>
                      setData({ ...data, status: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                  >
                    <option value="new">📦 Skladem (Nový)</option>
                    <option value="wip">🚧 Rozestavěno</option>
                    <option value="finished">🏆 Hotovo</option>
                    <option value="wishlist">🛒 Chci koupit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Katalogové číslo
                  </label>
                  <input
                    value={data.catNum}
                    onChange={(e) =>
                      setData({ ...data, catNum: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 flex items-center gap-2">
                  <Folder size={12} /> Projekt
                </label>
                <select
                  value={data.projectId || ""}
                  onChange={(e) =>
                    setData({
                      ...data,
                      projectId: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                >
                  <option value="">-- Žádný projekt --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Poznámky / Idea
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white h-32"
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  placeholder="Např. Plánuji zimní kamufláž, pozor na geometrii kol..."
                />
              </div>
            </div>
          )}

          {activeTab === "build" && (
            <div className="space-y-4">
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Postup</span>
                  <span>{data.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={data.progress}
                  onChange={(e) =>
                    setData({ ...data, progress: Number(e.target.value) })
                  }
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <CheckSquare size={16} /> Stavební plán
                </h4>
                <div className="flex gap-2 mb-2">
                  <input
                    className="flex-1 bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                    placeholder="Přidat úkol (např. Slepit věž)..."
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  />
                  <button
                    onClick={addTodo}
                    className="bg-blue-600 text-white p-2 rounded"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-1">
                  {data.todo &&
                    data.todo.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 bg-slate-800/50 p-2 rounded group"
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTodo(task.id)}
                          className="rounded bg-slate-700 border-slate-600 text-orange-500 focus:ring-0"
                        />
                        <span
                          className={`flex-1 text-sm ${task.done ? "text-slate-500 line-through" : "text-slate-200"}`}
                        >
                          {task.text}
                        </span>
                        <button
                          onClick={() => deleteTodo(task.id)}
                          className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  {(!data.todo || data.todo.length === 0) && (
                    <p className="text-xs text-slate-600 text-center py-4">
                      Žádné úkoly. Naplánuj si stavbu!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "parts" && (
            <div className="space-y-4">
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <h4 className="text-xs font-bold text-slate-400 mb-2">
                  Přidat doplněk
                </h4>
                <input
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white mb-2"
                  placeholder="Název (např. Masky Eduard)"
                  value={newAccessory.name}
                  onChange={(e) =>
                    setNewAccessory({ ...newAccessory, name: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <select
                    className="bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white"
                    value={newAccessory.status}
                    onChange={(e) =>
                      setNewAccessory({
                        ...newAccessory,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="owned">Mám</option>
                    <option value="wanted">Chci koupit</option>
                  </select>
                  <input
                    className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white"
                    placeholder="URL (volitelné)"
                    value={newAccessory.url}
                    onChange={(e) =>
                      setNewAccessory({ ...newAccessory, url: e.target.value })
                    }
                  />
                  <button
                    onClick={addAccessory}
                    className="bg-green-600 text-white px-4 rounded"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {data.accessories &&
                  data.accessories.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {acc.status === "owned" ? (
                          <div className="text-green-400 bg-green-900/20 p-1.5 rounded">
                            <Check size={14} />
                          </div>
                        ) : (
                          <div className="text-purple-400 bg-purple-900/20 p-1.5 rounded">
                            <ShoppingCart size={14} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {acc.name}
                          </p>
                          {acc.url && (
                            <a
                              href={acc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-400 flex items-center gap-1 hover:underline"
                            >
                              <LinkIcon size={10} /> Odkaz do obchodu
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAccessory(acc.id)}
                        className="text-slate-600 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-6">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-300">
                    Scalemates
                  </h4>
                  <img
                    src="https://www.scalemates.com/favicon.ico"
                    alt="SM"
                    className="w-4 h-4 opacity-50"
                  />
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Zadej odkaz na kit ze Scalemates pro rychlý přístup k recenzím
                  a návodům.
                </p>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={openScalematesSearch}
                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs px-3 py-2 rounded border border-blue-500/30 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Search size={14} /> Najít kit
                  </button>
                  <input
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 text-xs text-white"
                    placeholder="Vlož URL ze Scalemates..."
                    value={data.scalematesUrl || ""}
                    onChange={(e) =>
                      setData({ ...data, scalematesUrl: e.target.value })
                    }
                  />
                </div>
                {data.scalematesUrl && (
                  <a
                    href={data.scalematesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs py-2 rounded transition-colors"
                  >
                    Otevřít stránku kitu
                  </a>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <LinkIcon size={16} /> Knihovna odkazů
                </h4>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 mb-3">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      className="col-span-2 bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white"
                      placeholder="Název (např. Návod PDF)"
                      value={newAttachment.name}
                      onChange={(e) =>
                        setNewAttachment({
                          ...newAttachment,
                          name: e.target.value,
                        })
                      }
                    />
                    <select
                      className="bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white"
                      value={newAttachment.type}
                      onChange={(e) =>
                        setNewAttachment({
                          ...newAttachment,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="manual">Návod</option>
                      <option value="ref">Fotky</option>
                      <option value="book">Kniha</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white"
                      placeholder="URL (Google Drive, YouTube, Web...)"
                      value={newAttachment.url}
                      onChange={(e) =>
                        setNewAttachment({
                          ...newAttachment,
                          url: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={addAttachment}
                      className="bg-purple-600 text-white px-4 rounded"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {data.attachments &&
                    data.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700 group"
                      >
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 flex-1 overflow-hidden hover:opacity-80 transition-opacity"
                        >
                          <div
                            className={`p-2 rounded shrink-0 ${att.type === "manual" ? "bg-blue-500/20 text-blue-400" : att.type === "ref" ? "bg-green-500/20 text-green-400" : att.type === "book" ? "bg-orange-500/20 text-orange-400" : "bg-slate-700 text-slate-400"}`}
                          >
                            {att.type === "manual" && <FileText size={16} />}
                            {att.type === "ref" && <ImageIcon size={16} />}
                            {att.type === "book" && <BookOpen size={16} />}
                            {att.type === "video" && <ExternalLink size={16} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {att.name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {att.url}
                            </p>
                          </div>
                        </a>
                        <button
                          onClick={() => deleteAttachment(att.id)}
                          className="text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-800/50 flex justify-between rounded-b-xl">
          <button
            onClick={() => onDelete(data.id)}
            className="text-red-400 hover:bg-red-900/20 px-4 py-2 rounded flex items-center gap-2 transition-colors"
          >
            <Trash2 size={18} /> Smazat
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold shadow-lg flex items-center gap-2"
          >
            <Save size={18} /> Uložit
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 HLAVNÍ APLIKACE
// ==========================================

export default function App() {
  const [view, setView] = useState("kits"); // 'kits' | 'projects'
  const [kits, setKits] = useState(() => {
    const saved = localStorage.getItem("modelDiaryKits");
    return saved ? JSON.parse(saved) : DEMO_KITS;
  });
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("modelDiaryProjects");
    return saved ? JSON.parse(saved) : DEMO_PROJECTS;
  });

  const [searchTerm, setSearchTerm] = useState("");

  // State pro modální okna
  const [activeKit, setActiveKit] = useState(null);
  const [isNewKit, setIsNewKit] = useState(false);

  const [activeProject, setActiveProject] = useState(null);
  const [isNewProject, setIsNewProject] = useState(false);

  // Ukládání do LS
  useEffect(() => {
    localStorage.setItem("modelDiaryKits", JSON.stringify(kits));
  }, [kits]);
  useEffect(() => {
    localStorage.setItem("modelDiaryProjects", JSON.stringify(projects));
  }, [projects]);

  // --- HELPER PRO ZÍSKÁNÍ NÁZVU PROJEKTU ---
  const getProjectName = (projectId) => {
    const proj = projects.find((p) => p.id === projectId);
    return proj ? proj.name : null;
  };

  // --- CRUD KITS ---
  const handleSaveKit = (kitData) => {
    // Pokud je kit přiřazen k aktivnímu projektu, vyčistíme "legacy" historii
    const updatedKitData = { ...kitData };
    if (updatedKitData.projectId) {
      updatedKitData.legacyProject = null;
    }

    if (isNewKit) {
      setKits([...kits, { ...updatedKitData, id: Date.now() }]);
    } else {
      setKits(
        kits.map((k) => (k.id === updatedKitData.id ? updatedKitData : k)),
      );
    }
    setActiveKit(null);
  };

  const handleDeleteKit = (id) => {
    if (confirm("Opravdu odstranit tento model?")) {
      setKits(kits.filter((k) => k.id !== id));
      setActiveKit(null);
    }
  };

  const createNewKit = () => {
    setIsNewKit(true);
    setActiveKit({
      status: "new",
      brand: "",
      catNum: "",
      scale: "",
      name: "",
      projectId: null,
      progress: 0,
      todo: [],
      accessories: [],
      scalematesUrl: "",
      attachments: [],
      notes: "",
      legacyProject: null,
    });
  };

  // Helper pro Projekty (aby mohly manipulovat s Kity)
  const handleUpdateKitLink = (kitId, projectId) => {
    setKits(
      kits.map((k) => {
        if (k.id === kitId) {
          // Pokud přiřazujeme do projektu, mažeme legacy. Pokud odebíráme (null), legacy nenastavujeme (to dělá jen smazání projektu)
          return {
            ...k,
            projectId: projectId,
            legacyProject: projectId ? null : k.legacyProject,
          };
        }
        return k;
      }),
    );
  };

  const handleCreateWishlistKit = (newKitData) => {
    const newKit = {
      ...newKitData,
      id: Date.now(),
      status: "wishlist",
      catNum: "",
      progress: 0,
      todo: [],
      accessories: [],
      scalematesUrl: "",
      attachments: [],
      notes: "",
      legacyProject: null,
    };
    setKits([...kits, newKit]);
  };

  // --- CRUD PROJECTS ---
  const handleSaveProject = (projData) => {
    if (isNewProject) {
      setProjects([...projects, { ...projData, id: Date.now() }]);
    } else {
      setProjects(projects.map((p) => (p.id === projData.id ? projData : p)));
    }
    setActiveProject(null);
  };

  const handleDeleteProject = (id) => {
    const projectToDelete = projects.find((p) => p.id === id);
    const projName = projectToDelete ? projectToDelete.name : "Neznámý projekt";

    if (
      confirm(
        `Smazat projekt "${projName}"? Modely zůstanou a uloží se informace o historii.`,
      )
    ) {
      setProjects(projects.filter((p) => p.id !== id));

      // Aktualizace kitů: zrušíme vazbu ID, ale uložíme jméno do legacyProject
      setKits(
        kits.map((k) =>
          k.projectId === id
            ? {
                ...k,
                projectId: null,
                legacyProject: projName,
              }
            : k,
        ),
      );

      setActiveProject(null);
    }
  };

  const createNewProject = () => {
    setIsNewProject(true);
    setActiveProject({
      name: "",
      description: "",
      status: "active",
      accessories: [],
    });
  };

  // Filtry
  const filteredKits = useMemo(() => {
    return kits.filter(
      (k) =>
        k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.brand.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [kits, searchTerm]);

  const groupedKits = useMemo(() => {
    return {
      wip: filteredKits.filter((k) => k.status === "wip"),
      new: filteredKits.filter((k) => k.status === "new"),
      wishlist: filteredKits.filter((k) => k.status === "wishlist"),
      finished: filteredKits.filter((k) => k.status === "finished"),
    };
  }, [filteredKits]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20">
      {/* HLAVIČKA */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            {/* ZMĚNA: Modrý nadpis a ikona favicon.png */}
            <div className="flex items-center gap-3">
              <img
                src="favicon.png"
                alt="Logo"
                className="w-10 h-10 rounded-xl shadow-lg border border-slate-600 object-cover"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Modelářský Deník
              </h1>
            </div>

            <button
              onClick={view === "kits" ? createNewKit : createNewProject}
              className="bg-blue-600 p-2 rounded-full shadow text-white hover:bg-blue-500 active:scale-95 transition-transform"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-lg mb-3">
            <button
              onClick={() => setView("kits")}
              className={`flex-1 py-2 text-sm font-bold rounded flex items-center justify-center gap-2 transition-colors ${view === "kits" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Box size={16} /> Sklad
            </button>
            <button
              onClick={() => setView("projects")}
              className={`flex-1 py-2 text-sm font-bold rounded flex items-center justify-center gap-2 transition-colors ${view === "projects" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Folder size={16} /> Projekty
            </button>
          </div>

          {view === "kits" && (
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Hledat model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* OBSAH - SKLAD */}
      {view === "kits" && (
        <div className="max-w-md mx-auto px-4 py-4 space-y-6">
          {groupedKits.wip.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Hammer size={12} /> Na stole ({groupedKits.wip.length})
              </h2>
              {groupedKits.wip.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  onClick={() => {
                    setIsNewKit(false);
                    setActiveKit(kit);
                  }}
                  projectName={getProjectName(kit.projectId)}
                />
              ))}
            </section>
          )}
          {groupedKits.new.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Box size={12} /> V kitníku ({groupedKits.new.length})
              </h2>
              {groupedKits.new.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  onClick={() => {
                    setIsNewKit(false);
                    setActiveKit(kit);
                  }}
                  projectName={getProjectName(kit.projectId)}
                />
              ))}
            </section>
          )}
          {groupedKits.wishlist.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ShoppingCart size={12} /> Nákupní seznam (
                {groupedKits.wishlist.length})
              </h2>
              {groupedKits.wishlist.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  onClick={() => {
                    setIsNewKit(false);
                    setActiveKit(kit);
                  }}
                  projectName={getProjectName(kit.projectId)}
                />
              ))}
            </section>
          )}
          {groupedKits.finished.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckSquare size={12} /> Hotovo ({groupedKits.finished.length})
              </h2>
              {groupedKits.finished.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  onClick={() => {
                    setIsNewKit(false);
                    setActiveKit(kit);
                  }}
                  projectName={getProjectName(kit.projectId)}
                />
              ))}
            </section>
          )}
          {filteredKits.length === 0 && (
            <div className="text-center text-slate-500 py-10">
              <Package size={48} className="mx-auto mb-2 opacity-20" />
              <p>Zatím tu nic není.</p>
            </div>
          )}
        </div>
      )}

      {/* OBSAH - PROJEKTY */}
      {view === "projects" && (
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          {projects.map((project) => {
            const projectKits = kits.filter((k) => k.projectId === project.id);
            return (
              <div
                key={project.id}
                onClick={() => {
                  setIsNewProject(false);
                  setActiveProject(project);
                }}
                className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-slate-500 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                      project.status === "active"
                        ? "bg-orange-500/20 text-orange-400"
                        : project.status === "finished"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {project.status === "active"
                      ? "Aktivní"
                      : project.status === "finished"
                        ? "Dokončeno"
                        : "Plánováno"}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  {project.description || "Bez popisu"}
                </p>

                <div className="bg-slate-900/50 rounded-lg p-3 space-y-2 mb-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Box size={12} /> Obsahuje stavebnice:
                  </h4>
                  {projectKits.length > 0 ? (
                    projectKits.map((pk) => (
                      <div
                        key={pk.id}
                        className="flex justify-between items-center text-sm p-2 bg-slate-800 rounded border border-slate-700"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {pk.status === "wishlist" && (
                            <ShoppingCart
                              size={14}
                              className="text-purple-400 shrink-0"
                            />
                          )}
                          <span className="truncate">{pk.name}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-600 italic">
                      Zatím žádné modely.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT/ADD MODAL - KITS */}
      {activeKit && (
        <KitDetailModal
          kit={activeKit}
          projects={projects}
          onClose={() => setActiveKit(null)}
          onSave={handleSaveKit}
          onDelete={handleDeleteKit}
        />
      )}

      {/* EDIT/ADD MODAL - PROJECTS */}
      {activeProject && (
        <ProjectDetailModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
          allKits={kits}
          onUpdateKitLink={handleUpdateKitLink}
          onCreateWishlistKit={handleCreateWishlistKit}
        />
      )}
    </div>
  );
}
