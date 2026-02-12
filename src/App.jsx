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
  Search,
  X,
  Save,
  Trash2,
  ExternalLink,
  Paperclip,
  CheckSquare,
  Hammer,
  ShoppingCart,
  Box,
  FileText,
  Layers,
  Link as LinkIcon,
  Check,
  Image as ImageIcon,
  BookOpen,
  Download,
  Link2,
  Unlink,
  History,
  Cloud,
  Loader2,
  AlertTriangle,
  Copy,
  Lock,
  CloudCog,
  Skull,
  Trophy,
  Upload,
  FileJson,
  Database,
  RefreshCw,
  LogIn,
  LogOut,
  User,
  Ghost,
  WifiOff,
  Key,
  Filter,
  XCircle,
  ClipboardCopy,
  ShoppingBag,
  ArrowRight,
  Paintbrush,
  Palette,
  Droplets,
  AlertCircle,
  Wand2,
  Info,
  CheckCircle2,
  Ban,
} from "lucide-react";

// Firebase importy
import { initializeApp } from "firebase/app";
import {
  getFirestore,
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
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// ==========================================
// 🔧 KONFIGURACE A KONSTANTY
// ==========================================

const APP_VERSION = "v2.18.1-fixes";

// --- MASTER CATALOG (Zadrátovaná data) ---
const MASTER_CATALOG = {
  // --- TAMIYA XF (Flat - Akryl) ---
  TAMIYA_XF1: {
    displayCode: "XF-1",
    name: "Flat Black",
    type: "Akryl",
    finish: "Matná",
    hex: "#1a1a1a",
  },
  TAMIYA_XF2: {
    displayCode: "XF-2",
    name: "Flat White",
    type: "Akryl",
    finish: "Matná",
    hex: "#f2f2f2",
  },
  TAMIYA_XF3: {
    displayCode: "XF-3",
    name: "Flat Yellow",
    type: "Akryl",
    finish: "Matná",
    hex: "#f7d117",
  },
  TAMIYA_XF4: {
    displayCode: "XF-4",
    name: "Yellow Green",
    type: "Akryl",
    finish: "Matná",
    hex: "#8a9a5b",
  },
  TAMIYA_XF5: {
    displayCode: "XF-5",
    name: "Flat Green",
    type: "Akryl",
    finish: "Matná",
    hex: "#355e3b",
  },
  TAMIYA_XF6: {
    displayCode: "XF-6",
    name: "Copper",
    type: "Akryl",
    finish: "Kovová",
    hex: "#b87333",
  },
  TAMIYA_XF7: {
    displayCode: "XF-7",
    name: "Flat Red",
    type: "Akryl",
    finish: "Matná",
    hex: "#a52a2a",
  },
  TAMIYA_XF8: {
    displayCode: "XF-8",
    name: "Flat Blue",
    type: "Akryl",
    finish: "Matná",
    hex: "#00008b",
  },
  TAMIYA_XF9: {
    displayCode: "XF-9",
    name: "Hull Red",
    type: "Akryl",
    finish: "Matná",
    hex: "#3d0c02",
  },
  TAMIYA_XF10: {
    displayCode: "XF-10",
    name: "Flat Brown",
    type: "Akryl",
    finish: "Matná",
    hex: "#4b3621",
  },
  TAMIYA_XF11: {
    displayCode: "XF-11",
    name: "J.N. Green",
    type: "Akryl",
    finish: "Matná",
    hex: "#2f4f2f",
  },
  TAMIYA_XF12: {
    displayCode: "XF-12",
    name: "J.N. Grey",
    type: "Akryl",
    finish: "Matná",
    hex: "#8ca3b3",
  },
  TAMIYA_XF16: {
    displayCode: "XF-16",
    name: "Flat Aluminum",
    type: "Akryl",
    finish: "Kovová",
    hex: "#a9a9a9",
  },
  TAMIYA_XF19: {
    displayCode: "XF-19",
    name: "Sky Grey",
    type: "Akryl",
    finish: "Matná",
    hex: "#cfcfc4",
  },
  TAMIYA_XF24: {
    displayCode: "XF-24",
    name: "Dark Grey",
    type: "Akryl",
    finish: "Matná",
    hex: "#404040",
  },
  TAMIYA_XF49: {
    displayCode: "XF-49",
    name: "Khaki",
    type: "Akryl",
    finish: "Matná",
    hex: "#8f7e64",
  },
  TAMIYA_XF52: {
    displayCode: "XF-52",
    name: "Flat Earth",
    type: "Akryl",
    finish: "Matná",
    hex: "#7f6f59",
  },
  TAMIYA_XF53: {
    displayCode: "XF-53",
    name: "Neutral Grey",
    type: "Akryl",
    finish: "Matná",
    hex: "#808080",
  },
  TAMIYA_XF56: {
    displayCode: "XF-56",
    name: "Metallic Grey",
    type: "Akryl",
    finish: "Kovová",
    hex: "#535b5e",
  },
  TAMIYA_XF57: {
    displayCode: "XF-57",
    name: "Buff",
    type: "Akryl",
    finish: "Matná",
    hex: "#f0dc82",
  },
  TAMIYA_XF59: {
    displayCode: "XF-59",
    name: "Desert Yellow",
    type: "Akryl",
    finish: "Matná",
    hex: "#edc9af",
  },
  TAMIYA_XF60: {
    displayCode: "XF-60",
    name: "Dark Yellow",
    type: "Akryl",
    finish: "Matná",
    hex: "#c2b280",
  },
  TAMIYA_XF61: {
    displayCode: "XF-61",
    name: "Dark Green",
    type: "Akryl",
    finish: "Matná",
    hex: "#013220",
  },
  TAMIYA_XF62: {
    displayCode: "XF-62",
    name: "Olive Drab",
    type: "Akryl",
    finish: "Matná",
    hex: "#6b8e23",
  },
  TAMIYA_XF63: {
    displayCode: "XF-63",
    name: "German Grey",
    type: "Akryl",
    finish: "Matná",
    hex: "#4c4c4c",
  },
  TAMIYA_XF64: {
    displayCode: "XF-64",
    name: "Red Brown",
    type: "Akryl",
    finish: "Matná",
    hex: "#8b0000",
  },
  TAMIYA_XF69: {
    displayCode: "XF-69",
    name: "NATO Black",
    type: "Akryl",
    finish: "Matná",
    hex: "#111111",
  },
  TAMIYA_XF85: {
    displayCode: "XF-85",
    name: "Rubber Black",
    type: "Akryl",
    finish: "Matná",
    hex: "#2b2b2b",
  },
  TAMIYA_XF86: {
    displayCode: "XF-86",
    name: "Flat Clear",
    type: "Akryl",
    finish: "Matná",
    hex: "#eeeeee",
  },

  // --- TAMIYA X (Gloss - Akryl) ---
  TAMIYA_X1: {
    displayCode: "X-1",
    name: "Black",
    type: "Akryl",
    finish: "Lesklá",
    hex: "#000000",
  },
  TAMIYA_X2: {
    displayCode: "X-2",
    name: "White",
    type: "Akryl",
    finish: "Lesklá",
    hex: "#ffffff",
  },
  TAMIYA_X7: {
    displayCode: "X-7",
    name: "Red",
    type: "Akryl",
    finish: "Lesklá",
    hex: "#ff0000",
  },
  TAMIYA_X10: {
    displayCode: "X-10",
    name: "Gun Metal",
    type: "Akryl",
    finish: "Kovová",
    hex: "#2a3439",
  },
  TAMIYA_X11: {
    displayCode: "X-11",
    name: "Chrome Silver",
    type: "Akryl",
    finish: "Kovová",
    hex: "#c0c0c0",
  },
  TAMIYA_X12: {
    displayCode: "X-12",
    name: "Gold Leaf",
    type: "Akryl",
    finish: "Kovová",
    hex: "#ffd700",
  },
  TAMIYA_X18: {
    displayCode: "X-18",
    name: "Semi-Gloss Black",
    type: "Akryl",
    finish: "Polomat",
    hex: "#0e0e0e",
  },
  TAMIYA_X27: {
    displayCode: "X-27",
    name: "Clear Red",
    type: "Akryl",
    finish: "Transparentní",
    hex: "#ffcccb",
  },

  // --- GUNZE H (Aqueous - Akryl) ---
  GUNZE_H1: {
    displayCode: "H-1",
    name: "White",
    type: "Akryl",
    finish: "Lesklá",
    hex: "#ffffff",
  },
  GUNZE_H2: {
    displayCode: "H-2",
    name: "Black",
    type: "Akryl",
    finish: "Lesklá",
    hex: "#000000",
  },
  GUNZE_H11: {
    displayCode: "H-11",
    name: "Flat White",
    type: "Akryl",
    finish: "Matná",
    hex: "#f9f9f9",
  },
  GUNZE_H12: {
    displayCode: "H-12",
    name: "Flat Black",
    type: "Akryl",
    finish: "Matná",
    hex: "#1a1a1a",
  },
  GUNZE_H58: {
    displayCode: "H-58",
    name: "Interior Green",
    type: "Akryl",
    finish: "Matná",
    hex: "#a6b77d",
  },
  GUNZE_H77: {
    displayCode: "H-77",
    name: "Tire Black",
    type: "Akryl",
    finish: "Matná",
    hex: "#232323",
  },
  GUNZE_H319: {
    displayCode: "H-319",
    name: "Light Green",
    type: "Akryl",
    finish: "Matná",
    hex: "#90ee90",
  },
  GUNZE_H416: {
    displayCode: "H-416",
    name: "RLM 66 Black Grey",
    type: "Akryl",
    finish: "Matná",
    hex: "#4d5154",
  },
  GUNZE_H417: {
    displayCode: "H-417",
    name: "RLM 76 Light Blue",
    type: "Akryl",
    finish: "Matná",
    hex: "#a3b7c2",
  },

  // --- GUNZE C (Mr. Color - Lacquer) ---
  GUNZE_C1: {
    displayCode: "C-1",
    name: "White",
    type: "Lacquer",
    finish: "Lesklá",
    hex: "#ffffff",
  },
  GUNZE_C2: {
    displayCode: "C-2",
    name: "Black",
    type: "Lacquer",
    finish: "Lesklá",
    hex: "#000000",
  },
  GUNZE_C8: {
    displayCode: "C-8",
    name: "Silver",
    type: "Lacquer",
    finish: "Kovová",
    hex: "#c0c0c0",
  },
  GUNZE_C33: {
    displayCode: "C-33",
    name: "Flat Black",
    type: "Lacquer",
    finish: "Matná",
    hex: "#1a1a1a",
  },
  GUNZE_C62: {
    displayCode: "C-62",
    name: "Flat White",
    type: "Lacquer",
    finish: "Matná",
    hex: "#f9f9f9",
  },
  GUNZE_C137: {
    displayCode: "C-137",
    name: "Tire Black",
    type: "Lacquer",
    finish: "Matná",
    hex: "#232323",
  },

  // --- AK INTERACTIVE (Real Colors) ---
  AKINTERACTIVE_RC001: {
    displayCode: "RC001",
    name: "Flat Black",
    type: "Lacquer",
    finish: "Matná",
    hex: "#1a1a1a",
  },
  AKINTERACTIVE_RC004: {
    displayCode: "RC004",
    name: "Flat White",
    type: "Lacquer",
    finish: "Matná",
    hex: "#fcfcfc",
  },
  AKINTERACTIVE_RC015: {
    displayCode: "RC015",
    name: "Burnt Umber",
    type: "Lacquer",
    finish: "Matná",
    hex: "#483c32",
  },

  // --- AK INTERACTIVE (3rd Gen Acrylics) ---
  AKINTERACTIVE_AK11001: {
    displayCode: "AK11001",
    name: "White",
    type: "Akryl",
    finish: "Matná",
    hex: "#ffffff",
  },
  AKINTERACTIVE_AK11029: {
    displayCode: "AK11029",
    name: "Black",
    type: "Akryl",
    finish: "Matná",
    hex: "#000000",
  },

  // --- VALLEJO (Model Color) ---
  VALLEJO_70950: {
    displayCode: "70.950",
    name: "Black",
    type: "Akryl",
    finish: "Matná",
    hex: "#000000",
  },
  VALLEJO_70951: {
    displayCode: "70.951",
    name: "White",
    type: "Akryl",
    finish: "Matná",
    hex: "#ffffff",
  },
  VALLEJO_70846: {
    displayCode: "70.846",
    name: "Mahogany Brown",
    type: "Akryl",
    finish: "Matná",
    hex: "#c04000",
  },
  VALLEJO_70863: {
    displayCode: "70.863",
    name: "Gunmetal Grey",
    type: "Akryl",
    finish: "Kovová",
    hex: "#727472",
  },

  // --- VALLEJO (Model Air) ---
  VALLEJO_71057: {
    displayCode: "71.057",
    name: "Black",
    type: "Akryl",
    finish: "Matná",
    hex: "#111111",
  },
  VALLEJO_71001: {
    displayCode: "71.001",
    name: "White",
    type: "Akryl",
    finish: "Matná",
    hex: "#fdfdfd",
  },
  VALLEJO_71062: {
    displayCode: "71.062",
    name: "Aluminium",
    type: "Akryl",
    finish: "Kovová",
    hex: "#a9a9a9",
  },
};

const BRANDS = [
  "Tamiya",
  "Gunze",
  "MRP",
  "AK Interactive",
  "Ammo by MIG",
  "Hataka",
  "Vallejo",
  "Jiné",
];

// Normalizace vstupů
const Normalizer = {
  // První velké, ostatní malé
  brand: (val) =>
    val && val.length > 0
      ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
      : val,
  // Vše malé
  name: (val) => (val ? val.toLowerCase() : val),
  // Vše velké
  code: (val) => (val ? val.toUpperCase() : val),
  // Generování ID
  generateId: (brand, code) => {
    if (!brand || !code) return null;
    const cleanBrand = brand
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/\./g, "");
    const cleanCode = code.toUpperCase().replace(/[\s\-\.]/g, "");
    return `${cleanBrand}_${cleanCode}`;
  },
};

// --- BEZPEČNÉ NAČÍTÁNÍ ENV PROMĚNNÝCH ---
const getEnv = (key) => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env[key] || "";
    }
  } catch (e) {}
  try {
    if (typeof process !== "undefined" && process.env) {
      return process.env[key] || "";
    }
  } catch (e) {}
  return "";
};

// Firebase Config
const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID"),
};

if (typeof __firebase_config !== "undefined") {
  try {
    Object.assign(firebaseConfig, JSON.parse(__firebase_config));
  } catch (e) {
    console.warn("Config parse error");
  }
}

// Inicializace Firebase
let app, auth, db;
let initError = null;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    initError = "Chybí API Key. Zkontrolujte .env soubor.";
  }
} catch (error) {
  console.error("Firebase Init Error:", error);
  initError = error.message;
}

// ==========================================
// 🧩 SUB-KOMPONENTY (UI Elements)
// ==========================================

// --- CONFIRM MODAL (Náhrada za systémový confirm) ---
const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Ano",
  cancelText = "Ne",
  isDestructive = false,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
        <div className="p-4 text-center">
          <div
            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDestructive ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"}`}
          >
            {isDestructive ? (
              <AlertTriangle size={24} />
            ) : (
              <HelpCircle size={24} />
            )}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400">{message}</p>
        </div>
        <div className="flex border-t border-slate-800">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-sm font-bold border-l border-slate-800 transition-colors ${isDestructive ? "text-red-500 hover:bg-red-500/10" : "text-blue-500 hover:bg-blue-500/10"}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- INPUT S PLOVOUCÍM LABELEM ---
const FloatingInput = ({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  classNameInput = "",
  labelColor = "text-slate-500",
  ...props
}) => (
  <div className={`relative ${className}`}>
    <label
      className={`absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] font-bold z-10 ${labelColor}`}
    >
      {label}
    </label>
    <input
      className={`w-full bg-slate-950 text-sm font-bold text-white border border-slate-700 rounded px-3 py-2.5 outline-none focus:border-blue-500 transition-colors placeholder-slate-700 italic ${classNameInput}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  </div>
);

// --- TEXTAREA S PLOVOUCÍM LABELEM ---
const FloatingTextarea = ({
  label,
  value,
  onChange,
  className = "",
  labelColor = "text-slate-500",
  height = "h-24",
  ...props
}) => (
  <div className={`relative ${className}`}>
    <label
      className={`absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] font-bold z-10 ${labelColor}`}
    >
      {label}
    </label>
    <textarea
      className={`w-full bg-slate-950 text-sm text-white border border-slate-700 rounded px-3 py-2.5 outline-none focus:border-blue-500 transition-colors resize-none ${height}`}
      value={value}
      onChange={onChange}
      {...props}
    />
  </div>
);

// --- SELECT S PLOVOUCÍM LABELEM ---
const FloatingSelect = ({
  label,
  value,
  onChange,
  options,
  className = "",
  labelColor = "text-slate-500",
  ...props
}) => (
  <div className={`relative ${className}`}>
    <label
      className={`absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] font-bold z-10 ${labelColor}`}
    >
      {label}
    </label>
    <select
      className="w-full bg-slate-950 text-sm font-bold text-white border border-slate-700 rounded px-3 py-2.5 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
      value={value}
      onChange={onChange}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// --- FILTROVACÍ CHIP ---
const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`text-[10px] font-bold px-2 py-1 rounded border transition-all whitespace-nowrap ${
      active
        ? "bg-blue-600 border-blue-500 text-white shadow-sm"
        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
    }`}
  >
    {label}
  </button>
);

// --- KARTA MODELU ---
const KitCard = React.memo(({ kit, onClick, projectName, onBuy }) => {
  const getStatusStyle = (s) => {
    switch (s) {
      case "new":
        return {
          border: "border-l-blue-500",
          icon: <Package size={18} className="text-blue-400" />,
        };
      case "wip":
        return { border: "border-l-orange-500", icon: null };
      case "finished":
        return {
          border: "border-l-green-500 opacity-70",
          icon: <Trophy size={18} className="text-green-500" />,
        };
      case "wishlist":
        return {
          border: "border-l-purple-500 border-dashed",
          icon: <ShoppingCart size={18} className="text-purple-400" />,
        };
      case "scrap":
        return {
          border: "border-l-slate-600 opacity-50 grayscale",
          icon: <Skull size={18} className="text-slate-500" />,
        };
      default:
        return { border: "border-slate-700", icon: null };
    }
  };

  const statusStyle = getStatusStyle(kit.status);

  return (
    <div
      onClick={() => onClick && onClick(kit)}
      className={`bg-slate-800 rounded-lg p-3 mb-2 shadow-sm hover:bg-slate-750 cursor-pointer transition-all border border-slate-700 border-l-4 ${statusStyle.border} relative group`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
              {kit.scale}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              {kit.brand} {kit.catNum && `• ${kit.catNum}`}
            </span>
          </div>

          <h3 className="font-bold text-slate-100 leading-tight truncate text-base">
            {kit.subject ? (
              <>
                {kit.subject}
                <span className="text-slate-400 text-xs font-bold ml-1.5 opacity-80">
                  {kit.name}
                </span>
              </>
            ) : (
              kit.name
            )}
          </h3>

          {projectName && (
            <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-2 font-medium">
              <Folder size={14} />{" "}
              <span className="truncate">{projectName}</span>
            </div>
          )}
          {!projectName && kit.legacyProject && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 italic">
              <History size={14} />{" "}
              <span className="truncate">Ex: {kit.legacyProject}</span>
            </div>
          )}
        </div>

        <div className="ml-2 flex flex-col items-end shrink-0 gap-1">
          {onBuy ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy(kit);
              }}
              className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg shadow-lg flex items-center justify-center transition-all active:scale-95"
            >
              <ShoppingBag size={20} />
            </button>
          ) : (
            <>
              {kit.status === "wip" ? (
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
              ) : (
                statusStyle.icon
              )}

              {(kit.scalematesUrl ||
                (kit.attachments && kit.attachments.length > 0)) && (
                <div
                  className={`text-slate-600 ${kit.status === "wip" ? "mt-1" : ""}`}
                >
                  <Paperclip size={14} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// --- KARTA BARVY ---
const PaintCard = React.memo(({ paint, onClick, onDelete, onBuy }) => {
  // Sjednocení stylu levého okraje s KitCard
  const getStatusStyle = (s) => {
    switch (s) {
      case "in_stock":
        return "border-l-green-500";
      case "low":
        return "border-l-orange-500";
      case "wanted":
        return "border-l-purple-500";
      case "empty":
        return "border-l-red-500";
      default:
        return "border-l-slate-700";
    }
  };

  return (
    <div
      onClick={() => onClick && onClick(paint)}
      className={`bg-slate-800 rounded-lg p-3 mb-2 shadow-sm hover:bg-slate-750 cursor-pointer transition-all border border-slate-700 border-l-4 ${getStatusStyle(paint.status)} flex items-center justify-between group`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className="w-8 h-8 rounded-full shadow-inner border border-slate-600 shrink-0"
          style={{ backgroundColor: paint.hex || "#999" }}
          title={paint.hex}
        ></div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
              {paint.brand}
            </span>
            <span className="text-xs font-bold text-white truncate">
              {paint.code}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">{paint.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2">
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
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  paint.status === "in_stock"
                    ? "bg-green-500/10 text-green-500"
                    : paint.status === "low"
                      ? "bg-orange-500/10 text-orange-500"
                      : paint.status === "wanted"
                        ? "bg-purple-500/10 text-purple-500"
                        : "bg-red-500/10 text-red-500"
                }`}
              >
                {paint.status === "in_stock"
                  ? "Skladem"
                  : paint.status === "low"
                    ? "Dochází"
                    : paint.status === "wanted"
                      ? "Koupit"
                      : "Prázdné"}
              </span>
              <span className="text-[10px] text-slate-600">{paint.type}</span>
            </div>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(paint.id);
                }}
                className="text-slate-600 hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-colors ml-1"
              >
                <Trash2 size={16} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
});

// --- SETTINGS MODAL ---
const SettingsModal = ({ user, onClose, kits, projects, paints, onImport }) => {
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const handleExport = () => {
    const dataToExport = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      kits,
      projects,
      paints,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `model-diary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Předáme soubor do rodičovské komponenty k zpracování přes ConfirmModal
    onImport(file);
    e.target.value = "";
  };

  const copyToClipboard = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Auth Error:", error);
      setAuthError(error.code + ": " + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    if (!auth) {
      alert(`CHYBA: Aplikace nevidí API klíče.`);
      return;
    }
    try {
      setAuthLoading(true);
      await signInAnonymously(auth);
    } catch (e) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    setAuthLoading(true);
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setAuthLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!user) return "Nepřihlášen (Offline)";
    if (user.isAnonymous) return "Anonymní uživatel";
    return user.displayName || `Uživatel (ID: ${user.uid.substring(0, 6)}...)`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cloud className="text-blue-400" size={20} /> Nastavení Cloudu
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-full ${!user ? "bg-slate-700 text-slate-400" : user.isAnonymous ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"}`}
              >
                {user ? <User size={20} /> : <WifiOff size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-bold uppercase">
                  Přihlášen jako
                </p>
                <p className="text-sm text-white font-medium truncate">
                  {getDisplayName()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {/* Google Login */}
              {(!user || user.isAnonymous) && (
                <button
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                  <LogIn size={16} /> Přihlásit se přes Google
                </button>
              )}

              {/* Error Message */}
              {authError && (
                <div className="bg-red-900/30 border border-red-500/30 text-red-200 p-3 rounded text-xs break-words animate-in slide-in-from-top-1">
                  <strong className="block mb-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> Chyba přihlášení
                  </strong>
                  {authError}
                  <div className="mt-2 text-[10px] text-red-300 opacity-80">
                    Tip: Pokud jste přidali doménu teprve teď, vyčkejte pár
                    minut a zkuste to znovu.
                  </div>
                </div>
              )}

              {/* Anonymní Login */}
              {!user && (
                <button
                  onClick={handleAnonymousLogin}
                  disabled={authLoading}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Ghost size={16} /> Přihlásit se anonymně
                </button>
              )}

              {/* Logout */}
              {user && (
                <button
                  onClick={handleLogout}
                  disabled={authLoading}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {authLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <LogOut size={16} />
                  )}{" "}
                  Odhlásit se
                </button>
              )}
            </div>
          </div>

          {/* CATALOG INFO */}
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-full text-blue-400">
              <Wand2 size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Master Katalog</h4>
              <p className="text-xs text-slate-500">
                Obsahuje{" "}
                <span className="text-blue-400 font-mono font-bold">
                  {Object.keys(MASTER_CATALOG).length}
                </span>{" "}
                předdefinovaných barev.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ID Deníku
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-slate-300 break-all">
                {user?.uid || "Lokální režim"}
              </code>
              <button
                onClick={copyToClipboard}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 p-3 rounded-lg"
              >
                {copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border ${user ? "bg-blue-900/20 border-blue-500/20" : "bg-orange-900/10 border-orange-500/20"}`}
          >
            <h4
              className={`font-bold mb-1 flex items-center gap-2 ${user ? "text-blue-400" : "text-orange-400"}`}
            >
              <RefreshCw size={16} /> Status synchronizace
            </h4>
            <p className="text-sm text-slate-300/80">
              {user
                ? "Data se ukládají do cloudu."
                : "Offline režim. Data jsou pouze v tomto prohlížeči."}
            </p>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Database size={18} className="text-orange-400" /> Správa dat
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-3 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
              >
                <Download size={24} className="text-blue-400" />
                <span className="text-xs font-bold">Exportovat</span>
              </button>
              <label
                className={`bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-3 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95 cursor-pointer ${importing ? "opacity-50 pointer-events-none" : ""}`}
              >
                {importing ? (
                  <Loader2 size={24} className="animate-spin text-orange-400" />
                ) : (
                  <Upload size={24} className="text-orange-400" />
                )}
                <span className="text-xs font-bold">
                  {importing ? "Importuji..." : "Importovat"}
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportClick}
                  className="hidden"
                  disabled={importing}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <span className="text-xs text-slate-600">{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
};

// --- PROJECT DETAIL MODAL ---
const ProjectDetailModal = ({
  project,
  onClose,
  onSave,
  allKits,
  onUpdateKitLink,
  onAddWishlistKit,
}) => {
  const [data, setData] = useState({ accessories: [], ...project });
  const [activeTab, setActiveTab] = useState("info");

  const [showLinkKit, setShowLinkKit] = useState(false);
  const [selectedKitId, setSelectedKitId] = useState("");
  const [newAccessory, setNewAccessory] = useState({
    name: "",
    status: "owned",
    url: "",
  });

  const projectKits = useMemo(
    () => allKits.filter((k) => k.projectId === project.id),
    [allKits, project.id],
  );
  const availableKits = useMemo(
    () => allKits.filter((k) => !k.projectId),
    [allKits],
  );

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

  const isFormValid = data.name && data.name.trim().length > 0;

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
            <div className="space-y-4 pt-2">
              <FloatingInput
                label="Název projektu *"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Můj projekt"
                labelColor="text-blue-400"
              />

              <FloatingSelect
                label="Stav"
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value })}
                options={[
                  { value: "planned", label: "📅 Plánováno" },
                  { value: "active", label: "🔥 Aktivní" },
                  { value: "finished", label: "✅ Dokončeno" },
                  { value: "hold", label: "⏸️ Pozastaveno" },
                ]}
              />

              <FloatingTextarea
                label="Popis"
                value={data.description}
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
                height="h-32"
              />

              <p className="text-[10px] text-blue-400/50 font-bold">
                * tyto údaje jsou povinné
              </p>
            </div>
          )}
          {activeTab === "content" && (
            <>
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
                        <span className="text-sm truncate">
                          {k.subject ? (
                            <span className="font-bold mr-1">{k.subject}</span>
                          ) : null}
                          {k.name}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {k.scale}
                        </span>
                      </div>
                      {/* Zde nepotřebujeme potvrzení přes modal, protože je to jen odlinkování, ne destruktivní operace dat */}
                      <button
                        onClick={() => onUpdateKitLink(k.id, null)}
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
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs py-2 rounded flex items-center justify-center gap-1"
                  >
                    <Link2 size={14} /> Připojit ze skladu
                  </button>
                  <button
                    onClick={onAddWishlistKit}
                    className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs py-2 rounded flex items-center justify-center gap-1"
                  >
                    <ShoppingCart size={14} /> Přidat do nákupu
                  </button>
                </div>
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
                          {k.subject} {k.name} ({k.scale})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        onUpdateKitLink(selectedKitId, project.id);
                        setShowLinkKit(false);
                        setSelectedKitId("");
                      }}
                      disabled={!selectedKitId}
                      className="w-full bg-blue-600 text-white text-xs py-1.5 rounded disabled:opacity-50"
                    >
                      Připojit
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Layers size={14} /> Doplňky projektu
                </h4>
                <div className="mb-3 p-2 bg-slate-800 rounded border border-slate-700">
                  <input
                    className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white mb-2"
                    placeholder="Název"
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
                  {data.accessories?.map((acc) => (
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
                              className="text-xs text-blue-400 flex items-center gap-1 hover:underline"
                            >
                              <LinkIcon size={10} /> Odkaz
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setData({
                            ...data,
                            accessories: data.accessories.filter(
                              (a) => a.id !== acc.id,
                            ),
                          })
                        }
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
        <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-end rounded-b-xl">
          <button
            onClick={() => isFormValid && onSave(data)}
            disabled={!isFormValid}
            className={`px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all ${isFormValid ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
          >
            <Save size={18} /> Uložit
          </button>
        </div>
      </div>
    </div>
  );
};

// --- KIT DETAIL MODAL ---
const KitDetailModal = ({ kit, onClose, onSave, projects }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [data, setData] = useState({
    ...kit,
    accessories: kit.accessories || [],
  }); // Zajistíme pole
  const [newTodo, setNewTodo] = useState("");
  const [newAttachment, setNewAttachment] = useState({
    name: "",
    url: "",
    type: "manual",
  });
  const [newAccessory, setNewAccessory] = useState({
    name: "",
    status: "owned",
    url: "",
  });

  const isScaleValid = (s) => !s || /^\d+\/\d+$/.test(s);
  const isBuildLocked = data.status !== "wip";

  const addTodo = () => {
    if (newTodo.trim()) {
      setData((d) => ({
        ...d,
        todo: [
          ...(d.todo || []),
          { id: Date.now(), text: newTodo, done: false },
        ],
      }));
      setNewTodo("");
    }
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

  // Validace povinných polí: Výrobce, Předloha, Měřítko
  const isFormValid = data.brand && data.subject && data.scale;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl border border-slate-700 flex flex-col max-h-[95vh] shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex flex-col gap-3 rounded-t-xl">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Box size={16} /> Detail Modelu
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded-full hover:bg-slate-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:flex gap-3">
              <FloatingInput
                className="col-span-2 sm:flex-1"
                label="Výrobce *"
                value={data.brand}
                onChange={(e) =>
                  setData({ ...data, brand: Normalizer.brand(e.target.value) })
                }
                placeholder="Tamiya"
                labelColor="text-blue-400"
              />
              <FloatingInput
                className="col-span-1 sm:w-20"
                label="Měřítko *"
                value={data.scale}
                onChange={(e) => setData({ ...data, scale: e.target.value })}
                placeholder="1/48"
                labelColor="text-blue-400"
                classNameInput={
                  !isScaleValid(data.scale) ? "border-red-500" : ""
                }
              />
              <FloatingInput
                className="col-span-1 sm:w-24"
                label="Kat. č."
                value={data.catNum}
                onChange={(e) => setData({ ...data, catNum: e.target.value })}
                placeholder="61100"
              />
            </div>
            <div className="flex gap-3">
              <FloatingInput
                className="flex-1"
                label="Předloha *"
                value={data.subject || ""}
                onChange={(e) => setData({ ...data, subject: e.target.value })}
                placeholder="F-16C"
                labelColor="text-blue-400"
              />
              <FloatingInput
                className="flex-[1.5]"
                label="Název"
                value={data.name}
                onChange={(e) =>
                  setData({ ...data, name: Normalizer.name(e.target.value) })
                }
                placeholder="Block 50"
              />
            </div>
          </div>
        </div>
        <div className="flex border-b border-slate-800 bg-slate-950">
          {["info", "parts", "build", "files"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                (!isBuildLocked || tab !== "build") && setActiveTab(tab)
              }
              disabled={tab === "build" && isBuildLocked}
              className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === tab ? "text-blue-400 border-b-2 border-blue-400" : tab === "build" && isBuildLocked ? "text-slate-700 cursor-not-allowed" : "text-slate-500 hover:text-slate-300"}`}
            >
              {tab === "info" && <FileText size={16} />}
              {tab === "parts" && <Layers size={16} />}
              {tab === "build" &&
                (isBuildLocked ? <Lock size={14} /> : <Hammer size={16} />)}
              {tab === "files" && <Paperclip size={16} />}
              <span className="capitalize hidden sm:inline">
                {tab === "files"
                  ? "Přílohy"
                  : tab === "build"
                    ? "Stavba"
                    : tab === "parts"
                      ? "Doplňky"
                      : "Info"}
              </span>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
          {activeTab === "info" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Status
                </label>
                <select
                  value={data.status}
                  onChange={(e) => setData({ ...data, status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none"
                >
                  <option value="new">📦 Skladem</option>
                  <option value="wip">🚧 Rozestavěno</option>
                  <option value="finished">🏆 Hotovo</option>
                  <option value="wishlist">🛒 Chci koupit</option>
                  <option value="scrap">♻️ Vrakoviště</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Projekt
                </label>
                <select
                  value={data.projectId || ""}
                  onChange={(e) =>
                    setData({ ...data, projectId: e.target.value || null })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none"
                >
                  <option value="">-- Žádný --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FloatingTextarea
                  label="Poznámky"
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  height="h-32"
                />
              </div>
              <p className="text-[10px] text-blue-400/50 font-bold">
                * tyto údaje jsou povinné
              </p>
            </div>
          )}
          {activeTab === "parts" && (
            <div className="space-y-4">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Layers size={14} /> Doplňky pro tento model
                </h4>
                <div className="mb-3 p-2 bg-slate-900 rounded border border-slate-700">
                  <input
                    className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-white mb-2"
                    placeholder="Název (např. Eduard Plechy)"
                    value={newAccessory.name}
                    onChange={(e) =>
                      setNewAccessory({ ...newAccessory, name: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <select
                      className="bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-white"
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
                      className="flex-1 bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-white"
                      placeholder="URL obchodu..."
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
                  {data.accessories?.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-700"
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
                              className="text-xs text-blue-400 flex items-center gap-1 hover:underline"
                            >
                              <LinkIcon size={10} /> Odkaz
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
                      Žádné doplňky.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === "build" && !isBuildLocked && (
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
                <h4 className="text-sm font-bold text-slate-300 mb-2">Plán</h4>
                <div className="flex gap-2 mb-2">
                  <input
                    className="flex-1 bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                    placeholder="Nový úkol..."
                  />
                  <button
                    onClick={addTodo}
                    className="bg-blue-600 text-white p-2 rounded"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-1">
                  {data.todo?.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 bg-slate-800/50 p-2 rounded group"
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() =>
                          setData((d) => ({
                            ...d,
                            todo: d.todo.map((t) =>
                              t.id === task.id ? { ...t, done: !t.done } : t,
                            ),
                          }))
                        }
                        className="rounded bg-slate-700 border-slate-600 text-orange-500 focus:ring-0"
                      />
                      <span
                        className={`flex-1 text-sm ${task.done ? "text-slate-500 line-through" : "text-slate-200"}`}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            todo: d.todo.filter((t) => t.id !== task.id),
                          }))
                        }
                        className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
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
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.scalemates.com/search.php?q=${encodeURIComponent(data.brand + " " + data.catNum + " " + data.name)}`,
                        "_blank",
                      )
                    }
                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs px-3 py-2 rounded border border-blue-500/30 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Search size={14} /> Najít kit
                  </button>
                  <input
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 text-xs text-white"
                    placeholder="URL..."
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
                      placeholder="Název"
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
                      placeholder="URL..."
                      value={newAttachment.url}
                      onChange={(e) =>
                        setNewAccessory({
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
                  {data.attachments?.map((att) => (
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
        <div className="p-4 border-t border-slate-800 bg-slate-800/50 flex justify-end rounded-b-xl">
          <button
            onClick={() => isFormValid && onSave(data)}
            disabled={!isFormValid}
            className={`px-6 py-2 rounded font-bold shadow-lg flex items-center gap-2 transition-all ${isFormValid ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
          >
            <Save size={18} /> Uložit
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PAINT DETAIL MODAL ---
const PaintDetailModal = ({ paint, onClose, onSave, existingPaints }) => {
  const [data, setData] = useState({
    brand: "",
    code: "",
    name: "",
    type: "Akryl",
    finish: "Matná",
    status: "in_stock",
    hex: "#999999",
    notes: "",
    thinner: "",
    ratioPaint: 60,
    ratioThinner: 40,
    ...paint,
  });

  // Našeptávač state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [duplicateError, setDuplicateError] = useState(null);

  // Detekce duplicit - NYNÍ JAKO ERROR, NE WARNING
  useEffect(() => {
    if (data.brand && data.code && existingPaints) {
      const cleanBrand = data.brand.toLowerCase();
      const cleanCode = data.code.toLowerCase().replace(/[\s\-\.]/g, "");

      // Hledáme shodu, ale ignorujeme právě editovanou barvu (pokud existuje)
      const duplicate = existingPaints.find(
        (p) =>
          p.id !== paint.id &&
          p.brand.toLowerCase() === cleanBrand &&
          p.code.toLowerCase().replace(/[\s\-\.]/g, "") === cleanCode,
      );

      if (duplicate) {
        setDuplicateError(
          `Tuto barvu už máte ve skladu (${duplicate.status === "in_stock" ? "Skladem" : duplicate.status}).`,
        );
      } else {
        setDuplicateError(null);
      }
    }
  }, [data.brand, data.code, existingPaints, paint.id]);

  // Efekt pro Našeptávač
  useEffect(() => {
    if (data.brand && data.code && !paint.id) {
      // Jen pro nové barvy nebo při změně
      const searchBrand = data.brand.toUpperCase().replace(/\s+/g, "");
      const searchCode = data.code.toUpperCase().replace(/[\s\-\.]/g, "");

      // Hledání v MASTER_CATALOG
      const matches = Object.entries(MASTER_CATALOG).filter(([key, val]) => {
        // Klíč musí začínat Značkou
        if (!key.startsWith(searchBrand)) return false;
        // A obsahovat Kód
        return key.includes(searchCode);
      });

      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [data.brand, data.code, paint.id]);

  const handleSelectSuggestion = ([key, val]) => {
    // OPRAVA: Nyní vyplňujeme i Kód (displayCode z katalogu)
    setData((prev) => ({
      ...prev,
      code: val.displayCode || prev.code, // Pokud katalog nemá displayCode, necháme původní
      name: val.name,
      type: val.type,
      finish: val.finish,
      hex: val.hex,
    }));
    setShowSuggestions(false);
  };

  const isFormValid = data.brand && data.code && data.name && !duplicateError;

  // Funkce pro dynamický přepočet poměru
  const handleRatioChange = (type, value) => {
    if (value === "") {
      setData((d) => ({ ...d, ratioPaint: "", ratioThinner: "" }));
      return;
    }
    const num = parseInt(value);
    if (isNaN(num)) return;
    if (num > 100) return;
    if (type === "paint")
      setData((d) => ({ ...d, ratioPaint: num, ratioThinner: 100 - num }));
    else setData((d) => ({ ...d, ratioThinner: num, ratioPaint: 100 - num }));
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-lg rounded-xl border border-slate-700 shadow-2xl flex flex-col max-h-[95vh]">
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center rounded-t-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Palette size={20} className="text-blue-400" />
            {paint.id ? "Upravit barvu" : "Nová barva"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto bg-slate-900 relative">
          {/* ERROR O DUPLICITĚ - ZMĚNA NA ČERVENOU A BLOKACI */}
          {duplicateError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-pulse font-bold">
              <Ban size={16} className="shrink-0 text-red-500" />
              Nelze uložit duplikát: {duplicateError}
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <label className="absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] font-bold z-10 text-blue-400">
                Značka *
              </label>
              <select
                className="w-full bg-slate-950 text-sm font-bold text-white border border-slate-700 rounded px-3 py-2.5 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                value={data.brand}
                onChange={(e) => setData({ ...data, brand: e.target.value })}
              >
                <option value="">-- Vyber --</option>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <FloatingInput
                label="Kód *"
                value={data.code}
                onChange={(e) =>
                  setData({ ...data, code: Normalizer.code(e.target.value) })
                }
                placeholder="XF-1"
                labelColor="text-blue-400"
              />
              {/* NAŠEPTÁVAČ UI */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-slate-800 border border-slate-600 rounded-lg mt-1 z-50 shadow-xl max-h-40 overflow-y-auto">
                  <div className="p-2 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-700 bg-slate-900/50">
                    Nalezeno v katalogu:
                  </div>
                  {suggestions.map(([key, val]) => (
                    <div
                      key={key}
                      onClick={() => handleSelectSuggestion([key, val])}
                      className="p-2 hover:bg-blue-600/20 hover:text-blue-300 cursor-pointer text-xs flex items-center gap-2 transition-colors border-b border-slate-700/50 last:border-0"
                    >
                      <Wand2 size={12} className="text-purple-400" />
                      <span className="font-bold text-white">
                        {val.displayCode}
                      </span>
                      <span className="text-slate-300 truncate">
                        {val.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <FloatingInput
            label="Název / Odstín *"
            value={data.name}
            onChange={(e) =>
              setData({ ...data, name: Normalizer.name(e.target.value) })
            }
            placeholder="flat black"
            labelColor="text-blue-400"
          />

          {/* NOVÝ LAYOUT: Typ + Povrch + Status v jedné řadě */}
          <div className="flex gap-3">
            <FloatingSelect
              className="flex-1"
              label="Typ"
              value={data.type}
              onChange={(e) => setData({ ...data, type: e.target.value })}
              options={[
                { value: "Akryl", label: "💧 Akryl" },
                { value: "Enamel", label: "🛢️ Enamel" },
                { value: "Lacquer", label: "☣️ Lacquer" },
                { value: "Olej", label: "🎨 Olej" },
                { value: "Pigment", label: "🏜️ Pigment" },
              ]}
            />
            <FloatingSelect
              className="flex-1"
              label="Povrch"
              value={data.finish}
              onChange={(e) => setData({ ...data, finish: e.target.value })}
              options={[
                { value: "Matná", label: "Matná" },
                { value: "Polomat", label: "Polomat" },
                { value: "Lesklá", label: "Lesklá" },
                { value: "Kovová", label: "Kovová" },
                { value: "Transparentní", label: "Transparentní" },
              ]}
            />
            <FloatingSelect
              className="flex-1"
              label="Status"
              value={data.status}
              onChange={(e) => setData({ ...data, status: e.target.value })}
              options={[
                { value: "in_stock", label: "✅ Skladem" },
                { value: "low", label: "⚠️ Dochází" },
                { value: "empty", label: "❌ Prázdné" },
                { value: "wanted", label: "🛒 Koupit" },
              ]}
            />
          </div>

          {/* PŘESUNUTO: Hláška o povinných údajích */}
          <p className="text-[10px] text-blue-400/50 font-bold -mt-2 mb-2">
            * tyto údaje jsou povinné (značka, kód, název)
          </p>

          {/* ŘEDĚNÍ - Kompaktní řádek */}
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
              <Droplets size={14} className="text-blue-400" /> Ředění
            </h4>

            <div className="flex gap-3 items-end">
              <FloatingInput
                className="flex-[2]"
                label="Ředidlo"
                value={data.thinner || ""}
                onChange={(e) => setData({ ...data, thinner: e.target.value })}
                placeholder="Např. Tamiya X-20A"
              />

              {/* Kompaktní poměr */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 h-[42px]">
                <div className="text-center">
                  <label className="text-[8px] text-slate-500 font-bold block">
                    BARVA
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-8 bg-transparent text-center text-sm font-bold text-white outline-none appearance-none"
                    placeholder="60"
                    value={data.ratioPaint}
                    onChange={(e) => handleRatioChange("paint", e.target.value)}
                  />
                </div>
                <span className="text-slate-500 font-bold">:</span>
                <div className="text-center">
                  <label className="text-[8px] text-slate-500 font-bold block">
                    ŘEDIDLO
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-8 bg-transparent text-center text-sm font-bold text-white outline-none appearance-none"
                    placeholder="40"
                    value={data.ratioThinner}
                    onChange={(e) =>
                      handleRatioChange("thinner", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ODSTÍN PREVIEW */}
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">
              Odstín (Preview)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={data.hex}
                onChange={(e) => setData({ ...data, hex: e.target.value })}
                className="w-12 h-12 rounded cursor-pointer border-none bg-transparent"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={data.hex}
                  onChange={(e) => setData({ ...data, hex: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-white uppercase outline-none focus:border-blue-500"
                  placeholder="#000000"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Klikni na čtvereček nebo vlož kód.
                </p>
              </div>
            </div>
          </div>

          {/* POZNÁMKY */}
          <div className="pt-2">
            <FloatingTextarea
              label="Poznámky (např. chování v pistoli)"
              value={data.notes || ""}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              height="h-24"
              labelColor="text-orange-400"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-end rounded-b-xl">
          <button
            onClick={() => isFormValid && onSave(data)}
            disabled={!isFormValid}
            className={`px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all ${isFormValid ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
          >
            <Save size={18} /> Uložit
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 HLAVNÍ APLIKACE (App)
// ==========================================

export default function App() {
  const [view, setView] = useState("kits");
  const [kits, setKits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [paints, setPaints] = useState([]); // --- NOVÉ: State pro barvy
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDestructive: false,
  });

  // Filtry
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    scales: [],
    brands: [],
    kitStatuses: [],
    projectStatuses: [],
    paintBrands: [], // --- NOVÉ
    paintTypes: [], // --- NOVÉ
  });

  const [manualDataUid, setManualDataUid] = useState(null);

  const [activeKit, setActiveKit] = useState(null);
  const [isNewKit, setIsNewKit] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [activePaint, setActivePaint] = useState(null); // --- NOVÉ
  const [isNewPaint, setIsNewPaint] = useState(false); // --- NOVÉ

  const activeUid = manualDataUid || user?.uid;

  // --- FIREBASE SYNC ---
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
          ) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
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

  // --- DATA LOADING ---
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

  // --- CONFIRMATION HELPER ---
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

  // --- SAVE LOGIC ---
  const handleSaveItem = async (
    collectionName,
    itemData,
    isNew,
    setList,
    list,
  ) => {
    const dataToSave = { ...itemData };
    if (collectionName === "kits" && dataToSave.projectId)
      dataToSave.legacyProject = null;

    // Generování ID pro barvy (BRAND_CODE)
    let customId = null;
    if (collectionName === "paints") {
      customId = Normalizer.generateId(dataToSave.brand, dataToSave.code);
      if (customId) dataToSave.id = customId; // Vynutíme custom ID
    }

    if (!db || !user) {
      // Offline Mode
      const finalId = customId || dataToSave.id || Date.now().toString();
      if (isNew) {
        // Pokud barva s tímto ID už existuje, přepíšeme ji (update) místo duplikace
        if (collectionName === "paints" && list.some((i) => i.id === finalId)) {
          setList(
            list.map((i) =>
              i.id === finalId ? { ...dataToSave, id: finalId } : i,
            ),
          );
        } else {
          setList([...list, { ...dataToSave, id: finalId }]);
        }
      } else
        setList(list.map((i) => (i.id === dataToSave.id ? dataToSave : i)));
    } else if (user && activeUid) {
      // Online Mode
      const colRef = collection(
        db,
        "artifacts",
        "model-diary",
        "users",
        activeUid,
        collectionName,
      );

      if (collectionName === "paints" && customId) {
        // Pro barvy používáme setDoc s merge: true (Upsert)
        await setDoc(
          doc(colRef, customId),
          { ...dataToSave, createdAt: serverTimestamp() },
          { merge: true },
        );
      } else {
        // Pro ostatní (Kits, Projects) klasický flow
        if (isNew) {
          const { id, ...cleanData } = dataToSave;
          await addDoc(colRef, { ...cleanData, createdAt: serverTimestamp() });
        } else {
          const { id, ...cleanData } = dataToSave;
          await updateDoc(doc(colRef, dataToSave.id), cleanData);
        }
      }
    }

    if (collectionName === "kits") setActiveKit(null);
    else if (collectionName === "projects") setActiveProject(null);
    else setActivePaint(null);
  };

  const deleteItem = async (collectionName, id, list, setList) => {
    // Používáme custom modal, volání funkce až po potvrzení
    const performDelete = async () => {
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
    };

    requestConfirm(
      "Opravdu smazat?",
      "Tato akce je nevratná. Položka bude trvale odstraněna.",
      performDelete,
      true,
    );
  };

  // --- IMPORT LOGIC S MODALEM ---
  const handleImportRequest = (file) => {
    requestConfirm(
      "Import dat",
      "Pozor! Import přepíše všechna data se stejným ID. Opravdu chcete pokračovat?",
      async () => {
        // Zde zopakujeme logiku importu, ale bez confirm dialogu
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

  // --- SHOPPING LIST LOGIC ---
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

    // --- NOVÉ: Barvy, které docházejí nebo jsou wanted
    const wishlistPaints = paints.filter(
      (p) => p.status === "wanted" || p.status === "low",
    );

    return {
      kits: wishlistKits,
      accessories: [...kitAccessories, ...projectAccessories],
      paints: wishlistPaints,
    };
  }, [kits, projects, paints]);

  // --- NEW: Mark as Bought Functions with Custom Confirm ---
  const handleMarkAsBought = (item, type) => {
    requestConfirm(
      "Označit jako koupené?",
      `Položka "${item.name || item.brand}" se přesune do skladu.`,
      async () => {
        if (type === "kit") {
          await handleSaveItem(
            "kits",
            { ...item, status: "new" },
            false,
            setKits,
            kits,
          );
        } else if (type === "paint") {
          await handleSaveItem(
            "paints",
            { ...item, status: "in_stock" },
            false,
            setPaints,
            paints,
          );
        }
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

  // --- FILTERING ---
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
  ); // NOVÉ
  const availablePaintTypes = useMemo(
    () => [...new Set(paints.map((p) => p.type).filter(Boolean))].sort(),
    [paints],
  ); // NOVÉ

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
    return kits.filter((k) => {
      return (
        (k.name + k.brand + (k.subject || ""))
          .toLowerCase()
          .includes(lowerSearch) &&
        (activeFilters.scales.length === 0 ||
          activeFilters.scales.includes(k.scale)) &&
        (activeFilters.brands.length === 0 ||
          activeFilters.brands.includes(k.brand)) &&
        (activeFilters.kitStatuses.length === 0 ||
          activeFilters.kitStatuses.includes(k.status))
      );
    });
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

  // --- NOVÉ: Filtered Paints ---
  const filteredPaints = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return paints.filter((p) => {
      return (
        (p.name + p.code + p.brand).toLowerCase().includes(lowerSearch) &&
        (activeFilters.paintBrands.length === 0 ||
          activeFilters.paintBrands.includes(p.brand)) &&
        (activeFilters.paintTypes.length === 0 ||
          activeFilters.paintTypes.includes(p.type))
      );
    });
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
              <img
                src="favicon.png"
                alt="Logo"
                className="w-10 h-10 rounded-xl shadow-lg border border-slate-600 object-cover"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Modelářský Deník
              </h1>
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
                    // Nastavení defaultních hodnot pro novou barvu
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
                      ratioPaint: 60, // Default 60
                      ratioThinner: 40, // Default 40
                    });
                  } else {
                    alert(
                      "Pro přidání položky přepněte na Sklad, Barvy nebo Projekty.",
                    );
                  }
                }}
                className={`p-2 rounded-full shadow text-white hover:brightness-110 bg-blue-600`}
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
              <Box size={16} /> Sklad
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
              className={`p-2 w-10 h-10 rounded-lg border flex items-center justify-center transition-opacity shrink-0 ${
                view === "shopping"
                  ? "opacity-0 pointer-events-none border-transparent bg-transparent"
                  : showFilter || hasActiveFilters
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
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
            <div className={db ? "text-green-500" : "text-orange-500"}>
              {db ? "Online" : "Offline"}
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
                        )}
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
                <div
                  key={p.id}
                  onClick={() => {
                    setIsNewProject(false);
                    setActiveProject(p);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-slate-500 transition-colors group mb-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-blue-400">
                      {p.name}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${p.status === "active" ? "bg-orange-500/20 text-orange-400" : p.status === "finished" ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-300"}`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4 truncate">
                    {p.description || "Bez popisu"}
                  </p>
                  <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Box size={12} /> Modely:
                    </h4>
                    {kits.filter((k) => k.projectId === p.id).length > 0 ? (
                      kits
                        .filter((k) => k.projectId === p.id)
                        .map((k) => (
                          <div
                            key={k.id}
                            className="text-sm text-slate-300 truncate"
                          >
                            • {k.subject} {k.name}
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-slate-600 italic">Prázdno.</p>
                    )}
                  </div>
                </div>
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
          <div className="space-y-4">
            {filteredPaints.length > 0 ? (
              filteredPaints.map((paint) => (
                <PaintCard
                  key={paint.id}
                  paint={paint}
                  onClick={() => {
                    setIsNewPaint(false);
                    setActivePaint(paint);
                  }}
                  onDelete={(id) => deleteItem("paints", id, paints, setPaints)}
                />
              ))
            ) : (
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
                    <div
                      key={`${acc.id}-${index}`}
                      className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center group"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-sm font-bold text-white truncate">
                          {acc.name}
                        </p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <ArrowRight size={10} /> pro:{" "}
                          <span className="text-blue-400 font-medium truncate">
                            {acc.parentName}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleBuyAccessory(acc)}
                        className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg shadow-lg flex items-center justify-center transition-all active:scale-95"
                        title="Označit jako koupené"
                      >
                        <ShoppingBag size={20} />
                      </button>
                    </div>
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

      {/* MODALS - ORDER MATTERS FOR STACKING */}
      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          kits={kits}
          projects={projects}
          paints={paints}
          onImport={handleImportRequest}
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
          onClose={() => setActiveKit(null)}
          onSave={(d) => handleSaveItem("kits", d, isNewKit, setKits, kits)}
          onDelete={(id) => deleteItem("kits", id, kits, setKits)}
        />
      )}
      {activePaint && (
        <PaintDetailModal
          paint={activePaint}
          existingPaints={paints}
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
