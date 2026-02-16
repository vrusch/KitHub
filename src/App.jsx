import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Package,
  Folder,
  Plus,
  CheckSquare,
  Hammer,
  ShoppingCart,
  Box,
  Layers,
  Cloud,
  Loader2,
  CloudCog,
  Search,
  Filter,
  XCircle,
  ShoppingBag,
  Paintbrush,
  Trash2,
} from "lucide-react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
  getDocs,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import {
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import brandsData from "./data/brands.json";
import masterCatalog from "./data/catalog.json";
import { auth, db } from "./config/firebase";
import { Normalizer } from "./utils/normalizers";
import { GoogleIcon, CzechFlag, AppLogo } from "./components/ui/Icons";
import { safeRender } from "./utils/helpers";
import {
  FilterChip,
} from "./components/ui/FormElements";
import ConfirmModal from "./components/ui/ConfirmModal";
import KitCard from "./components/cards/KitCard";
import PaintCard from "./components/cards/PaintCard";
import ProjectCard from "./components/cards/ProjectCard";
import ShoppingAccessoryCard from "./components/cards/ShoppingAccessoryCard";
import SettingsModal from "./components/modals/SettingsModal";
import ProjectDetailModal from "./components/modals/ProjectDetailModal";
import KitDetailModal from "./components/modals/KitDetailModal";
import PaintDetailModal from "./components/modals/PaintDetailModal";

// ==========================================
// 🔧 KONFIGURACE A KONSTANTY
// ==========================================

const APP_VERSION = "v2.29.8-refactoring-phase 4, step 3";

const BRANDS = brandsData;
const MASTER_CATALOG = masterCatalog;

// ==========================================
// 🧩 SUB-KOMPONENTY (UI Elements)
// ==========================================

// ==========================================
// 🚀 HLAVNÍ APLIKACE (App)
// ==========================================

export default function App() {
  const [view, setView] = useState("kits");
  const [kits, setKits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [paints, setPaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDestructive: false,
  });
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    scales: [],
    brands: [],
    kitStatuses: [],
    projectStatuses: [],
    paintBrands: [],
    paintTypes: [],
  });
  const [manualDataUid, setManualDataUid] = useState(null);
  const [activeKit, setActiveKit] = useState(null);
  const [isNewKit, setIsNewKit] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [activePaint, setActivePaint] = useState(null);
  const [isNewPaint, setIsNewPaint] = useState(false);
  const activeUid = manualDataUid || user?.uid;

  // NOVÉ: Stav pro detekci online/offline
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setKits([]);
        setProjects([]);
        setPaints([]);
      }
      if (currentUser) setLoading(false);
    });
    const initAuth = async () => {
      try {
        await auth.authStateReady();
        if (!auth.currentUser) {
          if (
            typeof __initial_auth_token !== "undefined" &&
            __initial_auth_token
          )
            await signInWithCustomToken(auth, __initial_auth_token);
          else await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth Error:", e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user || !db || !activeUid) return;
    setLoading(true);
    const handleError = (err) => {
      setLoading(false);
      if (err.code !== "permission-denied")
        console.error("Snapshot error:", err);
    };
    const unsubKits = onSnapshot(
      collection(db, "artifacts", "model-diary", "users", activeUid, "kits"),
      (snap) => setKits(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      handleError,
    );
    const unsubProjs = onSnapshot(
      collection(
        db,
        "artifacts",
        "model-diary",
        "users",
        activeUid,
        "projects",
      ),
      (snap) => setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      handleError,
    );
    const unsubPaints = onSnapshot(
      collection(db, "artifacts", "model-diary", "users", activeUid, "paints"),
      (snap) => {
        setPaints(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      handleError,
    );
    return () => {
      unsubKits();
      unsubProjs();
      unsubPaints();
    };
  }, [user, activeUid]);

  const requestConfirm = (title, message, onConfirm, isDestructive = false) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      isDestructive,
    });
  };
  const handleOpenKitPaints = (kit) => {
    setIsNewKit(false);
    setActiveKit({ ...kit, initialTab: "paints" });
  };
  const handleOpenKitDetail = (kit, tab = "info") => {
    setIsNewKit(false);
    setActiveKit({ ...kit, initialTab: tab });
  };
  const handleOpenProjectDetail = (projId) => {
    const proj = projects.find((p) => p.id === projId);
    if (proj) {
      setIsNewProject(false);
      setActiveProject(proj);
    }
  };

  const handleSaveItem = async (
    collectionName,
    itemData,
    isNew,
    setList,
    list,
  ) => {
    const dataToSave = { ...itemData };
    if (dataToSave.initialTab) delete dataToSave.initialTab;
    if (collectionName === "kits" && dataToSave.projectId)
      dataToSave.legacyProject = null;
    let customId = null;
    if (collectionName === "paints") {
      customId = Normalizer.generateId(dataToSave.brand, dataToSave.code);
      if (customId) dataToSave.id = customId;
    }
    if (!db || !user) {
      const finalId = customId || dataToSave.id || Date.now().toString();
      if (isNew) {
        if (collectionName === "paints" && list.some((i) => i.id === finalId))
          setList(
            list.map((i) =>
              i.id === finalId ? { ...dataToSave, id: finalId } : i,
            ),
          );
        else setList([...list, { ...dataToSave, id: finalId }]);
      } else
        setList(list.map((i) => (i.id === dataToSave.id ? dataToSave : i)));
      return finalId;
    } else if (user && activeUid) {
      const colRef = collection(
        db,
        "artifacts",
        "model-diary",
        "users",
        activeUid,
        collectionName,
      );
      if (collectionName === "paints" && customId) {
        await setDoc(
          doc(colRef, customId),
          { ...dataToSave, createdAt: serverTimestamp() },
          { merge: true },
        );
        return customId;
      } else {
        if (isNew) {
          const { id, ...cleanData } = dataToSave;
          const ref = await addDoc(colRef, {
            ...cleanData,
            createdAt: serverTimestamp(),
          });
          return ref.id;
        } else {
          const { id, ...cleanData } = dataToSave;
          await updateDoc(doc(colRef, dataToSave.id), cleanData);
          return dataToSave.id;
        }
      }
    }
  };

  const handleQuickCreatePaint = (newPaintData) => {
    const id =
      Normalizer.generateId(newPaintData.brand, newPaintData.code) ||
      Date.now().toString();
    handleSaveItem("paints", { ...newPaintData, id }, true, setPaints, paints);
    return id;
  };
  const deleteItem = async (collectionName, id, list, setList) => {
    requestConfirm(
      "Opravdu smazat?",
      "Tato akce je nevratná. Položka bude trvale odstraněna.",
      async () => {
        if (!db || !user) setList(list.filter((i) => i.id !== id));
        else if (user && activeUid)
          await deleteDoc(
            doc(
              db,
              "artifacts",
              "model-diary",
              "users",
              activeUid,
              collectionName,
              id,
            ),
          );
        if (collectionName === "kits") setActiveKit(null);
        else if (collectionName === "projects") setActiveProject(null);
        else setActivePaint(null);
      },
      true,
    );
  };

  const handleImportRequest = (file) => {
    requestConfirm(
      "Import dat",
      "Pozor! Import přepíše všechna data se stejným ID. Opravdu chcete pokračovat?",
      async () => {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          if (!data.kits && !data.projects && !data.paints)
            throw new Error("Neplatná struktura dat.");
          const batch = db ? writeBatch(db) : null;
          let count = 0;
          if (!user || !db) {
            alert("Pro import dat musíte být online a přihlášeni.");
            return;
          }
          data.kits?.forEach((kit) => {
            if (kit.id) {
              batch.set(
                doc(
                  db,
                  "artifacts",
                  "model-diary",
                  "users",
                  user.uid,
                  "kits",
                  kit.id.toString(),
                ),
                kit,
              );
              count++;
            }
          });
          data.projects?.forEach((proj) => {
            if (proj.id) {
              batch.set(
                doc(
                  db,
                  "artifacts",
                  "model-diary",
                  "users",
                  user.uid,
                  "projects",
                  proj.id.toString(),
                ),
                proj,
              );
              count++;
            }
          });
          data.paints?.forEach((paint) => {
            const id =
              paint.id ||
              Normalizer.generateId(paint.brand, paint.code) ||
              Date.now().toString();
            batch.set(
              doc(
                db,
                "artifacts",
                "model-diary",
                "users",
                user.uid,
                "paints",
                id,
              ),
              { ...paint, id },
            );
            count++;
          });
          if (count > 0) {
            await batch.commit();
            alert(`Obnoveno ${count} položek.`);
            setShowSettings(false);
          } else alert("Žádná data k importu.");
        } catch (err) {
          alert("Chyba importu: " + err.message);
        }
      },
      true,
    );
  };

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

    // ZMĚNA: Mixy se nikdy neobjeví v nákupním seznamu (protože !p.isMix)
    const wishlistPaints = paints.filter(
      (p) => !p.isMix && (p.status === "wanted" || p.status === "low"),
    );

    return {
      kits: wishlistKits,
      accessories: [...kitAccessories, ...projectAccessories],
      paints: wishlistPaints,
    };
  }, [kits, projects, paints]);

  const handleMarkAsBought = (item, type) => {
    requestConfirm(
      "Označit jako koupené?",
      `Položka "${item.name || item.brand}" se přesune do skladu.`,
      async () => {
        if (type === "kit")
          await handleSaveItem(
            "kits",
            { ...item, status: "new" },
            false,
            setKits,
            kits,
          );
        else if (type === "paint")
          await handleSaveItem(
            "paints",
            { ...item, status: "in_stock" },
            false,
            setPaints,
            paints,
          );
      },
    );
  };
  const handleBuyAccessory = (acc) => {
    requestConfirm(
      "Koupeno?",
      `Označit doplněk "${acc.name}" jako koupený?`,
      async () => {
        const collectionName = acc.parentType === "kit" ? "kits" : "projects";
        const parentItem = (acc.parentType === "kit" ? kits : projects).find(
          (i) => i.id === acc.parentId,
        );
        if (parentItem) {
          const updatedAccessories = parentItem.accessories.map((a) =>
            a.id === acc.id ? { ...a, status: "owned" } : a,
          );
          await handleSaveItem(
            collectionName,
            { ...parentItem, accessories: updatedAccessories },
            false,
            acc.parentType === "kit" ? setKits : setProjects,
            acc.parentType === "kit" ? kits : projects,
          );
        }
      },
    );
  };

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

  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
        <p>Načítám...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20 overflow-y-scroll">
      {/* HEADER */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              {/* Použití nové SVG komponenty */}
              <AppLogo className="h-8 md:h-10" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="bg-slate-700/50 hover:bg-slate-700 text-blue-300 p-2 rounded-full border border-blue-500/20"
              >
                <CloudCog size={20} />
              </button>
              <button
                onClick={() => {
                  if (view === "kits") {
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
                    });
                  } else if (view === "projects") {
                    setIsNewProject(true);
                    setActiveProject({ status: "active", accessories: [] });
                  } else if (view === "paints") {
                    setIsNewPaint(true);
                    setActivePaint({
                      status: "in_stock",
                      brand: "",
                      code: "",
                      name: "",
                      type: "Akryl",
                      finish: "Matná",
                      hex: "#999999",
                      notes: "",
                      thinner: "",
                      ratioPaint: 60,
                      ratioThinner: 40,
                      isMix: false,
                      mixParts: [],
                    });
                  } else {
                    alert(
                      "Pro přidání položky přepněte na Sklad, Barvy nebo Projekty.",
                    );
                  }
                }}
                className="p-2 rounded-full shadow text-white hover:brightness-110 bg-blue-600"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-lg mb-3 gap-1 overflow-x-auto">
            <button
              onClick={() => setView("kits")}
              className={`flex-1 py-2 px-2 text-sm font-bold rounded flex gap-2 justify-center items-center whitespace-nowrap ${view === "kits" ? "bg-slate-700 text-white" : "text-slate-500"}`}
            >
              <Box size={16} /> Modely
            </button>
            <button
              onClick={() => setView("projects")}
              className={`flex-1 py-2 px-2 text-sm font-bold rounded flex gap-2 justify-center items-center whitespace-nowrap ${view === "projects" ? "bg-slate-700 text-white" : "text-slate-500"}`}
            >
              <Folder size={16} /> Projekty
            </button>
            <button
              onClick={() => setView("paints")}
              className={`flex-1 py-2 px-2 text-sm font-bold rounded flex gap-2 justify-center items-center whitespace-nowrap ${view === "paints" ? "bg-slate-700 text-blue-400" : "text-slate-500"}`}
            >
              <Paintbrush size={16} /> Barvy
            </button>
            <button
              onClick={() => setView("shopping")}
              className={`flex-1 py-2 px-2 text-sm font-bold rounded flex gap-2 justify-center items-center whitespace-nowrap ${view === "shopping" ? "bg-slate-700 text-orange-400" : "text-slate-500"}`}
            >
              <ShoppingCart size={16} /> Nákup
            </button>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
                placeholder={
                  view === "kits"
                    ? "Hledat model..."
                    : view === "paints"
                      ? "Hledat barvu..."
                      : "Hledat..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => view !== "shopping" && setShowFilter(!showFilter)}
              className={`p-2 w-10 h-10 rounded-lg border flex items-center justify-center transition-opacity shrink-0 ${view === "shopping" ? "opacity-0 pointer-events-none border-transparent bg-transparent" : showFilter || hasActiveFilters ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400"}`}
            >
              <Filter size={20} />
            </button>
          </div>
          {/* FILTER PANEL */}
          {showFilter && view !== "shopping" && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 mb-3 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase">
                  Filtrování
                </h4>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[10px] text-red-400 flex items-center gap-1 hover:underline"
                  >
                    <XCircle size={12} /> Zrušit vše
                  </button>
                )}
              </div>
              {view === "kits" ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block mb-1">
                      Stav modelu
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {["new", "wip", "finished", "wishlist", "scrap"].map(
                        (s) => (
                          <FilterChip
                            key={s}
                            label={s}
                            active={activeFilters.kitStatuses.includes(s)}
                            onClick={() => toggleFilter("kitStatuses", s)}
                          />
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block mb-1">
                      Měřítko
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableScales.map((s) => (
                        <FilterChip
                          key={s}
                          label={s}
                          active={activeFilters.scales.includes(s)}
                          onClick={() => toggleFilter("scales", s)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block mb-1">
                      Výrobce
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableBrands.map((b) => (
                        <FilterChip
                          key={b}
                          label={b}
                          active={activeFilters.brands.includes(b)}
                          onClick={() => toggleFilter("brands", b)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : view === "paints" ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block mb-1">
                      Výrobce barvy
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availablePaintBrands.map((b) => (
                        <FilterChip
                          key={b}
                          label={b}
                          active={activeFilters.paintBrands.includes(b)}
                          onClick={() => toggleFilter("paintBrands", b)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block mb-1">
                      Typ barvy
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availablePaintTypes.map((t) => (
                        <FilterChip
                          key={t}
                          label={t}
                          active={activeFilters.paintTypes.includes(t)}
                          onClick={() => toggleFilter("paintTypes", t)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block mb-1">
                    Stav projektu
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["planned", "active", "finished", "hold"].map((s) => (
                      <FilterChip
                        key={s}
                        label={s}
                        active={activeFilters.projectStatuses.includes(s)}
                        onClick={() => toggleFilter("projectStatuses", s)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-between px-1 text-[10px] text-slate-500">
            <div className="flex gap-1">
              <Cloud size={10} /> ID:{" "}
              <span className="font-mono text-blue-400">
                {activeUid?.substring(0, 8) || "..."}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={isOnline ? "text-green-500" : "text-orange-500"}>
                {isOnline ? "Online" : "Offline"}
              </div>
              <CzechFlag className="w-4 h-3 rounded shadow-sm opacity-75 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-6">
        {view === "kits" && (
          <>
            {Object.entries(groupedKits).map(
              ([key, list]) =>
                list.length > 0 && (
                  <section key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <h2
                        className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${key === "wip" ? "text-orange-400" : key === "new" ? "text-blue-400" : key === "finished" ? "text-green-600" : key === "scrap" ? "text-slate-600" : "text-purple-400"}`}
                      >
                        {key === "wip" ? (
                          <Hammer size={12} />
                        ) : key === "new" ? (
                          <Box size={12} />
                        ) : key === "finished" ? (
                          <CheckSquare size={12} />
                        ) : key === "scrap" ? (
                          <Trash2 size={12} />
                        ) : (
                          <ShoppingCart size={12} />
                        )}{" "}
                        {key === "wip"
                          ? "Na stole"
                          : key === "new"
                            ? "V kitníku"
                            : key === "finished"
                              ? "Hotovo"
                              : key === "scrap"
                                ? "Vrakoviště"
                                : "Nákupní seznam"}{" "}
                        ({list.length})
                      </h2>
                    </div>
                    {list.map((k) => (
                      <KitCard
                        key={k.id}
                        kit={k}
                        onClick={() => {
                          setIsNewKit(false);
                          setActiveKit(k);
                        }}
                        projectName={
                          projects.find((p) => p.id === k.projectId)?.name
                        }
                        allPaints={paints}
                        onOpenDetail={handleOpenKitDetail}
                        onOpenProject={handleOpenProjectDetail}
                      />
                    ))}
                  </section>
                ),
            )}
            {filteredKits.length === 0 && (
              <div className="text-center text-slate-500 py-10">
                <Package size={48} className="mx-auto mb-2 opacity-20" />
                <p>Prázdno (nebo skryto filtrem).</p>
              </div>
            )}
          </>
        )}

        {view === "projects" && (
          <>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onClick={() => {
                    setIsNewProject(false);
                    setActiveProject(p);
                  }}
                  kits={kits}
                />
              ))
            ) : (
              <div className="text-center text-slate-500 py-10">
                <Folder size={48} className="mx-auto mb-2 opacity-20" />
                <p>Prázdno (nebo skryto filtrem).</p>
              </div>
            )}
          </>
        )}

        {view === "paints" && (
          <div className="space-y-6">
            {groupedPaints.inventory.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <Package size={12} /> Mám ve skladu (
                    {groupedPaints.inventory.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {groupedPaints.inventory.map((paint) => (
                    <PaintCard
                      key={paint.id}
                      paint={paint}
                      onClick={() => {
                        setIsNewPaint(false);
                        setActivePaint(paint);
                      }}
                      onDelete={(id) =>
                        deleteItem("paints", id, paints, setPaints)
                      }
                    />
                  ))}
                </div>
              </section>
            )}
            {groupedPaints.wishlist.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingCart size={12} /> Nákupní seznam (
                    {groupedPaints.wishlist.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {groupedPaints.wishlist.map((paint) => (
                    <PaintCard
                      key={paint.id}
                      paint={paint}
                      onClick={() => {
                        setIsNewPaint(false);
                        setActivePaint(paint);
                      }}
                      onDelete={(id) =>
                        deleteItem("paints", id, paints, setPaints)
                      }
                    />
                  ))}
                </div>
              </section>
            )}
            {filteredPaints.length === 0 && (
              <div className="text-center text-slate-500 py-10">
                <Palette size={48} className="mx-auto mb-2 opacity-20" />
                <p>Žádné barvy (nebo skryto filtrem).</p>
              </div>
            )}
          </div>
        )}

        {view === "shopping" && (
          <div className="space-y-6">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                <ShoppingCart size={24} className="text-orange-400" /> Nákupní
                seznam
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Interaktivní seznam. Kliknutím na tašku{" "}
                <ShoppingBag size={12} className="inline" /> přesunete položku
                do skladu (koupeno).
              </p>
            </div>
            {shoppingList.kits.length === 0 &&
              shoppingList.accessories.length === 0 &&
              shoppingList.paints.length === 0 && (
                <div className="text-center text-slate-500 py-10">
                  <ShoppingBag size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Váš nákupní seznam je prázdný.</p>
                </div>
              )}
            {shoppingList.kits.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Box size={14} /> Chybějící Modely
                </h3>
                {shoppingList.kits.map((k) => (
                  <KitCard
                    key={k.id}
                    kit={k}
                    onClick={() => {
                      setIsNewKit(false);
                      setActiveKit(k);
                    }}
                    projectName={
                      projects.find((p) => p.id === k.projectId)?.name
                    }
                    onBuy={(item) => handleMarkAsBought(item, "kit")}
                    allPaints={paints}
                    onOpenDetail={handleOpenKitDetail}
                  />
                ))}
              </div>
            )}
            {shoppingList.paints.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Paintbrush size={14} /> Barvy a Chemie
                </h3>
                <div className="space-y-1">
                  {shoppingList.paints.map((p) => (
                    <PaintCard
                      key={p.id}
                      paint={p}
                      onClick={() => {
                        setIsNewPaint(false);
                        setActivePaint(p);
                      }}
                      onBuy={(item) => handleMarkAsBought(item, "paint")}
                    />
                  ))}
                </div>
              </div>
            )}
            {shoppingList.accessories.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layers size={14} /> Chybějící Doplňky
                </h3>
                <div className="space-y-2">
                  {shoppingList.accessories.map((acc, index) => (
                    <ShoppingAccessoryCard
                      key={`${acc.id}-${index}`}
                      accessory={acc}
                      onBuy={handleBuyAccessory}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        isDestructive={confirmModal.isDestructive}
      />

      {/* MODALS */}
      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          kits={kits}
          projects={projects}
          paints={paints}
          onImport={handleImportRequest}
          activeUid={activeUid}
          onSetManualId={setManualDataUid}
          appVersion={APP_VERSION}
          masterCatalog={MASTER_CATALOG}
        />
      )}
      {activeProject && (
        <ProjectDetailModal
          project={activeProject}
          allKits={kits}
          onClose={() => setActiveProject(null)}
          onSave={(d) =>
            handleSaveItem("projects", d, isNewProject, setProjects, projects)
          }
          onUpdateKitLink={(kid, pid) =>
            handleSaveItem(
              "kits",
              {
                ...kits.find((k) => k.id === kid),
                projectId: pid,
                legacyProject: null,
              },
              false,
              setKits,
              kits,
            )
          }
          onCreateWishlistKit={(d) =>
            handleSaveItem("kits", d, true, setKits, kits)
          }
          onAddWishlistKit={() => {
            setIsNewKit(true);
            setActiveKit({
              status: "wishlist",
              projectId: activeProject.id,
              brand: "",
              scale: "",
              name: "",
              accessories: [],
              todo: [],
            });
          }}
        />
      )}
      {activeKit && (
        <KitDetailModal
          kit={activeKit}
          projects={projects}
          allPaints={paints}
          onQuickCreatePaint={handleQuickCreatePaint}
          onClose={() => setActiveKit(null)}
          onSave={(d) => handleSaveItem("kits", d, isNewKit, setKits, kits)}
          onDelete={(id) => deleteItem("kits", id, kits, setKits)}
          initialTab={activeKit.initialTab}
        />
      )}
      {activePaint && (
        <PaintDetailModal
          paint={activePaint}
          existingPaints={paints}
          allKits={kits}
          onClose={() => setActivePaint(null)}
          onSave={(d) =>
            handleSaveItem("paints", d, isNewPaint, setPaints, paints)
          }
          onDelete={(id) => deleteItem("paints", id, paints, setPaints)}
        />
      )}
    </div>
  );
}
