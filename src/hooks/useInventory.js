import { useState, useEffect } from "react";
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
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Normalizer } from "../utils/normalizers";

/**
 * Hook pro správu datové vrstvy (Firestore).
 * Zajišťuje načítání dat v reálném čase (listeners) a CRUD operace.
 *
 * @param {Object} user - Aktuální uživatel (pro ověření práv k zápisu).
 * @param {string} activeUid - ID uživatele/skladu, se kterým se pracuje.
 * @param {Function} requestConfirm - Funkce pro vyvolání potvrzovacího modalu.
 * @returns {Object} Data a funkce pro manipulaci s nimi.
 * @returns {Array} return.kits - Seznam modelů.
 * @returns {Array} return.projects - Seznam projektů.
 * @returns {Array} return.paints - Seznam barev.
 * @returns {Function} return.saveItem - Funkce pro vytvoření nebo aktualizaci položky.
 * @returns {Function} return.deleteItem - Funkce pro smazání položky.
 * @returns {Function} return.markAsBought - Funkce pro přesun z nákupního seznamu do skladu.
 * @returns {Function} return.importData - Funkce pro import dat ze souboru.
 * @returns {Function} return.quickCreatePaint - Funkce pro rychlé vytvoření barvy (např. z katalogu).
 * @returns {Function} return.buyAccessory - Funkce pro označení doplňku jako koupeného.
 */
export const useInventory = (user, activeUid, requestConfirm) => {
  const [kits, setKits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [paints, setPaints] = useState([]);

  useEffect(() => {
    if (!user || !db || !activeUid) {
      if (!activeUid) {
        setKits([]);
        setProjects([]);
        setPaints([]);
      }
      return;
    }

    const handleError = (err) => {
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
      },
      handleError,
    );

    return () => {
      unsubKits();
      unsubProjs();
      unsubPaints();
    };
  }, [user, activeUid]);

  const saveItem = async (collectionName, itemData, isNew) => {
    const dataToSave = { ...itemData };
    if (dataToSave.initialTab) delete dataToSave.initialTab;
    if (collectionName === "kits" && dataToSave.projectId)
      dataToSave.legacyProject = null;

    let customId = null;
    if (collectionName === "paints") {
      customId = Normalizer.generateId(dataToSave.brand, dataToSave.code);
      if (customId) dataToSave.id = customId;
    }

    let list, setList;
    if (collectionName === "kits") {
      list = kits;
      setList = setKits;
    } else if (collectionName === "projects") {
      list = projects;
      setList = setProjects;
    } else if (collectionName === "paints") {
      list = paints;
      setList = setPaints;
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

  const deleteItem = async (collectionName, id) => {
    requestConfirm(
      "Opravdu smazat?",
      "Tato akce je nevratná. Položka bude trvale odstraněna.",
      async () => {
        if (!db || !user) {
          if (collectionName === "kits")
            setKits(kits.filter((i) => i.id !== id));
          else if (collectionName === "projects")
            setProjects(projects.filter((i) => i.id !== id));
          else if (collectionName === "paints")
            setPaints(paints.filter((i) => i.id !== id));
        } else if (user && activeUid)
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
      },
      true,
    );
  };

  const markAsBought = (item, type) => {
    requestConfirm(
      "Označit jako koupené?",
      `Položka "${item.name || item.brand}" se přesune do skladu.`,
      async () => {
        if (type === "kit")
          await saveItem("kits", { ...item, status: "new" }, false);
        else if (type === "paint")
          await saveItem("paints", { ...item, status: "in_stock" }, false);
      },
    );
  };

  const importData = (file) => {
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
          } else alert("Žádná data k importu.");
        } catch (err) {
          alert("Chyba importu: " + err.message);
        }
      },
      true,
    );
  };

  const quickCreatePaint = (newPaintData) => {
    const id =
      Normalizer.generateId(newPaintData.brand, newPaintData.code) ||
      Date.now().toString();
    saveItem("paints", { ...newPaintData, id }, true);
    return id;
  };

  const buyAccessory = (acc) => {
    requestConfirm(
      "Koupeno?",
      `Označit doplněk "${acc.name}" jako koupený?`,
      async () => {
        const collectionName = acc.parentType === "kit" ? "kits" : "projects";
        const parentList = acc.parentType === "kit" ? kits : projects;
        const parentItem = parentList.find((i) => i.id === acc.parentId);
        if (parentItem) {
          const updatedAccessories = parentItem.accessories.map((a) =>
            a.id === acc.id ? { ...a, status: "owned" } : a,
          );
          await saveItem(
            collectionName,
            { ...parentItem, accessories: updatedAccessories },
            false,
          );
        }
      },
    );
  };

  return {
    kits,
    projects,
    paints,
    saveItem,
    deleteItem,
    markAsBought,
    importData,
    quickCreatePaint,
    buyAccessory,
  };
};
