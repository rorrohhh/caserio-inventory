import { create } from 'zustand';
import type { InventoryState, Item } from '../types/inventory';
import { fetchNui } from '../utils/fetchNui';

// Helper para convertir el formato de QBCore (Objeto) a Array para React
const formatItems = (itemsObj: any): Item[] => {
    if (!itemsObj) return [];
    if (Array.isArray(itemsObj)) return itemsObj; // Ya es array (formato nuevo)

    // Si es objeto {1: {name:x}, 2: {name:y}}, lo convertimos a array preservando slots
    return Object.values(itemsObj).map((item: any) => ({
        ...item,
        // Aseguramos que count exista (a veces viene como amount)
        count: item.amount || item.count || 1,
        // Aseguramos etiqueta
        label: item.label || item.name
    }));
};

export const useInventory = create<InventoryState>((set, get) => ({
    isOpen: false,
    playerItems: [],
    secondaryItems: [],
    maxWeight: 0,
    currentWeight: 0,

    setInventoryData: (data) => {
        console.log('[React] Recibiendo datos de Lua:', data);

        // Detectar si viene del formato standard qb-inventory o del nuestro
        // qb-inventory usa 'inventory' y 'other', nosotros usamos 'playerItems'
        const playerItems = data.playerItems || formatItems(data.inventory);
        const secondaryItems = data.secondaryItems || formatItems(data.other);

        set({
            isOpen: true,
            playerItems: playerItems,
            secondaryItems: secondaryItems,
            currentWeight: data.weight || 0,
            maxWeight: data.maxWeight || 120000
        });
    },

    closeInventory: () => {
        fetchNui('close', {}, {});
        set({ isOpen: false });
    },

    hideInventory: () => {
        set({ isOpen: false });
    },

    moveItem: (fromInv, fromSlot, toInv, toSlot) => {
        const state = get();
        // 1. Snapshot para Rollback
        const previousPlayerItems = [...state.playerItems];
        const previousSecondaryItems = [...state.secondaryItems];

        // Helpers
        const getItems = (inv: 'player' | 'secondary') =>
            inv === 'player' ? [...state.playerItems] : [...state.secondaryItems];

        const sourceItems = getItems(fromInv);
        const targetItems = fromInv === toInv ? sourceItems : getItems(toInv);

        // Indices
        const sourceItemIndex = sourceItems.findIndex(i => i.slot === fromSlot);
        const targetItemIndex = targetItems.findIndex(i => i.slot === toSlot);

        if (sourceItemIndex === -1) return;

        const sourceItem = { ...sourceItems[sourceItemIndex] };
        const targetItem = targetItemIndex !== -1 ? { ...targetItems[targetItemIndex] } : undefined;

        // --- LÓGICA OPTIMISTA ---
        sourceItem.slot = toSlot;

        if (targetItem) {
            targetItem.slot = fromSlot;
            sourceItems[sourceItemIndex] = targetItem;

            if (fromInv === toInv) {
                sourceItems[targetItemIndex] = sourceItem;
            } else {
                targetItems[targetItemIndex] = sourceItem;
            }
        } else {
            if (fromInv === toInv) {
                sourceItems[sourceItemIndex] = sourceItem;
            } else {
                sourceItems.splice(sourceItemIndex, 1);
                targetItems.push(sourceItem);
            }
        }

        set({
            playerItems: fromInv === 'player' ? sourceItems : (toInv === 'player' ? targetItems : state.playerItems),
            secondaryItems: fromInv === 'secondary' ? sourceItems : (toInv === 'secondary' ? targetItems : state.secondaryItems)
        });

        // NOTA IMPORTANTE:
        // Si usas el backend original de QB, es posible que el evento no se llame 'moveItem'.
        // Podría llamarse 'CombineItem', 'SwitchItem' o necesitar que agregues el evento
        // 'moveItem' en el lua original (client/main.lua).
        // Por ahora mantenemos 'moveItem' asumiendo que agregarás ese pequeño evento al Lua oficial.
        fetchNui<{ success: boolean }>('moveItem', {
            fromInv, fromSlot, toInv, toSlot,
            // Datos extra que a veces pide QB original
            fromAmount: sourceItem.count,
        }, { success: true }).catch(() => {
            console.error("Rollback: Error de comunicación");
            set({ playerItems: previousPlayerItems, secondaryItems: previousSecondaryItems });
        });
    }
}));