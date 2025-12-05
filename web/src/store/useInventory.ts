import { create } from 'zustand';
// FIX 1: Usar 'import type' para cumplir con verbatimModuleSyntax
import type { InventoryState } from '../types/inventory';
// Asegúrate de que la ruta sea correcta. Si configuraste el alias en Fase 1.6, puedes usar '@/utils/fetchNui'
import { fetchNui } from '../utils/fetchNui';

export const useInventory = create<InventoryState>((set, get) => ({
    isOpen: true,
    playerItems: [
        { name: 'sandwich', label: 'Sándwich', count: 1, slot: 1, },
        { name: 'water', label: 'Agua', count: 5, slot: 2, },
        { name: 'phone', label: 'Teléfono', count: 1, slot: 3, },
        { name: 'weed-2kg', label: 'Weed', count: 1, slot: 4, },
    ],
    secondaryItems: [],
    maxWeight: 120000,
    currentWeight: 0,

    setInventoryData: (data) => set({
        isOpen: true,
        playerItems: data.playerItems,
        secondaryItems: data.secondaryItems,
        currentWeight: data.weight
    }),

    closeInventory: () => {
        // FIX: Pasar objeto vacío como mock para evitar error en navegador
        fetchNui('close', {}, {});
        set({ isOpen: false });
    },

    moveItem: (fromInv, fromSlot, toInv, toSlot) => {
        const state = get();

        // 1. Guardar Snapshot para Rollback (por si falla el server)
        const previousPlayerItems = [...state.playerItems];
        const previousSecondaryItems = [...state.secondaryItems];

        // Helpers para seleccionar el array correcto (clonados para no mutar estado directamente)
        const getItems = (inv: 'player' | 'secondary') =>
            inv === 'player' ? [...state.playerItems] : [...state.secondaryItems];

        const sourceItems = getItems(fromInv);
        const targetItems = fromInv === toInv ? sourceItems : getItems(toInv);

        // Encontrar índices de los items involucrados
        const sourceItemIndex = sourceItems.findIndex(i => i.slot === fromSlot);
        const targetItemIndex = targetItems.findIndex(i => i.slot === toSlot);

        if (sourceItemIndex === -1) return; // Seguridad: no existe item origen

        const sourceItem = { ...sourceItems[sourceItemIndex] };
        const targetItem = targetItemIndex !== -1 ? { ...targetItems[targetItemIndex] } : undefined;

        // --- LÓGICA DE ACTUALIZACIÓN VISUAL (Optimista) ---

        // Actualizar el slot del item que movemos
        sourceItem.slot = toSlot;

        if (targetItem) {
            // CASO: SWAP (Intercambio)
            // Si ya hay un item, le asignamos el slot del origen para intercambiar
            targetItem.slot = fromSlot;

            if (fromInv === toInv) {
                // Si es la misma grilla, intercambiamos en el mismo array
                sourceItems[sourceItemIndex] = targetItem;
                sourceItems[targetItemIndex] = sourceItem;
            } else {
                // Grillas diferentes: Cruzamos los items
                sourceItems[sourceItemIndex] = targetItem; // El del destino viene al origen
                targetItems[targetItemIndex] = sourceItem; // El del origen va al destino
            }
        } else {
            // CASO: MOVER A VACÍO
            if (fromInv === toInv) {
                // Simplemente actualizamos el objeto en el array (el slot ya cambió arriba)
                sourceItems[sourceItemIndex] = sourceItem;
            } else {
                // Mover entre inventarios: sacar de uno y meter en otro
                sourceItems.splice(sourceItemIndex, 1);
                targetItems.push(sourceItem);
            }
        }

        // Aplicar cambios visuales inmediatos
        set({
            playerItems: fromInv === 'player' ? sourceItems : (toInv === 'player' ? targetItems : state.playerItems),
            secondaryItems: fromInv === 'secondary' ? sourceItems : (toInv === 'secondary' ? targetItems : state.secondaryItems)
        });

        // 2. Enviar petición al Servidor
        // FIX 2: Tipar la respuesta esperada y AGREGAR MOCK DATA (3er argumento) para evitar CORS en dev
        fetchNui<{ success: boolean }>('moveItem', {
            fromInv, fromSlot, toInv, toSlot
        }, { success: true }).then(resp => {
            // Si el servidor responde con error, revertimos todo (Rollback)
            if (resp && resp.success === false) {
                console.error("Rollback: Server rechazó el movimiento");
                set({
                    playerItems: previousPlayerItems,
                    secondaryItems: previousSecondaryItems
                });
            }
        }).catch(() => {
            // Error de red o crash de NUI
            console.error("Error de comunicación NUI");
            set({
                playerItems: previousPlayerItems,
                secondaryItems: previousSecondaryItems
            });
        });
    }
}));