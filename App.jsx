// ===============================
// App.jsx — Plataforma Multi-Restaurante
// ===============================

import React, { useState, useEffect, useMemo } from "react";

// ===============================
// COLORES Y ANIMACIONES GLOBALES
// ===============================

const EMERALD = "#16a34a";
const EMERALD_DARK = "#0f5132";
const STORAGE_RESTAURANTES = "multi_rest_restaurantes_v1";

if (
  typeof document !== "undefined" &&
  !document.getElementById("multi-rest-global-styles")
) {
  const globalStyles = document.createElement("style");
  globalStyles.id = "multi-rest-global-styles";
  globalStyles.innerHTML = `
html, body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #020617;
  color: #0f172a;
}
* {
  box-sizing: border-box;
}
button {
  font-family: inherit;
}
input, select, textarea {
  font-family: inherit;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes floatSoft {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
  100% { transform: translateY(0px); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes softPop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
`;
  document.head.appendChild(globalStyles);
}

// ===============================
// ESTILOS BÁSICOS REUTILIZABLES
// ===============================

const layoutStyles = {
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "12px 16px 36px",
  },
  card: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 12px 25px rgba(15,23,42,0.15)",
    border: "1px solid rgba(148,163,184,0.25)",
  },
};

const Input = (props) => (
  <input
    {...props}
    style={{
      width: "100%",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      padding: "7px 11px",
      fontSize: 13,
      outline: "none",
      ...props.style,
    }}
  />
);

const TextArea = (props) => (
  <textarea
    {...props}
    style={{
      width: "100%",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      padding: "8px 11px",
      fontSize: 13,
      resize: "vertical",
      minHeight: 60,
      outline: "none",
      ...props.style,
    }}
  />
);

const Container = (props) => (
  <div
    {...props}
    style={{
      ...layoutStyles.container,
      ...(props.style || {}),
    }}
  />
);

const Grid = ({ columns = 2, children, style }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
      gap: 10,
      ...style,
    }}
  >
    {children}
  </div>
);

const Chip = ({ active, children, style, ...props }) => (
  <button
    {...props}
    style={{
      borderRadius: 999,
      border: "1px solid",
      borderColor: active ? EMERALD : "#e5e7eb",
      background: active ? "rgba(16,185,129,0.08)" : "#ffffff",
      color: active ? "#065f46" : "#374151",
      fontSize: 11,
      padding: "4px 9px",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      ...style,
    }}
  >
    {children}
  </button>
);

const Badge = ({ children, tone = "default" }) => {
  const colors = {
    default: { bg: "#e5e7eb", fg: "#111827" },
    success: { bg: "#dcfce7", fg: "#166534" },
    warning: { bg: "#fef3c7", fg: "#92400e" },
    danger: { bg: "#fee2e2", fg: "#b91c1c" },
    info: { bg: "#eff6ff", fg: "#1d4ed8" },
  };
  const c = colors[tone] || colors.default;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        background: c.bg,
        color: c.fg,
      }}
    >
      {children}
    </span>
  );
};

// Botones básicos
const BTN_BASE = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "7px 12px",
  borderRadius: 999,
  border: "1px solid transparent",
  fontSize: 12,
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const BTN = {
  ...BTN_BASE,
};

const BTN_OUTLINE = {
  ...BTN_BASE,
  background: "#ffffff",
  borderColor: "#e5e7eb",
  color: "#111827",
};

const BTN_DANGER = {
  ...BTN_BASE,
  background: "#fee2e2",
  borderColor: "#fecaca",
  color: "#b91c1c",
};

// Helper para formatear moneda
const currency = (value) => {
  if (!value) return "$0.00";
  return `$${value.toFixed(2)}`;
};

// Iconos por categoría
const DEFAULT_ICONS = {
  Comidas: "🍽️",
  Bebidas: "🥤",
  Desayunos: "🥞",
  Postres: "🍰",
  Snacks: "🍟",
  Especiales: "⭐",
};

// ===============================
// UTILIDADES
// ===============================

const fileToDataUrl = (file, cb) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    cb(e.target.result);
  };
  reader.readAsDataURL(file);
};

// ===============================
// STORE PRINCIPAL
// ===============================

function useStore() {
  // 1) Cargamos restaurantes desde localStorage si existen
  const [restaurantes, setRestaurantes] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(STORAGE_RESTAURANTES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn("No se pudo leer restaurantes guardados:", e);
      }
    }

    // Si no hay nada guardado, usamos el demo
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
        transferenciaBanco: "",
        transferenciaCuenta: "",
        transferenciaClabe: "",
        transferenciaTitular: "",

      },
    ];
  });

  const [activeRest, setActiveRest] = useState(
    restaurantes.length ? restaurantes[0].id : null
  );
  const [tab, setTab] = useState("menu");

  // 2) Guardar CADA CAMBIO en localStorage
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

  const addRestaurant = () => {
    const id = crypto.randomUUID();
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
      logo: "",
      theme: { primary: EMERALD, secondary: EMERALD_DARK },
      testimonios: [],
      transferenciaBanco: "",
      transferenciaCuenta: "",
      transferenciaClabe: "",
      transferenciaTitular: "",

    };
    setRestaurantes((prev) => [...prev, nuevo]);
    setActiveRest(id);
  };

  const updateRestaurant = (id, patch) => {
    setRestaurantes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  const addMenuItem = (restId, item) => {
    setRestaurantes((prev) =>
      prev.map((rr) =>
        rr.id === restId
          ? {
              ...rr,
              menu: [
                ...rr.menu,
                {
                  ...item,
                  id: crypto.randomUUID(),
                  activo: true,
                },
              ],
            }
          : rr
      )
    );
  };

  const updateMenuItem = (restId, itemId, patch) => {
    setRestaurantes((prev) =>
      prev.map((rr) =>
        rr.id === restId
          ? {
              ...rr,
              menu: rr.menu.map((m) =>
                m.id === itemId ? { ...m, ...patch } : m
              ),
            }
          : rr
      )
    );
  };

  const deleteMenuItem = (restId, itemId) => {
    setRestaurantes((prev) =>
      prev.map((rr) =>
        rr.id === restId
          ? { ...rr, menu: rr.menu.filter((m) => m.id !== itemId) }
          : rr
      )
    );
  };

  const closeSale = (restId, items, metodoPago) => {
  const total = items.reduce((a, b) => a + (b.total || 0), 0);
  const venta = {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    items,
    metodoPago,
    total,
    estadoPago: "pendiente", // 👈 NUEVO
  };
  setRestaurantes((prev) =>
    prev.map((rr) =>
      rr.id === restId
        ? { ...rr, ventas: [...(rr.ventas || []), venta] }
        : rr
    )
  );
};

const updateSaleStatus = (restId, saleId, estadoPago) => {
  setRestaurantes((prev) =>
    prev.map((rr) => {
      if (rr.id !== restId) return rr;
      return {
        ...rr,
        ventas: (rr.ventas || []).map((v) =>
          v.id === saleId ? { ...v, estadoPago } : v
        ),
      };
    })
  );
};


  const r =
    restaurantes.find((x) => x.id === activeRest) || restaurantes[0] || null;

return {
  restaurantes,
  activeRest,
  setActiveRest,
  tab,
  setTab,
  r,
  addRestaurant,
  updateRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  closeSale,
  updateSaleStatus,   // 👈 AÑADIDO
  };
} 

// ===============================
// HEADER / SELECTOR / TABS
// ===============================

function HeaderBar({ titulo }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background:
          "radial-gradient(circle at top left, rgba(74,222,128,0.18), transparent 55%), #020617",
        borderBottom: "1px solid rgba(148,163,184,0.35)",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "10px 16px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              background:
                "radial-gradient(circle at 0 0, #bbf7d0, #16a34a 35%, #0f172a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ecfdf5",
              fontWeight: 800,
              fontSize: 18,
              boxShadow: "0 8px 20px rgba(16,185,129,0.55)",
              transform: "translateY(0)",
              animation: "floatSoft 4s ease-in-out infinite",
            }}
          >
            R
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0.3,
                textTransform: "uppercase",
                color: "#e5e7eb",
              }}
            >
              Plataforma para restaurantes
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#9ca3af",
              }}
            >
              Menú digital + pedidos + reportes en una sola app
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#9ca3af",
            textAlign: "right",
          }}
        >
          Hecho para <span style={{ color: "#bbf7d0" }}>dueños</span> y{" "}
          <span style={{ color: "#bbf7d0" }}>equipos</span>
        </div>
      </div>
    </div>
  );
}

function RestaurantSelector({ restaurantes, activeRest, setActiveRest, addRestaurant }) {
  return (
    <Container style={{ paddingTop: 0, paddingBottom: 10 }}>
      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 4,
              }}
            >
              Restaurantes
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {restaurantes.map((r) => (
                <Chip
                  key={r.id}
                  active={r.id === activeRest}
                  onClick={() => setActiveRest(r.id)}
                >
                  <span style={{ fontSize: 13 }}>
                    {r.nombre || "Sin nombre"}
                  </span>
                </Chip>
              ))}
              <Chip
                onClick={addRestaurant}
                style={{
                  borderStyle: "dashed",
                  borderColor: "#d4d4d8",
                  background: "#f9fafb",
                  color: "#4b5563",
                }}
              >
                + Agregar restaurante
              </Chip>
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              maxWidth: 260,
              textAlign: "right",
            }}
          >
            Administra varios restaurantes desde un solo panel. Cada uno con
            menú, colores, WhatsApp y reportes separados.
          </div>
        </div>
      </Card>
    </Container>
  );
}

function TabsBar({ tab, setTab }) {
  const tabs = [
    { id: "menu", label: "Menú y platillos" },
    { id: "public", label: "Vista del cliente" },
    { id: "settings", label: "Ajustes del restaurante" },
    { id: "reports", label: "Reportes" },
  ];

  return (
    <Container style={{ paddingTop: 4, paddingBottom: 4 }}>
      <div
        style={{
          display: "inline-flex",
          padding: 3,
          borderRadius: 999,
          background: "#020617",
          border: "1px solid rgba(148,163,184,0.4)",
          boxShadow: "0 18px 45px rgba(15,23,42,0.55)",
        }}
      >
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                borderRadius: 999,
                padding: "5px 10px",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: 0.3,
                textTransform: "uppercase",
                color: active ? "#0f172a" : "#9ca3af",
                background: active
                  ? "linear-gradient(135deg, #22c55e, #a3e635)"
                  : "transparent",
                boxShadow: active
                  ? "0 10px 25px rgba(34,197,94,0.5)"
                  : "none",
                transform: active ? "translateY(-1px)" : "translateY(0)",
                transition: "all 0.16s ease",
                minWidth: 80,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </Container>
  );
}

// ===============================
// COMPONENTES DE ADMINISTRACIÓN
// ===============================

const Card = ({ children, style }) => (
  <div
    style={{
      ...layoutStyles.card,
      ...style,
    }}
  >
    {children}
  </div>
);

const Label = ({ children, style }) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 500,
      color: "#4b5563",
      marginBottom: 3,
      ...style,
    }}
  >
    {children}
  </div>
);

// Editor de menú
function MenuEditor({ r, store }) {
  const { addMenuItem, updateMenuItem, deleteMenuItem, updateRestaurant } =
    store;

  if (!r) return null;

  const [form, setForm] = useState({
    nombre: "",
    categoria: "Comidas",
    precio: "",
    costo: "",
    stock: "",
    foto: "",
    ingredientesBase: "",
    extras: "",
  });

  const handleFotoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    fileToDataUrl(file, (dataUrl) => {
      setForm((prev) => ({ ...prev, foto: dataUrl }));
    });
  };

  const handleAdd = () => {
    if (!form.nombre || !form.precio) {
      alert("Nombre y precio son obligatorios.");
      return;
    }
    const precioNumber = parseFloat(form.precio) || 0;
    const costoNumber = parseFloat(form.costo) || 0;
    const stockNumber = parseInt(form.stock || "0", 10);

    addMenuItem(r.id, {
      nombre: form.nombre,
      categoria: form.categoria,
      precio: precioNumber,
      costo: costoNumber,
      stock: stockNumber,
      foto: form.foto,
      ingredientesBase: form.ingredientesBase
        ? form.ingredientesBase.split(",").map((s) => s.trim())
        : [],
      extras: form.extras
        ? form.extras.split(",").map((s) => s.trim())
        : [],
    });

    setForm({
      nombre: "",
      categoria: "Comidas",
      precio: "",
      costo: "",
      stock: "",
      foto: "",
      ingredientesBase: "",
      extras: "",
    });
  };

  const handleUpdateField = (itemId, field, value) => {
    updateMenuItem(r.id, itemId, { [field]: value });
  };

  const handleFotoUpdate = (itemId, file) => {
    fileToDataUrl(file, (dataUrl) => {
      updateMenuItem(r.id, itemId, { foto: dataUrl });
    });
  };

  const handleIconChange = (categoria, value) => {
    const newIcons = { ...(r.categoryIcons || {}) };
    newIcons[categoria] = value || DEFAULT_ICONS[categoria] || "🍽️";
    updateRestaurant(r.id, { categoryIcons: newIcons });
  };

  const categoriasDef = [
    "Comidas",
    "Bebidas",
    "Desayunos",
    "Postres",
    "Snacks",
    "Especiales",
  ];

  return (
    <Container>
      <Card style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0, marginBottom: 6 }}>Configura tu menú</h3>
        <p
          style={{
            fontSize: 12,
            color: "#6b7280",
            marginTop: 0,
            marginBottom: 10,
          }}
        >
          Agrega platillos con foto, precio, costo y opciones de personalización
          (ingredientes y extras). Todo lo que cargues aquí se reflejará en la
          vista del cliente.
        </p>

        <Grid columns={3}>
          <div>
            <Label>Nombre del platillo</Label>
            <Input
              value={form.nombre}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nombre: e.target.value }))
              }
              placeholder="Ej: Hamburguesa clásica"
            />
          </div>
          <div>
            <Label>Categoría</Label>
            <select
              value={form.categoria}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, categoria: e.target.value }))
              }
              style={{
                width: "100%",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                padding: "7px 11px",
                fontSize: 13,
              }}
            >
              {categoriasDef.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Precio de venta</Label>
            <Input
              type="number"
              value={form.precio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, precio: e.target.value }))
              }
              placeholder="Ej: 89.00"
            />
          </div>
          <div>
            <Label>Costo (opcional)</Label>
            <Input
              type="number"
              value={form.costo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, costo: e.target.value }))
              }
              placeholder="Ej: 45.00"
            />
          </div>
          <div>
            <Label>Stock (opcional)</Label>
            <Input
              type="number"
              value={form.stock}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, stock: e.target.value }))
              }
              placeholder="Ej: 20"
            />
          </div>
          <div>
            <Label>Foto (subir desde archivo)</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="file" accept="image/*" onChange={handleFotoFile} />
              {form.foto && (
                <span style={{ fontSize: 11, color: "#15803d" }}>
                  ✅ Imagen lista
                </span>
              )}
            </div>
          </div>
          <div>
            <Label>Ingredientes base (separados por coma)</Label>
            <Input
              value={form.ingredientesBase}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  ingredientesBase: e.target.value,
                }))
              }
              placeholder="Ej: Pan, carne, queso, lechuga"
            />
          </div>
          <div>
            <Label>Extras opcionales (separados por coma)</Label>
            <Input
              value={form.extras}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, extras: e.target.value }))
              }
             placeholder="Ej: Tocino|15, Aguacate|12"
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              style={{
                ...BTN,
                background: EMERALD,
                color: "#ffffff",
                borderColor: EMERALD_DARK,
                fontWeight: 600,
              }}
              onClick={handleAdd}
            >
              + Agregar platillo
            </button>
          </div>
        </Grid>
      </Card>

      <Card>
        <h4 style={{ marginTop: 0, marginBottom: 8 }}>Categorías y iconos</h4>
        <p
          style={{
            fontSize: 12,
            color: "#6b7280",
            marginTop: 0,
            marginBottom: 8,
          }}
        >
          Elige un ícono para cada categoría. Así se mostrará en la vista del
          cliente.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {categoriasDef.map((cat) => (
            <div
              key={cat}
              style={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                padding: 8,
                minWidth: 130,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 5,
                }}
              >
                <span style={{ fontSize: 20 }}>
                  {r.categoryIcons?.[cat] || DEFAULT_ICONS[cat] || "🍽️"}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#111827",
                  }}
                >
                  {cat}
                </span>
              </div>
              <Input
                value={r.categoryIcons?.[cat] || DEFAULT_ICONS[cat] || "🍽️"}
                onChange={(e) => handleIconChange(cat, e.target.value)}
                placeholder="Ej: 🍕"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <h4 style={{ marginTop: 0, marginBottom: 8 }}>Platillos del menú</h4>
        {r.menu.length === 0 ? (
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            Aún no has agregado platillos. Usa el formulario de arriba para
            comenzar.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 10,
            }}
          >
            {r.menu.map((item) => (
              <div
                key={item.id}
                style={{
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  padding: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  {item.foto ? (
                    <img
                      src={item.foto}
                      alt={item.nombre}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 12,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 12,
                        background: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9ca3af",
                        fontSize: 24,
                        flexShrink: 0,
                      }}
                    >
                      📷
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <Input
                      value={item.nombre}
                      onChange={(e) =>
                        handleUpdateField(item.id, "nombre", e.target.value)
                      }
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        marginBottom: 4,
                      }}
                    />
                    <select
                      value={item.categoria}
                      onChange={(e) =>
                        handleUpdateField(item.id, "categoria", e.target.value)
                      }
                      style={{
                        width: "100%",
                        borderRadius: 999,
                        border: "1px solid #e5e7eb",
                        padding: "4px 8px",
                        fontSize: 11,
                      }}
                    >
                      {categoriasDef.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                    gap: 6,
                  }}
                >
                  <div>
                    <Label style={{ fontSize: 10 }}>Precio</Label>
                    <Input
                      type="number"
                      value={item.precio}
                      onChange={(e) =>
                        handleUpdateField(item.id, "precio", Number(e.target.value || 0))
                      }
                      style={{ fontSize: 11, padding: "5px 8px" }}
                    />
                  </div>
                  <div>
                    <Label style={{ fontSize: 10 }}>Costo</Label>
                    <Input
                      type="number"
                      value={item.costo || ""}
                      onChange={(e) =>
                        handleUpdateField(
                          item.id,
                          "costo",
                          Number(e.target.value || 0)
                        )
                      }
                      style={{ fontSize: 11, padding: "5px 8px" }}
                    />
                  </div>
                  <div>
                    <Label style={{ fontSize: 10 }}>Stock</Label>
                    <Input
                      type="number"
                      value={item.stock || ""}
                      onChange={(e) =>
                        handleUpdateField(
                          item.id,
                          "stock",
                          Number(e.target.value || 0)
                        )
                      }
                      style={{ fontSize: 11, padding: "5px 8px" }}
                    />
                  </div>
                </div>

                <div>
                  <Label style={{ fontSize: 10 }}>Ingredientes base</Label>
                  <TextArea
                    value={(item.ingredientesBase || []).join(", ")}
                    onChange={(e) =>
                      handleUpdateField(
                        item.id,
                        "ingredientesBase",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    style={{ fontSize: 11 }}
                  />
                </div>
                <div>
                  <Label style={{ fontSize: 10 }}>Extras opcionales</Label>
                  <TextArea
                    value={(item.extras || []).join(", ")}
                    onChange={(e) =>
                      handleUpdateField(
                        item.id,
                        "extras",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    style={{ fontSize: 11 }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 4,
                    gap: 8,
                  }}
                >
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      color: "#4b5563",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.activo !== false}
                      onChange={(e) =>
                        handleUpdateField(item.id, "activo", e.target.checked)
                      }
                    />
                    Visible en menú del cliente
                  </label>
                  <button
                    type="button"
                    style={{
                      ...BTN_DANGER,
                      paddingInline: 10,
                      fontSize: 11,
                    }}
                    onClick={() => {
                      const ok = window.confirm(
                        "¿Eliminar este platillo del menú?"
                      );
                      if (!ok) return;
                      deleteMenuItem(r.id, item.id);
                    }}
                  >
                    Eliminar
                  </button>
                </div>

                <div>
                  <Label style={{ fontSize: 10 }}>Actualizar foto</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      handleFotoUpdate(item.id, file);
                    }}
                    style={{ fontSize: 11 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Container>
  );
}

// ===============================
// MODAL PARA PERSONALIZAR PLATILLO
// ===============================

function CustomizeModal({ item, onClose, onAdd }) {
  const [seleccion, setSeleccion] = useState({
    // Lista de ingredientes que el cliente QUIERE QUITAR
    ingredientes: [],
    extras: [],
    qty: 1,
  });

  const base = item.ingredientesBase || [];
 


  const toggleExtra = (extra) => {
    setSeleccion((prev) => {
      const exists = prev.extras.includes(extra);
      return {
        ...prev,
        extras: exists
          ? prev.extras.filter((e) => e !== extra)
          : [...prev.extras, extra],
      };
    });
  };

const handleConfirm = () => {
  const basePrecio = item.precio || 0;
const qty = seleccion.qty || 1;
const extrasCost = (seleccion.extras || []).reduce((sum, extraName) => {
  const match = extrasParsed.find((ex) => ex.name === extraName);
  return sum + (match?.price || 0);
}, 0);
const total = basePrecio * qty + extrasCost;

  onAdd({
    ...item,
    qty: seleccion.qty || 1,
    // 👉 aquí guardamos directamente LO QUE SE QUITA
    seleccionIngredientes: seleccion.ingredientes,
    seleccionExtras: seleccion.extras,
    total,
  });
  onClose();
};

const extras = item.extras || [];

// Parseamos extras tipo "Nombre|precio" en una estructura amigable
const extrasParsed = (extras || []).map((raw) => {
  if (typeof raw !== "string") {
    return { raw, name: String(raw), price: 0 };
  }
  const [namePart, pricePart] = raw.split("|");
  const name = (namePart || "").trim();
  const price = parseFloat(pricePart || "0") || 0;
  return {
    raw,
    name: name || raw,
    price,
  };
});
 

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(420px, 100%)",
          background: "#ffffff",
          borderRadius: 18,
          boxShadow: "0 18px 40px rgba(15,23,42,0.45)",
          padding: 14,
          animation: "softPop 0.2s ease-out",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15 }}>{item.nombre}</h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <p
          style={{
            fontSize: 12,
            color: "#6b7280",
            marginTop: 0,
            marginBottom: 10,
          }}
        >
          Personaliza este platillo como lo quiera el cliente.
        </p>

        <div style={{ marginBottom: 8 }}>
          <Label style={{ fontSize: 11 }}>Ingredientes base</Label>
          {base.length === 0 ? (
            <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>
              No se especificaron ingredientes base.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
              }}
            >
             {base.map((ing) => (
  <Chip
    key={ing}
    // Activo = ingrediente marcado como "SIN"
    active={seleccion.ingredientes.includes(ing)}
    onClick={() => {
      setSeleccion((prev) => {
        const exists = prev.ingredientes.includes(ing);
        return {
          ...prev,
          ingredientes: exists
            ? prev.ingredientes.filter((i) => i !== ing) // lo vuelve a dejar normal
            : [...prev.ingredientes, ing],              // lo marca como SIN
        };
      });
    }}
    style={{ fontSize: 11 }}
  >
    {ing}
  </Chip>
))}

            </div>
          )}
        </div>

        <div style={{ marginBottom: 8 }}>
          <Label style={{ fontSize: 11 }}>Extras opcionales</Label>
          {extras.length === 0 ? (
            <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>
              No se configuraron extras.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
              }}
            >
             {extrasParsed.map((ext) => (
  <Chip
    key={ext.raw}
    active={seleccion.extras.includes(ext.name)}
    onClick={() => toggleExtra(ext.name)}
    style={{ fontSize: 11 }}
  >
    {ext.price ? `${ext.name} (+${currency(ext.price)})` : ext.name}
  </Chip>
))}

            </div>
          )}
        </div>

        <div style={{ marginBottom: 8 }}>
          <Label style={{ fontSize: 11 }}>Cantidad</Label>
          <Input
            type="number"
            min={1}
            value={seleccion.qty}
            onChange={(e) =>
              setSeleccion((prev) => ({
                ...prev,
                qty: Number(e.target.value || 1),
              }))
            }
            style={{ maxWidth: 80 }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#4b5563",
            }}
          >
            Precio base:{" "}
            <span style={{ fontWeight: 600 }}>{currency(item.precio)}</span>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              ...BTN,
              background: EMERALD,
              color: "#ffffff",
              borderColor: EMERALD_DARK,
              fontSize: 12,
            }}
          >
            Agregar al pedido
          </button>
        </div>
      </div>
    </div>
  );
}

// ===============================
// VISTA DEL CLIENTE
// ===============================

function PublicMenu({ r, cart, onStartOrder, onOpenCheckout, onRemoveItem, onClearCart }) {
 const [categoriaActiva, setCategoriaActiva] = useState("Comidas");

  const categorias = useMemo(() => {
    if (!r) return [];
    const cats = new Set();
    r.menu.forEach((item) => {
      if (item.activo !== false) {
        cats.add(item.categoria || "Comidas");
      }
    });
    return Array.from(cats);
  }, [r]);

  const itemsFiltrados = useMemo(() => {
    if (!r) return [];
    return r.menu.filter(
      (item) =>
        item.activo !== false &&
        (categoriaActiva ? item.categoria === categoriaActiva : true)
    );
  }, [r, categoriaActiva]);

  if (!r) return null;

  const themePrimary = r.theme?.primary || EMERALD;
  const themeSecondary = r.theme?.secondary || EMERALD_DARK;

  return (
    <div
      style={{
        background: "#020617",
        minHeight: 480,
        padding: "12px 12px 24px",
        borderRadius: 24,
        border: "1px solid rgba(148,163,184,0.4)",
        boxShadow: "0 22px 60px rgba(15,23,42,0.85)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {r.logo ? (
            <img
              src={r.logo}
              alt={r.nombre}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span style={{ fontSize: 20 }}>🍽️</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#e5e7eb",
            }}
          >
            {r.nombre || "Restaurante sin nombre"}
        {/* MENSAJE PERSONALIZADO DESDE AJUSTES */}
        {r.mensajeBienvenida && (
          <div
            style={{
              marginTop: 6,
              marginBottom: 10,
              padding: "6px 10px",
              borderRadius: 10,
              background: "rgba(15,23,42,0.7)",
              border: "1px solid rgba(148,163,184,0.5)",
              fontSize: 12,
              lineHeight: 1.5,
              color: "#e5e7eb",
              whiteSpace: "pre-line",
            }}
          >
            {r.mensajeBienvenida}
          </div>
        )}

          </div>
          <div
            style={{
              fontSize: 11,
              color: "#9ca3af",
            }}
          >
            Explora el menú, personaliza tu orden y envíala por WhatsApp.
          </div>
        </div>
        <div>
          <Badge tone="success">Online</Badge>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 2,
        }}
      >
        {categorias.length === 0 ? (
          <span
            style={{
              fontSize: 11,
              color: "#9ca3af",
            }}
          >
            No hay platillos activos todavía.
          </span>
        ) : (
          categorias.map((cat) => {
            const icon = r.categoryIcons?.[cat] || DEFAULT_ICONS[cat] || "🍽️";
            const active = cat === categoriaActiva;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                style={{
                  borderRadius: 999,
                  padding: "4px 9px",
                  border: "1px solid",
                  borderColor: active ? themePrimary : "rgba(148,163,184,0.5)",
                  background: active ? "rgba(16,185,129,0.2)" : "transparent",
                  color: active ? "#bbf7d0" : "#e5e7eb",
                  fontSize: 11,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  backdropFilter: "blur(10px)",
                }}
              >
                <span style={{ fontSize: 15 }}>{icon}</span>
                <span>{cat}</span>
              </button>
            );
          })
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)",
          gap: 10,
          marginTop: 8,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            borderRadius: 18,
            background: "linear-gradient(135deg, #0f172a, #020617)",
            border: "1px solid rgba(148,163,184,0.35)",
            padding: 8,
            minHeight: 220,
            maxHeight: 350,
            overflowY: "auto",
          }}
        >
          {itemsFiltrados.length === 0 ? (
            <p
              style={{
                fontSize: 11,
                color: "#9ca3af",
                margin: 0,
                padding: 8,
              }}
            >
              No hay platillos activos en esta categoría.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {itemsFiltrados.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: 8,
                    borderRadius: 14,
                    background:
                      "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(6,78,59,0.8))",
                    border: "1px solid rgba(74,222,128,0.25)",
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 14,
                      overflow: "hidden",
                      background: "#0b1120",
                      border: "1px solid rgba(148,163,184,0.4)",
                      flexShrink: 0,
                    }}
                  >
                    {item.foto ? (
                      <img
                        src={item.foto}
                        alt={item.nombre}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748b",
                          fontSize: 22,
                        }}
                      >
                        📷
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#e5e7eb",
                      }}
                    >
                      {item.nombre}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.ingredientesBase &&
                      item.ingredientesBase.length > 0 ? (
                        <span>
                          {item.ingredientesBase.slice(0, 4).join(", ")}
                          {item.ingredientesBase.length > 4 ? "..." : ""}
                        </span>
                      ) : (
                        <span>Personaliza al gusto del cliente.</span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#bbf7d0",
                        }}
                      >
                        {currency(item.precio || 0)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            ...BTN_OUTLINE,
                            fontSize: 11,
                            padding: "4px 8px",
                            color: "#e5e7eb",
                            borderColor: "rgba(148,163,184,0.5)",
                            background:
                              "linear-gradient(90deg, rgba(15,23,42,0.9), rgba(15,118,110,0.8))",
                          }}
                          onClick={() => onStartOrder(item, true)}
                        >
                          Personalizar
                        </button>
                        <button
                          type="button"
                          style={{
                            ...BTN,
                            fontSize: 11,
                            padding: "4px 8px",
                            background:
                              "linear-gradient(135deg,#22c55e,#4ade80)",
                            color: "#022c22",
                            borderColor: "rgba(74,222,128,0.7)",
                          }}
                          onClick={() => onStartOrder(item, false)}
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            borderRadius: 18,
            background:
              "radial-gradient(circle at top, rgba(22,163,74,0.25), transparent 55%), #020617",
            border: "1px solid rgba(148,163,184,0.35)",
            padding: 10,
            minHeight: 220,
            maxHeight: 350,
            overflowY: "auto",
            color: "#e5e7eb",
          }}
        >
          <h4
            style={{
              marginTop: 0,
              marginBottom: 6,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>🧾 Tu pedido</span>
          </h4>
          <p
            style={{
              fontSize: 11,
              color: "#9ca3af",
              marginTop: 0,
              marginBottom: 8,
            }}
          >
            Desde el celular del cliente verán aquí su resumen antes de
            confirmar.
          </p>
                    <div
            style={{
              fontSize: 11,
              color: "#9ca3af",
              borderRadius: 12,
              border: "1px dashed rgba(148,163,184,0.5)",
              padding: 8,
            }}
          >
            {!cart || cart.length === 0 ? (
              <>
                Cuando el cliente agregue platillos, aquí aparecerá el detalle y el
                botón para confirmar el pedido y enviarlo por WhatsApp.
              </>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  {cart.map((line, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 6,
                        borderRadius: 8,
                        background: "rgba(15,23,42,0.6)",
                        border: "1px solid rgba(148,163,184,0.4)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 2,
                        }}
                      >
                        <span style={{ fontSize: 12 }}>
                          {line.qty}× {line.nombre}
                        </span>
                        <span style={{ fontSize: 12 }}>
                          {line.total != null ? `$${line.total}` : ""}
                        </span>
                      </div>

                      {line.seleccionIngredientes &&
                        line.seleccionIngredientes.length > 0 && (
                          <div style={{ fontSize: 10 }}>
                            Sin: {line.seleccionIngredientes.join(", ")}
                          </div>
                        )}

                      {line.seleccionExtras &&
                        line.seleccionExtras.length > 0 && (
                          <div style={{ fontSize: 10 }}>
                            Extras: {line.seleccionExtras.join(", ")}
                          </div>
                        )}

                      {onRemoveItem && (
                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          style={{
                            marginTop: 4,
                            border: "none",
                            background: "transparent",
                            color: "#f97373",
                            fontSize: 10,
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          Quitar de este pedido
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  {onClearCart && (
                    <button
                      type="button"
                      onClick={onClearCart}
                      style={{
                        ...BTN,
                        fontSize: 11,
                        padding: "4px 8px",
                        background: "transparent",
                        color: "#e5e7eb",
                        borderColor: "rgba(148,163,184,0.7)",
                      }}
                    >
                      Vaciar pedido
                    </button>
                  )}

                  {onOpenCheckout && (
                    <button
                      type="button"
                      onClick={onOpenCheckout}
                      style={{
                        ...BTN,
                        fontSize: 11,
                        padding: "4px 10px",
                        background:
                          "linear-gradient(90deg,#22c55e,#4ade80)",
                        color: "#022c22",
                        borderColor: "rgba(74,222,128,0.7)",
                      }}
                    >
                      Confirmar pedido y pagar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===============================
// CHECKOUT MODAL (PANTALLA CLIENTE RESUMEN + PAGO)
// ===============================

function CheckoutModal({ r, cart, onClose, onSaleRegistered }) {
  const [nombre, setNombre] = useState("");
  const [tipoServicio, setTipoServicio] = useState("recoger");
  const [domicilio, setDomicilio] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [ubicacionExacta, setUbicacionExacta] = useState("");
  const [telefono, setTelefono] = useState("");

  if (!cart || cart.length === 0) {
    return null;
  }

  const total = cart.reduce((s, i) => s + (i.total || 0), 0);

  const handleUsarUbicacion = () => {
    if (!navigator.geolocation) {
      alert("Tu dispositivo no permite obtener la ubicación automáticamente.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

        setDomicilio(mapsUrl);
        setUbicacionExacta(mapsUrl);

        alert("Tu ubicación se ha agregado al pedido como enlace de Maps.");
      },
      (err) => {
        console.warn("Error al obtener ubicación:", err);
        alert(
          "No se pudo obtener tu ubicación. Por favor, escribe tu dirección manualmente."
        );
      }
    );
  };

  const handleConfirmar = () => {
    if (!nombre.trim()) {
      alert("Escribe tu nombre para continuar.");
      return;
    }

    if (!telefono.trim()) {
      alert("Escribe tu número de WhatsApp para confirmar tu pedido.");
      return;
    }

    if (tipoServicio === "domicilio" && !domicilio.trim()) {
      alert("Escribe tu dirección o usa tu ubicación de Maps.");
      return;
    }

    // 1) Armamos el detalle de los platillos, incluyendo SIN y EXTRAS
    const itemsResumen = (cart || [])
      .map((i) => {
        let line = `${i.qty} x ${i.nombre} (${currency(i.total || 0)})`;

        // Si el cliente QUITÓ ingredientes en la personalización
        if (i.seleccionIngredientes && i.seleccionIngredientes.length > 0) {
          line += `\n   • Sin: ${i.seleccionIngredientes.join(", ")}`;
        }

        if (i.seleccionExtras && i.seleccionExtras.length > 0) {
          line += `\n   • Extra: ${i.seleccionExtras.join(", ")}`;
        }

        return line;
      })
      .join("\n");

    // 2) Construimos el mensaje base que se mandará por WhatsApp
    let msg = `Nuevo pedido para *${r.nombre || "tu restaurante"}*:\n\n`;
    msg += `Cliente: ${nombre}\n`;
    msg += `Teléfono: ${telefono}\n`;
    msg += `Servicio: ${
      tipoServicio === "domicilio" ? "A domicilio" : "En el lugar"
    }\n`;
    if (tipoServicio === "domicilio" && domicilio) {
      msg += `Dirección / Ubicación: ${domicilio}\n`;
    }

    msg += `\nDetalle:\n${itemsResumen}\n\n`;
    msg += `Total: *${currency(total)}*\n`;
    msg += `Método de pago: ${metodoPago}\n`;

    // 3) Si el cliente eligió TRANSFERENCIA, agregamos tus datos bancarios
    if (metodoPago === "transferencia") {
      const banco = r?.transferenciaBanco || "";
      const cuenta = r?.transferenciaCuenta || "";
      const clabe = r?.transferenciaClabe || "";
      const titular = r?.transferenciaTitular || "";

      const tieneDatos = banco || cuenta || clabe || titular;

      if (tieneDatos) {
        msg += `\nDatos para transferencia:\n`;
        if (banco) {
          msg += `• Banco / cuenta: ${banco}\n`;
        }
        if (cuenta) {
          msg += `• Número de cuenta / tarjeta: ${cuenta}\n`;
        }
        if (clabe) {
          msg += `• CLABE: ${clabe}\n`;
        }
        if (titular) {
          msg += `• Titular: ${titular}\n`;
        }
      }
    }

    // 4) Número de WhatsApp del restaurante (desde Ajustes)
    const phoneRaw = r?.whatsapp || "";
    const phone = phoneRaw.replace(/\D/g, "");
    const baseUrl = "https://wa.me/";

    const url =
      phone.length >= 8
        ? `${baseUrl}${phone}?text=${encodeURIComponent(msg)}`
        : `${baseUrl}?text=${encodeURIComponent(msg)}`;

    // 5) Abrir WhatsApp con el mensaje prellenado
    window.open(url, "_blank");

    // 6) Registrar la venta en el sistema y cerrar el modal
    onSaleRegistered(cart, metodoPago);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <Card
        style={{
          maxWidth: 420,
          width: "90%",
          borderRadius: 16,
          background:
            "radial-gradient(circle at top, rgba(45,212,191,0.12), #020617)",
          border: "1px solid rgba(148,163,184,0.4)",
          color: "#e5e7eb",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: 12,
            fontSize: 18,
            color: "#e5e7eb",
          }}
        >
          Confirmar pedido
        </h3>

        {/* NOMBRE */}
        <div style={{ marginBottom: 10 }}>
          <Label>Tu nombre</Label>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Juan Pérez"
          />
        </div>

        {/* WHATSAPP */}
        <div style={{ marginBottom: 10 }}>
          <Label>Número de WhatsApp</Label>
          <Input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 521234567890"
          />
        </div>

        {/* TIPO DE SERVICIO */}
        <div style={{ marginBottom: 10 }}>
          <Label>Tipo de servicio</Label>
          <select
            value={tipoServicio}
            onChange={(e) => setTipoServicio(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 6,
              border: "1px solid #4b5563",
              backgroundColor: "#020617",
              color: "#e5e7eb",
              marginTop: 4,
            }}
          >
            <option value="recoger">Recoger en el restaurante</option>
            <option value="domicilio">Entrega a domicilio</option>
          </select>
        </div>

        {/* DIRECCIÓN / MAPS CUANDO ES DOMICILIO */}
        {tipoServicio === "domicilio" && (
          <div style={{ marginBottom: 10 }}>
            <Label>Dirección de entrega</Label>
            <TextArea
              value={domicilio}
              onChange={(e) => setDomicilio(e.target.value)}
              placeholder="Calle, número, colonia... o usa tu ubicación de Maps"
              style={{
                minHeight: 60,
              }}
            />
            <button
              type="button"
              onClick={handleUsarUbicacion}
              style={{
                marginTop: 6,
                fontSize: 12,
                borderRadius: 999,
                border: "1px dashed #4b5563",
                padding: "4px 10px",
                background: "#020617",
                color: "#e5e7eb",
                cursor: "pointer",
              }}
            >
              📍 Usar mi ubicación (Maps)
            </button>
          </div>
        )}

        {/* MÉTODO DE PAGO */}
        <div style={{ marginBottom: 10 }}>
          <Label>Método de pago</Label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 6,
              border: "1px solid #4b5563",
              backgroundColor: "#020617",
              color: "#e5e7eb",
              marginTop: 4,
            }}
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta / Link de pago</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        {/* DATOS BANCARIOS SI ELIGE TRANSFERENCIA */}
        {metodoPago === "transferencia" && (
          <div
            style={{
              marginBottom: 10,
              padding: 8,
              borderRadius: 10,
              border: "1px dashed #4b5563",
              background: "#020617",
              color: "#e5e7eb",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Datos para transferencia bancaria
            </div>
            {r.transferenciaBanco && (
              <div>🏦 Banco: {r.transferenciaBanco}</div>
            )}
            {r.transferenciaCuenta && (
              <div>💳 Cuenta / tarjeta: {r.transferenciaCuenta}</div>
            )}
            {r.transferenciaClabe && (
              <div>🔢 CLABE: {r.transferenciaClabe}</div>
            )}
            {r.transferenciaTitular && (
              <div>👤 Titular: {r.transferenciaTitular}</div>
            )}
            <div style={{ marginTop: 6, fontSize: 11, color: "#9ca3af" }}>
              Realiza tu transferencia con estos datos y envía tu comprobante
              por WhatsApp junto con tu nombre.
            </div>
          </div>
        )}

        {/* RESUMEN TOTAL */}
        <div
          style={{
            marginTop: 8,
            marginBottom: 12,
            fontSize: 14,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Total a pagar:</span>
          <strong>${total}</strong>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 8,
          }}
        >
          <button
            type="button"
            onClick={handleConfirmar}
            style={{
              ...BTN,
              width: "100%",
              background:
                "linear-gradient(90deg, #22c55e, #4ade80, #22c55e)",
              borderColor: "rgba(34,197,94,0.7)",
              color: "#022c22",
            }}
          >
            Confirmar pedido
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              ...BTN,
              width: "100%",
              background: "transparent",
              borderColor: "#4b5563",
              color: "#e5e7eb",
            }}
          >
            Cancelar
          </button>
        </div>
      </Card>
    </div>
  );
}


// ===============================
// PANEL DE REPORTES (MEJORADO)
// ===============================
function ReportsPanel({ r, store }) {
  const ventas = r?.ventas || [];
  const { updateSaleStatus } = store;

  // Helpers para fechas
  const toDate = (iso) => {
    try {
      return new Date(iso);
    } catch {
      return new Date();
    }
  };

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isWithinLastDays = (date, days) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const max = days * 24 * 60 * 60 * 1000;
    return diff >= 0 && diff <= max;
  };

  const today = new Date();

  const ventasHoy = ventas.filter((v) => isSameDay(toDate(v.fecha), today));
  const ventasSemana = ventas.filter((v) =>
    isWithinLastDays(toDate(v.fecha), 7)
  );
  const ventasMes = ventas.filter((v) => {
    const d = toDate(v.fecha);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth()
    );
  });

  const sumTotal = (arr) => arr.reduce((s, v) => s + (v.total || 0), 0);
  const countItems = (arr) =>
    arr.reduce(
      (s, v) =>
        s +
        (Array.isArray(v.items)
          ? v.items.reduce((acc, it) => acc + (it.qty || 0), 0)
          : 0),
      0
    );

  const totalHoy = sumTotal(ventasHoy);
  const totalSemana = sumTotal(ventasSemana);
  const totalMes = sumTotal(ventasMes);
  const totalGeneral = sumTotal(ventas);
  const numVentas = ventas.length;
  const ticketPromedio = numVentas ? totalGeneral / numVentas : 0;
  const articulosVendidos = countItems(ventas);

  // Métodos de pago
  const paymentMap = {};
  ventas.forEach((v) => {
    const key = v.metodoPago || "Sin método";
    if (!paymentMap[key]) paymentMap[key] = 0;
    paymentMap[key] += v.total || 0;
  });
  const paymentList = Object.entries(paymentMap);

  // Top productos
  const contadorProductos = {};
  ventas.forEach((v) => {
    (v.items || []).forEach((it) => {
      if (!contadorProductos[it.nombre]) {
        contadorProductos[it.nombre] = 0;
      }
      contadorProductos[it.nombre] += it.qty || 0;
    });
  });
  const topProductos = Object.entries(contadorProductos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Filtros por fecha
  const [filtroInicio, setFiltroInicio] = useState("");
  const [filtroFin, setFiltroFin] = useState("");

  const ventasFiltradas = useMemo(() => {
    if (!filtroInicio && !filtroFin) return ventas;

    const inicio = filtroInicio ? new Date(filtroInicio) : null;
    const fin = filtroFin ? new Date(filtroFin) : null;

    return ventas.filter((v) => {
      const fechaVenta = toDate(v.fecha);

      if (inicio && fechaVenta < inicio) return false;
      if (fin) {
        const finDia = new Date(fin);
        finDia.setHours(23, 59, 59, 999);
        if (fechaVenta > finDia) return false;
      }

      return true;
    });
  }, [ventas, filtroInicio, filtroFin]);

  const handleSendDailyWhatsApp = () => {
    if (!ventasHoy.length) {
      alert("Hoy no hay ventas registradas todavía.");
      return;
    }
    const total = currency(totalHoy);
    const tickets = ventasHoy.length;
    const productos = topProductos
      .map(([nombre, qty]) => `${qty} x ${nombre}`)
      .join("\n");

    let msg =
      `Resumen de ventas de hoy (${today.toLocaleDateString(
        "es-MX"
      )}):\n\n` +
      `• Ventas totales: ${total}\n` +
      `• Número de tickets: ${tickets}\n` +
      `• Ticket promedio: ${currency(ticketPromedio)}\n` +
      `• Artículos vendidos: ${articulosVendidos}\n`;

    if (productos) {
      msg += `\nTop productos:\n${productos}`;
    }

    const phoneRaw = r?.whatsapp || "";
    const phone = phoneRaw.replace(/\D/g, "");
    const baseUrl = "https://wa.me/";
    const url =
      phone.length >= 8
        ? `${baseUrl}${phone}?text=${encodeURIComponent(msg)}`
        : `${baseUrl}?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank");
  };

  if (!r) {
    return (
      <Container>
        <Card>
          <p style={{ margin: 0 }}>
            Selecciona un restaurante para ver sus reportes.
          </p>
        </Card>
      </Container>
    );
  }

  return (
    <Container style={{ paddingTop: 10, paddingBottom: 40 }}>
      {/* Resumen principal */}
      <Card style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0, marginBottom: 6 }}>
          Resumen de ventas de {r.nombre || "tu restaurante"}
        </h3>
      {/* MENSAJE DE BIENVENIDA CONFIGURABLE */}
      {r?.mensajeBienvenida && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 10px",
            borderRadius: 10,
            background: "rgba(15,23,42,0.6)",
            border: "1px solid rgba(148,163,184,0.6)",
            fontSize: 13,
            lineHeight: 1.5,
            color: "#e5e7eb",
            whiteSpace: "pre-line",
            textAlign: "center",
          }}
        >
          {r.mensajeBienvenida}
        </div>
      )}

        <p
          style={{
            fontSize: 12,
            color: "#6b7280",
            marginTop: 0,
            marginBottom: 10,
          }}
        >
          Aquí ves un resumen rápido de cómo va tu restaurante. Más abajo puedes
          revisar ventas por periodo, métodos de pago y platillos más vendidos.
        </p>

        <Grid columns={4} style={{ gap: 10 }}>
          <div
            style={{
              borderRadius: 10,
              padding: 8,
              background: "#ecfdf3",
              border: "1px solid #bbf7d0",
            }}
          >
            <div style={{ fontSize: 11, color: "#166534" }}>Ventas hoy</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {currency(totalHoy)}
            </div>
            <div style={{ fontSize: 11, color: "#4b5563" }}>
              Tickets: {ventasHoy.length}
            </div>
          </div>

          <div
            style={{
              borderRadius: 10,
              padding: 8,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            <div style={{ fontSize: 11, color: "#1d4ed8" }}>
              Semana (7 días)
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {currency(totalSemana)}
            </div>
            <div style={{ fontSize: 11, color: "#4b5563" }}>
              Ventas: {ventasSemana.length}
            </div>
          </div>

          <div
            style={{
              borderRadius: 10,
              padding: 8,
              background: "#fefce8",
              border: "1px solid #facc15",
            }}
          >
            <div style={{ fontSize: 11, color: "#854d0e" }}>Mes actual</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {currency(totalMes)}
            </div>
            <div style={{ fontSize: 11, color: "#4b5563" }}>
              Ventas: {ventasMes.length}
            </div>
          </div>

          <div
            style={{
              borderRadius: 10,
              padding: 8,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: 11, color: "#111827" }}>
              Total histórico
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {currency(totalGeneral)}
            </div>
            <div style={{ fontSize: 11, color: "#4b5563" }}>
              Ticket promedio: {currency(ticketPromedio)}
            </div>
          </div>
        </Grid>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            alignItems: "center",
          }}
        >
          {/* Filtros por fecha */}
          <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
            <div>
              <div style={{ color: "#6b7280", marginBottom: 2 }}>
                Desde
              </div>
              <input
                type="date"
                value={filtroInicio}
                onChange={(e) => setFiltroInicio(e.target.value)}
                style={{
                  padding: 4,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 11,
                }}
              />
            </div>
            <div>
              <div style={{ color: "#6b7280", marginBottom: 2 }}>
                Hasta
              </div>
              <input
                type="date"
                value={filtroFin}
                onChange={(e) => setFiltroFin(e.target.value)}
                style={{
                  padding: 4,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 11,
                }}
              />
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              <button
                type="button"
                onClick={() => {
                  setFiltroInicio("");
                  setFiltroFin("");
                }}
                style={{
                  ...BTN_OUTLINE,
                  fontSize: 11,
                  padding: "4px 8px",
                }}
              >
                Restablecer
              </button>
            </div>
          </div>

          {/* Botón WhatsApp */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              style={{
                ...BTN,
                background: EMERALD,
                color: "white",
                borderColor: EMERALD_DARK,
                fontSize: 12,
              }}
              onClick={handleSendDailyWhatsApp}
            >
              Enviar resumen de hoy por WhatsApp
            </button>
          </div>
        </div>
      </Card>

      {/* Panel de métodos de pago y top productos */}
      <Grid columns={2} style={{ gap: 12 }}>
        <Card>
          <h4 style={{ marginTop: 0, marginBottom: 6 }}>
            Ventas por método de pago
          </h4>
          {paymentList.length === 0 ? (
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              Aún no hay ventas registradas.
            </p>
          ) : (
            <div style={{ fontSize: 12 }}>
              {paymentList.map(([metodo, total]) => (
                <div
                  key={metodo}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span>{metodo}</span>
                  <span style={{ fontWeight: 600 }}>
                    {currency(total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h4 style={{ marginTop: 0, marginBottom: 6 }}>
            Top platillos más vendidos
          </h4>
          {topProductos.length === 0 ? (
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              Aún no hay ventas para analizar.
            </p>
          ) : (
            <ol
              style={{
                margin: 0,
                paddingLeft: 18,
                fontSize: 12,
              }}
            >
              {topProductos.map(([nombre, qty]) => (
                <li key={nombre} style={{ marginBottom: 2 }}>
                  {nombre}{" "}
                  <span style={{ color: "#6b7280" }}>
                    ({qty} piezas)
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </Grid>

      {/* Control de pagos */}
      <Card style={{ marginTop: 12 }}>
        <h4 style={{ marginTop: 0, marginBottom: 6 }}>
          Control de pagos (últimas ventas)
        </h4>
        <p
          style={{
            fontSize: 11,
            color: "#6b7280",
            marginTop: 0,
            marginBottom: 8,
          }}
        >
          Marca cada pedido como pagado o pendiente para llevar el control de
          cobros. Solo visible para el restaurantero.
        </p>

        {ventasFiltradas.length === 0 ? (
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
            No hay ventas en el rango seleccionado.
          </p>
        ) : (
          <div
            style={{
              maxHeight: 260,
              overflowY: "auto",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              padding: 8,
              fontSize: 12,
            }}
          >
            {ventasFiltradas
              .slice()
              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
              .map((v) => {
                const estado = v.estadoPago || "pendiente";
                const colorBg =
                  estado === "pagado" ? "#dcfce7" : "#fee2e2";
                const colorText =
                  estado === "pagado" ? "#166534" : "#b91c1c";

                return (
                  <div
                    key={v.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      paddingBottom: 6,
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                          {toDate(v.fecha).toLocaleString("es-MX")}
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {currency(v.total || 0)}
                        </div>
                        <div style={{ fontSize: 11, color: "#4b5563" }}>
                          {Array.isArray(v.items)
                            ? v.items
                                .map(
                                  (it) => `${it.qty || 1}x ${it.nombre}`
                                )
                                .join(", ")
                            : ""}
                        </div>
                      </div>

                      <div style={{ textAlign: "right", minWidth: 120 }}>
                        <div
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: colorBg,
                            color: colorText,
                            fontSize: 11,
                            marginBottom: 4,
                          }}
                        >
                          {estado === "pagado" ? "Pagado" : "Pendiente"}
                        </div>

                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            onClick={() =>
                              updateSaleStatus(r.id, v.id, "pendiente")
                            }
                            style={{
                              ...BTN_OUTLINE,
                              fontSize: 10,
                              padding: "2px 6px",
                            }}
                          >
                            Pendiente
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateSaleStatus(r.id, v.id, "pagado")
                            }
                            style={{
                              ...BTN,
                              fontSize: 10,
                              padding: "2px 6px",
                              background: "#22c55e",
                              borderColor: "#16a34a",
                              color: "white",
                            }}
                          >
                            Pagado
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </Card>
    </Container>
  );
}

// ===============================
// AJUSTES DEL RESTAURANTE
// ===============================

function SettingsPanel({ r, store }) {
  const { updateRestaurant } = store;

  const [local, setLocal] = useState({
    nombre: r?.nombre || "",
    direccion: r?.direccion || "",
    whatsapp: r?.whatsapp || "",
    paymentLink: r?.paymentLink || "",
    transferenciaBanco: r?.transferenciaBanco || "",
    transferenciaCuenta: r?.transferenciaCuenta || "",
    transferenciaClabe: r?.transferenciaClabe || "",
    transferenciaTitular: r?.transferenciaTitular || "",
    logo: r?.logo || "",
    themePrimary: r?.theme?.primary || "#16a34a",
    themeSecondary: r?.theme?.secondary || "#065f46",
  });

  const [testimonios, setTestimonios] = useState(r?.testimonios || []);
  const [testNombre, setTestNombre] = useState("");
  const [testTexto, setTestTexto] = useState("");

  useEffect(() => {
    setLocal({
      nombre: r?.nombre || "",
      direccion: r?.direccion || "",
      whatsapp: r?.whatsapp || "",
      paymentLink: r?.paymentLink || "",
      transferenciaBanco: r?.transferenciaBanco || "",
      transferenciaCuenta: r?.transferenciaCuenta || "",
      transferenciaClabe: r?.transferenciaClabe || "",
      transferenciaTitular: r?.transferenciaTitular || "",
      logo: r?.logo || "",
      themePrimary: r?.theme?.primary || "#16a34a",
      themeSecondary: r?.theme?.secondary || "#065f46",
    });
    setTestimonios(r?.testimonios || []);
  }, [r]);

  if (!r) {
    return (
      <Container>
        <Card>
          <p style={{ margin: 0 }}>
            Selecciona un restaurante para configurar sus datos.
          </p>
        </Card>
      </Container>
    );
  }

  const handleLogoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    fileToDataUrl(file, (dataUrl) => {
      setLocal((prev) => ({ ...prev, logo: dataUrl }));
    });
  };

  const handleGuardar = () => {
    updateRestaurant(r.id, {
      nombre: local.nombre,
      direccion: local.direccion,
      whatsapp: local.whatsapp,
      paymentLink: local.paymentLink,
      transferenciaBanco: local.transferenciaBanco,
      transferenciaCuenta: local.transferenciaCuenta,
      transferenciaClabe: local.transferenciaClabe,
      transferenciaTitular: local.transferenciaTitular,
      logo: local.logo,
      theme: {
        primary: local.themePrimary,
        secondary: local.themeSecondary,
      },
      testimonios,
    });
    alert("Datos guardados correctamente.");
  };

  const handleAddTestimonio = () => {
    if (!testNombre || !testTexto) {
      alert("Nombre y texto del testimonio son obligatorios.");
      return;
    }
    const nuevo = {
      id: crypto.randomUUID(),
      autor: testNombre,
      texto: testTexto,
    };
    setTestimonios((prev) => [...prev, nuevo]);
    setTestNombre("");
    setTestTexto("");
  };

  const handleDeleteTestimonio = (id) => {
    setTestimonios((prev) => prev.filter((t) => t.id !== id));
  };

  // 🔗 COPIAR LINK DEL MENÚ
  const handleCopyMenuLink = () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url);
        alert(
          "Link del menú copiado. Pégalo en WhatsApp, redes sociales, etc."
        );
      } else {
        alert(
          "No se pudo copiar automáticamente. Copia el link desde la barra del navegador."
        );
      }
    } catch (e) {
      console.warn("No se pudo copiar el link:", e);
      alert(
        "No se pudo copiar automáticamente. Copia el link desde la barra del navegador."
      );
    }
  };

  // 📱 ABRIR QR DEMO CON ESE LINK
  const handleOpenQrDemo = () => {
    try {
      const url = window.location.href;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        url
      )}`;
      window.open(qrUrl, "_blank");
    } catch (e) {
      console.warn("No se pudo abrir el QR:", e);
    }
  };

  return (
    <Container>
      <Card style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0, marginBottom: 6 }}>
          Ajustes del restaurante
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "#6b7280",
            marginTop: 0,
            marginBottom: 10,
          }}
        >
          Configura los datos básicos, el WhatsApp de pedidos, los colores,
          el logo, los datos de pago y testimonios que se mostrarán al cliente.
        </p>

        <Grid columns={2}>
          <div>
            <Label>Nombre del restaurante</Label>
            <Input
              value={local.nombre}
              onChange={(e) =>
                setLocal({ ...local, nombre: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Dirección (para referencia interna)</Label>
            <Input
              value={local.direccion}
              onChange={(e) =>
                setLocal({ ...local, direccion: e.target.value })
              }
            />
          </div>

          <div>
            <Label>WhatsApp para recibir pedidos</Label>
            <Input
              value={local.whatsapp}
              onChange={(e) =>
                setLocal({ ...local, whatsapp: e.target.value })
              }
              placeholder="Ej: 5244..."
            />
            <p
              style={{
                margin: 0,
                marginTop: 3,
                fontSize: 10,
                color: "#6b7280",
              }}
            >
              Usa formato internacional sin espacios ni guiones. Ejemplo:
              521234567890.
            </p>
          </div>

          <div>
            <Label>Link de pago (ej: tu link de banco / Stripe / etc.)</Label>
            <Input
              value={local.paymentLink}
              onChange={(e) =>
                setLocal({ ...local, paymentLink: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          {/* DATOS PARA TRANSFERENCIA BANCARIA */}
          <div>
            <Label>Banco / tipo de cuenta (para transferencia)</Label>
            <Input
              value={local.transferenciaBanco}
              onChange={(e) =>
                setLocal({
                  ...local,
                  transferenciaBanco: e.target.value,
                })
              }
              placeholder="Ej: BBVA - Cuenta débito"
            />
          </div>
          <div>
            <Label>Número de cuenta / tarjeta</Label>
            <Input
              value={local.transferenciaCuenta}
              onChange={(e) =>
                setLocal({
                  ...local,
                  transferenciaCuenta: e.target.value,
                })
              }
              placeholder="Ej: 1234 5678 9012 3456"
            />
          </div>
          <div>
            <Label>CLABE</Label>
            <Input
              value={local.transferenciaClabe}
              onChange={(e) =>
                setLocal({
                  ...local,
                  transferenciaClabe: e.target.value,
                })
              }
              placeholder="Ej: 012345678901234567"
            />
          </div>
          <div>
            <Label>Titular de la cuenta</Label>
            <Input
              value={local.transferenciaTitular}
              onChange={(e) =>
                setLocal({
                  ...local,
                  transferenciaTitular: e.target.value,
                })
              }
              placeholder="Nombre del titular"
            />
          </div>

          <div>
            <Label>Logo (desde archivo)</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="file" accept="image/*" onChange={handleLogoFile} />
              {local.logo && (
                <span style={{ fontSize: 11, color: "#15803d" }}>
                  ✅ Logo cargado
                </span>
              )}
            </div>
          </div>

          <div>
            <Label>Colores del tema</Label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#6b7280",
                    marginBottom: 2,
                  }}
                >
                  Primario
                </div>
                <input
                  type="color"
                  value={local.themePrimary}
                  onChange={(e) =>
                    setLocal({ ...local, themePrimary: e.target.value })
                  }
                  style={{
                    width: 36,
                    height: 24,
                    border: "none",
                    padding: 0,
                    background: "transparent",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#6b7280",
                    marginBottom: 2,
                  }}
                >
                  Secundario
                </div>
                <input
                  type="color"
                  value={local.themeSecondary}
                  onChange={(e) =>
                    setLocal({ ...local, themeSecondary: e.target.value })
                  }
                  style={{
                    width: 36,
                    height: 24,
                    border: "none",
                    padding: 0,
                    background: "transparent",
                  }}
                />
              </div>
            </div>
          </div>
        </Grid>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 10,
          }}
        >
          <button
            type="button"
            onClick={handleGuardar}
            style={{
              ...BTN,
              background: EMERALD,
              color: "#ffffff",
              borderColor: EMERALD_DARK,
              fontSize: 12,
            }}
          >
            Guardar cambios
          </button>
        </div>

        {/* 🔗 BOTONES PARA LINK Y QR */}
        <div
          style={{
            marginTop: 10,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={handleCopyMenuLink}
            style={{
              ...BTN_OUTLINE,
              fontSize: 11,
              padding: "6px 10px",
            }}
          >
            Compartir link del menú
          </button>
          <button
            type="button"
            onClick={handleOpenQrDemo}
            style={{
              ...BTN_OUTLINE,
              fontSize: 11,
              padding: "6px 10px",
            }}
          >
            Ver QR demo (rápido)
          </button>
        </div>
      </Card>

      <Card>
        <h4 style={{ marginTop: 0, marginBottom: 8 }}>
          Testimonios de clientes
        </h4>
        <Grid columns={2}>
          <div>
            <Label>Nombre del cliente</Label>
            <Input
              value={testNombre}
              onChange={(e) => setTestNombre(e.target.value)}
              placeholder="Ej: Ana, cliente frecuente"
            />
            <Label style={{ marginTop: 6 }}>Testimonio</Label>
            <TextArea
              value={testTexto}
              onChange={(e) => setTestTexto(e.target.value)}
              placeholder="Ej: Me encanta el servicio y la rapidez de este lugar..."
            />
            <button
              type="button"
              onClick={handleAddTestimonio}
              style={{
                ...BTN,
                marginTop: 8,
                background: "#0ea5e9",
                color: "#eff6ff",
                borderColor: "#0284c7",
                fontSize: 12,
              }}
            >
              Agregar testimonio
            </button>
          </div>
          <div>
            <Label>Testimonios actuales</Label>
            <div
              style={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                padding: 8,
                maxHeight: 200,
                overflowY: "auto",
              }}
            >
              {testimonios.length === 0 ? (
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                  Aún no se han agregado testimonios.
                </p>
              ) : (
                testimonios.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: 4,
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 2,
                      }}
                    >
                      {t.autor}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#4b5563",
                        marginBottom: 4,
                      }}
                    >
                      {t.texto}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTestimonio(t.id)}
                      style={{
                        ...BTN_OUTLINE,
                        fontSize: 10,
                        padding: "3px 8px",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Grid>
      </Card>
    </Container>
  );
}

// ===============================
// APP PRINCIPAL
// ===============================

function App() {
  const store = useStore();
  const { restaurantes, activeRest, tab, setTab, setActiveRest, r } = store;

  // Carrito actual del cliente (antes de ir a pagar)
  const [cart, setCart] = useState([]);
  // Platillo que se está personalizando en este momento
  const [customItem, setCustomItem] = useState(null);
  // Carrito que se manda al modal de pago
  const [checkoutCart, setCheckoutCart] = useState(null);

  const handleStartOrder = (item, shouldCustomize) => {
    if (!r) {
      alert("Primero selecciona un restaurante.");
      return;
    }

    const puedePersonalizar =
      (item.ingredientesBase && item.ingredientesBase.length) ||
      (item.extras && item.extras.length);

    // Si el cliente quiere personalizar y el platillo tiene algo que personalizar,
    // abrimos el modal de CustomizeModal y NO vamos a pagar todavía
    if (shouldCustomize && puedePersonalizar) {
      setCustomItem(item);
      return;
    }

    // Si no personaliza, sólo agregamos directo al pedido actual (cart)
    const line = {
      ...item,
      qty: 1,
      total: item.precio || 0,
      seleccionIngredientes: [], // no “Sin” nada si no personaliza
      seleccionExtras: [],
    };
    setCart((prev) => [...prev, line]);
  };

  // Cuando el cliente termina de personalizar en el modal
  const handleAddCustomized = (line) => {
    setCart((prev) => [...prev, line]);
    setCustomItem(null);
  };

  const handleRemoveCartItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Aquí recién abrimos la pantalla de pago
  const handleOpenCheckout = () => {
    if (!cart || cart.length === 0) {
      alert("Agrega al menos un platillo al pedido antes de confirmar.");
      return;
    }
    setCheckoutCart(cart);
  };

  const handleCloseCheckout = () => {
    setCheckoutCart(null);
  };

  const handleSaleRegistered = (items, metodoPago) => {
    if (!r) return;
    store.closeSale(r.id, items, metodoPago);
    alert("Venta registrada correctamente.");
    // Limpiar carrito después de registrar la venta
    setCart([]);
    setCheckoutCart(null);
  };

  // Vista inicial cuando aún no hay restaurante
  if (!r) {
    return (
      <>
        <HeaderBar titulo="Panel multi-restaurante" />
        <Container>
          <Card>
            <h3 style={{ marginTop: 0, marginBottom: 6 }}>
              Bienvenida a tu plataforma de restaurantes
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                marginTop: 0,
                marginBottom: 10,
              }}
            >
              Para comenzar, crea tu primer restaurante. Luego podrás configurar
              el menú, la vista del cliente y los reportes.
            </p>
            <button
              type="button"
              style={{
                ...BTN,
                background: EMERALD,
                color: "#ffffff",
                borderColor: EMERALD_DARK,
                fontSize: 13,
              }}
              onClick={store.addRestaurant}
            >
              + Crear mi primer restaurante
            </button>
          </Card>
        </Container>
      </>
    );
  }

  // Vista normal con pestañas
  return (
    <>
      <HeaderBar titulo="Plataforma Multi-Restaurante" />
      <RestaurantSelector
        restaurantes={restaurantes}
        activeRest={activeRest}
        setActiveRest={setActiveRest}
        addRestaurant={store.addRestaurant}
      />
      <TabsBar tab={tab} setTab={setTab} />

      {tab === "menu" && <MenuEditor r={r} store={store} />}

      {tab === "public" && (
        <Container>
          <Card>
            <PublicMenu
              r={r}
              cart={cart}
              onStartOrder={handleStartOrder}
              onOpenCheckout={handleOpenCheckout}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
            />
          </Card>
        </Container>
      )}

      {tab === "settings" && <SettingsPanel r={r} store={store} />}

      {tab === "reports" && <ReportsPanel r={r} store={store} />}

      {customItem && (
        <CustomizeModal
          item={customItem}
          onClose={() => setCustomItem(null)}
          onAdd={handleAddCustomized}
        />
      )}

      {checkoutCart && (
        <CheckoutModal
          r={r}
          cart={checkoutCart}
          onClose={handleCloseCheckout}
          onSaleRegistered={handleSaleRegistered}
        />
      )}
    </>
  );
}

export default App;



