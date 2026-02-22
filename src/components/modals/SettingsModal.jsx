import React, { useState, useEffect, useRef } from "react";
import {
  Cloud,
  Settings,
  Palette,
  X,
  User,
  WifiOff,
  Ghost,
  Loader2,
  LogOut,
  RefreshCw,
  Check,
  Copy,
  Download,
  Upload,
  FileJson,
  Layout,
  Monitor,
  Moon,
  Sun,
  EyeOff,
  Zap,
  Droplets,
  RotateCcw,
  Globe,
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  Folder,
  ShoppingCart,
  Euro,
  DollarSign,
  Coins,
} from "lucide-react";
import { GoogleIcon } from "../ui/Icons";
import { auth } from "../../config/firebase";
import {
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const APP_VERSION = import.meta.env.PACKAGE_VERSION || "Dev";

const AccordionItem = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="bg-slate-800 rounded-xl border border-slate-700 transition-all">
    <button
      onClick={onToggle}
      className={`w-full p-4 flex items-center justify-between bg-slate-800 hover:bg-slate-700 transition-colors ${isOpen ? "rounded-t-xl" : "rounded-xl"}`}
    >
      <div className="flex items-center gap-2 font-bold text-slate-300 text-xs uppercase">
        <Icon size={16} className="text-blue-400" /> {title}
      </div>
      {isOpen ? (
        <ChevronUp size={16} className="text-slate-500" />
      ) : (
        <ChevronDown size={16} className="text-slate-500" />
      )}
    </button>
    {isOpen && (
      <div className="p-4 border-t border-slate-700 bg-slate-900/30 space-y-4 animate-in slide-in-from-top-2 rounded-b-xl">
        {children}
      </div>
    )}
  </div>
);

const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
  icon: LabelIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div
      className="bg-slate-800 p-3 rounded-lg border border-slate-700"
      ref={dropdownRef}
    >
      <div className="relative">
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-2">
          {LabelIcon && <LabelIcon size={12} />} {label}
        </label>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-transparent border-b border-slate-600 text-white text-sm py-2 pr-8 outline-none focus:border-blue-500 transition-colors flex items-center gap-2 text-left"
          >
            {selected?.icon && (
              <selected.icon size={16} className="text-blue-400" />
            )}
            <span>{selected?.label}</span>
            <ChevronDown
              size={16}
              className={`absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 p-2 text-sm hover:bg-slate-800 transition-colors ${value === opt.value ? "bg-blue-600/10 text-blue-400" : "text-slate-300"}`}
                >
                  {opt.icon && (
                    <opt.icon
                      size={16}
                      className={
                        value === opt.value ? "text-blue-400" : "text-slate-500"
                      }
                    />
                  )}
                  <span>{opt.label}</span>
                  {value === opt.value && (
                    <Check size={14} className="ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Modální okno nastavení aplikace.
 * Umožňuje správu cloudu (přihlášení/odhlášení), export/import dat a změnu ID skladu.
 *
 * @param {Object} props
 * @param {Object} props.user - Objekt aktuálně přihlášeného uživatele (Firebase User).
 * @param {Function} props.onClose - Handler pro zavření modalu.
 * @param {string} props.activeUid - ID aktuálního skladu/uživatele.
 * @param {Function} props.onSetManualId - Handler pro ruční nastavení ID skladu.
 * @param {Object} props.masterCatalog - Data hlavního katalogu barev (pro info).
 * @param {Function} [props.onCheckUpdates] - Handler pro manuální kontrolu aktualizací.
 * @param {Function} [props.onExport] - Handler pro export dat.
 * @param {Function} [props.onImport] - Handler pro import dat.
 * @param {Object} [props.preferences] - Objekt s uživatelským nastavením.
 * @param {Function} [props.onUpdatePreferences] - Funkce pro aktualizaci nastavení.
 * @param {Function} [props.onResetPreferences] - Handler pro reset nastavení.
 * @returns {JSX.Element}
 */
const SettingsModal = ({
  user,
  onClose,
  activeUid,
  onSetManualId,
  onCheckUpdates,
  onExport,
  onImport,
  preferences = {},
  onUpdatePreferences = () => {},
  onResetPreferences,
}) => {
  const [copied, setCopied] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [manualIdInput, setManualIdInput] = useState(activeUid || "");
  const fileInputRef = useRef(null);
  const [openSection, setOpenSection] = useState("account");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    setManualIdInput(activeUid || "");
  }, [activeUid]);
  const copyToClipboard = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const handleAuth = async (type) => {
    if (!auth) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (type === "google")
        await signInWithPopup(auth, new GoogleAuthProvider());
      else if (type === "anon") await signInAnonymously(auth);
      else if (type === "logout") {
        await signOut(auth);
      }
    } catch (e) {
      setAuthError(e.code + ": " + e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (onImport) onImport(data);
        alert("Data byla úspěšně importována.");
        onClose();
      } catch (err) {
        alert("Chyba při čtení souboru: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const getDisplayName = () =>
    !user
      ? "Nepřihlášen (Offline)"
      : user.isAnonymous
        ? "Anonymní uživatel"
        : user.displayName || `ID: ${user.uid.substring(0, 6)}...`;

  const togglePref = (key) => {
    onUpdatePreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleResetClick = () => {
    if (onResetPreferences) {
      onResetPreferences(() => {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden h-[90vh] flex flex-col relative">
        {/* Toast notifikace o úspěšném resetu */}
        {resetSuccess && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-xl border border-emerald-500 flex items-center gap-2 z-50 animate-in slide-in-from-top-4 fade-in zoom-in-95">
            <Check size={16} />
            <span className="text-xs font-bold">Nastavení bylo obnoveno</span>
          </div>
        )}

        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="text-slate-400" size={20} /> Nastavení
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* 1. ÚČET A SYNCHRONIZACE (Přesunuto nahoru) */}
          <AccordionItem
            title="Účet a Synchronizace"
            icon={Cloud}
            isOpen={openSection === "account"}
            onToggle={() => toggleSection("account")}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-full ${!user ? "bg-slate-700 text-slate-400" : user.isAnonymous ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"}`}
              >
                {user ? <User size={20} /> : <WifiOff size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-bold uppercase flex items-center gap-1">
                  {user?.providerData?.[0]?.providerId === "google.com" ? (
                    <>
                      Přihlášen přes <GoogleIcon className="w-3 h-3" /> jako
                    </>
                  ) : (
                    "Přihlášen jako"
                  )}
                </p>
                <p className="text-sm text-white font-medium truncate">
                  {getDisplayName()}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {(!user || user.isAnonymous) && (
                <button
                  onClick={() => handleAuth("google")}
                  disabled={authLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                  <GoogleIcon className="w-4 h-4" /> Přihlásit se přes Google
                </button>
              )}
              {authError && (
                <div className="bg-red-900/30 border border-red-500/30 text-red-200 p-3 rounded text-xs break-words">
                  <strong>Chyba přihlášení</strong>
                  <br />
                  {authError}
                </div>
              )}
              {!user && (
                <button
                  onClick={() => handleAuth("anon")}
                  disabled={authLoading}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Ghost size={16} /> Anonymní login
                </button>
              )}
              {user && (
                <button
                  onClick={() => handleAuth("logout")}
                  disabled={authLoading}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
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
          </AccordionItem>

          {/* 2. ID SKLADU */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ID Deníku / Skladu
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-[10px] font-mono text-slate-300 break-all outline-none focus:border-blue-500 transition-colors"
                value={manualIdInput}
                onChange={(e) => setManualIdInput(e.target.value)}
                placeholder="Zadejte ID..."
              />
              {manualIdInput !== activeUid && (
                <button
                  onClick={() => onSetManualId(manualIdInput)}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center animate-in fade-in"
                  title="Načíst tento sklad"
                >
                  <RefreshCw size={20} />
                </button>
              )}
              <button
                onClick={copyToClipboard}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 p-3 rounded-lg"
                title="Kopírovat ID"
              >
                {copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-600 italic">
              Změnou ID se připojíte k jinému skladu (např. synchronizace mezi
              zařízenímí).
            </p>
          </div>

          {/* 3. OSTATNÍ SEKCE */}
          <div className="space-y-3">
            {/* A) VZHLED A CHOVÁNÍ */}
            <AccordionItem
              title="Vzhled a Chování"
              icon={Palette}
              isOpen={openSection === "appearance"}
              onToggle={() => toggleSection("appearance")}
            >
              {/* 1. VIZUÁL */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Vizuál
                </h4>
                {/* TÉMA */}
                <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    {preferences.theme === "dark" ? (
                      <Moon size={16} />
                    ) : (
                      <Sun size={16} />
                    )}
                    Režim aplikace
                  </span>
                  <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                    <button
                      onClick={() =>
                        onUpdatePreferences((p) => ({ ...p, theme: "dark" }))
                      }
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${preferences.theme === "dark" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}
                    >
                      Tmavý
                    </button>
                    <button
                      onClick={() =>
                        onUpdatePreferences((p) => ({ ...p, theme: "light" }))
                      }
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${preferences.theme === "light" ? "bg-slate-200 text-slate-900" : "text-slate-500 hover:text-slate-300"}`}
                    >
                      Světlý
                    </button>
                  </div>
                </div>

                {/* KOMPAKTNÍ ZOBRAZENÍ */}
                <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <Layout size={16} /> Kompaktní zobrazení
                  </span>
                  <button
                    onClick={() => togglePref("compactMode")}
                    className={`w-10 h-5 rounded-full relative transition-colors ${preferences.compactMode ? "bg-blue-600" : "bg-slate-700"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${preferences.compactMode ? "left-5.5" : "left-0.5"}`}
                    ></div>
                  </button>
                </div>

                {/* ANIMACE */}
                <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <Zap size={16} /> Povolit animace
                  </span>
                  <button
                    onClick={() => togglePref("animations")}
                    className={`w-10 h-5 rounded-full relative transition-colors ${preferences.animations ? "bg-blue-600" : "bg-slate-700"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${preferences.animations ? "left-5.5" : "left-0.5"}`}
                    ></div>
                  </button>
                </div>
              </div>

              {/* 2. VÝCHOZÍ HODNOTY */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Výchozí hodnoty
                </h4>
                {/* VÝCHOZÍ POHLED */}
                <CustomDropdown
                  label="Výchozí pohled"
                  icon={Monitor}
                  value={preferences.defaultView || "kits"}
                  onChange={(val) =>
                    onUpdatePreferences((p) => ({ ...p, defaultView: val }))
                  }
                  options={[
                    { value: "kits", label: "Modely", icon: Package },
                    { value: "projects", label: "Projekty", icon: Folder },
                    { value: "paints", label: "Barvy", icon: Palette },
                    { value: "shopping", label: "Nákup", icon: ShoppingCart },
                  ]}
                />

                {/* PREFEROVANÁ MĚNA */}
                <CustomDropdown
                  label="Preferovaná měna"
                  value={preferences.currency || "CZK"}
                  onChange={(val) =>
                    onUpdatePreferences((p) => ({ ...p, currency: val }))
                  }
                  options={[
                    { value: "CZK", label: "CZK (Kč)", icon: Coins },
                    { value: "EUR", label: "EUR (€)", icon: Euro },
                    { value: "USD", label: "USD ($)", icon: DollarSign },
                  ]}
                />
              </div>

              {/* 3. CHOVÁNÍ A INTEGRACE */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Chování a Integrace
                </h4>
                {/* AUTOMATICKY UKLÁDAT POMĚRY */}
                <div>
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <span className="text-sm text-slate-300 flex items-center gap-2">
                      <Droplets size={16} /> Automaticky ukládat poměry
                    </span>
                    <button
                      onClick={() => togglePref("autoSaveRatios")}
                      className={`w-10 h-5 rounded-full relative transition-colors ${preferences.autoSaveRatios ? "bg-blue-600" : "bg-slate-700"}`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${preferences.autoSaveRatios ? "left-5.5" : "left-0.5"}`}
                      ></div>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 px-1 mt-1">
                    Aplikace si zapamatuje poslední použitý poměr ředění pro
                    každou značku a typ barvy.
                  </p>
                </div>

                {/* VYPNOUT SCALEMATES */}
                <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <Search size={16} /> Vypnout Scalemates
                  </span>
                  <button
                    onClick={() => togglePref("disableScalemates")}
                    className={`w-10 h-5 rounded-full relative transition-colors ${preferences.disableScalemates ? "bg-blue-600" : "bg-slate-700"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${preferences.disableScalemates ? "left-5.5" : "left-0.5"}`}
                    ></div>
                  </button>
                </div>
              </div>

              {/* 4. FILTRY */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Filtry
                </h4>
                {/* VÝCHOZÍ FILTRY */}
                <div className="space-y-2">
                  {[
                    {
                      key: "hideFinished",
                      label: "Skrýt dokončené modely",
                    },
                    { key: "hideScrap", label: "Skrýt vrakoviště" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-750"
                    >
                      <span className="text-sm text-slate-300">
                        {item.label}
                      </span>
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${preferences[item.key] ? "bg-blue-600 border-blue-500" : "bg-slate-900 border-slate-600"}`}
                      >
                        {preferences[item.key] && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={preferences[item.key] || false}
                        onChange={() => togglePref(item.key)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. RESET (Dole) */}
              {onResetPreferences && (
                <div className="pt-4 border-t border-slate-700/50">
                  <button
                    onClick={handleResetClick}
                    className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-400 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw size={14} /> Obnovit výchozí nastavení
                  </button>
                </div>
              )}
            </AccordionItem>

            {/* B) DATA A INTEGRACE */}
            <AccordionItem
              title="Data a Integrace"
              icon={FileJson}
              isOpen={openSection === "data"}
              onToggle={() => toggleSection("data")}
            >
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onExport}
                  className="bg-slate-900 hover:bg-slate-950 border border-slate-600 text-slate-300 p-3 rounded-lg flex flex-col items-center gap-2 transition-colors"
                >
                  <Download size={20} className="text-blue-400" />
                  <span className="text-xs font-bold">Exportovat</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-900 hover:bg-slate-950 border border-slate-600 text-slate-300 p-3 rounded-lg flex flex-col items-center gap-2 transition-colors"
                >
                  <Upload size={20} className="text-green-400" />
                  <span className="text-xs font-bold">Importovat</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={handleFileImport}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Stáhněte si zálohu svých dat ve formátu JSON nebo obnovte data
                ze souboru.
              </p>
            </AccordionItem>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex flex-col items-center gap-2">
          {onCheckUpdates && (
            <button
              onClick={onCheckUpdates}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={14} /> Zkontrolovat aktualizace
            </button>
          )}
          <div className="text-[10px] text-slate-500 font-mono">
            v{APP_VERSION}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
