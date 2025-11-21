// =============================================
// useStore.js (Reconstruido y Modularizado)
// =============================================
// NOTA IMPORTANTE: Este archivo está diseñado para
// mantener EXACTAMENTE EL MISMO COMPORTAMIENTO que
// tu App.jsx original, solo está organizado y
// corregido. NO CAMBIA DISEÑO NI FUNCIONALIDAD.
// =============================================

import { useState, useEffect } from "react";

// =============================
// COLORES TEMÁTICOS DEFAULT
// =============================
export const EMERALD = "#22c55e";
export const EMERALD_DARK = "#166534";

// =============================
// ICONOS DEFAULT DE CATEGORÍA
// =============================
export const DEFAULT_ICONS = {
  desayunos: "🍳",
  comidas: "🍛",
  cenas: "🍽️",
  bebidas: "🥤",
  postres: "🍰",
};

// =============================
// LOCAL STORAGE
// =============================
const STORAGE_RESTAURANTES = "multi_rest_restaurantes_v1";

// =============================================
// useStore PRINCIPAL
// =============================================
export function useStore() {
  // -----------------------------
  // Restaurantes
  // -----------------------------
  const [restaurantes, setRestaurantes] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(STORAGE_RESTAURANTES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn("No se pudo cargar restaurantes:", e);
      }
    }

    const demoId = "demo-rest";
    return [
      {
        id: demoId,
        nombre: "Mi restaurante demo",
        direccion: "Calle Sabor #123, Ciudad",
        whatsapp: "",
        paymentLink: "",
        zonas: { lat: 0, lon: 0, feePerKm: 0 },
        menu: [],
        categoryIcons: DEFAULT_ICONS,
        ventas: [],
        logo: "",
        theme: { primary: EMERALD, secondary: EMERALD_DARK },
        testimonios: [],
      },
    ];
  });

  // -----------------------------
  // Restaurante activo
  // -----------------------------
  const [activeRest, setActiveRest] = useState(restaurantes[0]?.id || null);

  const r = restaurantes.find((x) => x.id === activeRest) || null;

  // -----------------------------
  // Guardar cambios en LocalStorage
  // -----------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_RESTAURANTES,
        JSON.stringify(restaurantes)
      );
    } catch (e) {
      console.warn("No se pudo guardar restaurantes:", e);
    }
  }, [restaurantes]);

  // -----------------------------
  // Agregar restaurante nuevo
  // -----------------------------
  const addRestaurant = () => {
    const id = "rest-" + Date.now();
    const nuevo = {
      id,
      nombre: "Nuevo restaurante",
      direccion: "",
      whatsapp: "",
      paymentLink: "",
      zonas: { lat: 0, lon: 0, feePerKm: 0 },
      menu: [],
      categoryIcons: DEFAULT_ICONS,
      ventas: [],
      logo: "",
      theme: { primary: EMERALD, secondary: EMERALD_DARK },
      testimonios: [],
    };

    setRestaurantes((prev) => [...prev, nuevo]);
    setActiveRest(id);
  };

  // -----------------------------
  // Actualizar un restaurante
  // -----------------------------
  const updateRestaurant = (id, patch) => {
    setRestaurantes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  // -----------------------------
  // Registrar una venta
  // -----------------------------
  const closeSale = (id, items, metodoPago) => {
    const total = items.reduce((s, i) => s + (i.total || 0), 0);
    const venta = {
      fecha: new Date().toISOString(),
      items,
      metodoPago,
      total,
    };

    setRestaurantes((prev) =>
      prev.map((res) =>
        res.id === id ? { ...res, ventas: [...res.ventas, venta] } : res
      )
    );
  };

  // -----------------------------
  // Tabs del App
  // -----------------------------
  const [tab, setTab] = useState("menu");

  // -----------------------------
  // EXPORTAR STORE
  // -----------------------------
  return {
    restaurantes,
    activeRest,
    r,
    tab,
    setTab,
    setActiveRest,

    addRestaurant,
    updateRestaurant,
    closeSale,
  };
}
