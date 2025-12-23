import { create } from 'zustand';
import type { InventoryState, Item } from '../types/inventory';
import { fetchNui } from '../utils/fetchNui';

const formatItems = (itemsObj: any): Item[] => {
    if (!itemsObj) return [];

    const itemsArray = Array.isArray(itemsObj) ? itemsObj : Object.values(itemsObj);

    return itemsArray.map((item: any) => {
        const rawName = item.name || item.item || 'unknown';

        return {
            ...item,
            name: rawName.toLowerCase(),
            count: item.amount || item.count || 1,
            label: item.label || rawName,
            slot: Number(item.slot)
        };
    });
};

export const useInventory = create<InventoryState>((set, get) => ({
    isOpen: false,
    playerItems: [],
    secondaryItems: [],
    maxWeight: 0,
    currentWeight: 0,
    hasSecondary: false,
    secondaryLabel: '',
    secondaryId: null,
    activeItem: null,

    setActiveItem: (item) => set({ activeItem: item }),

    setInventoryData: (data) => {
        console.log('[React] Datos:', JSON.stringify(data, null, 2));

        const playerItems = data.playerItems || formatItems(data.inventory);
        const hasSecondary = !!data.other;

        const secondaryId = hasSecondary ? (data.other.name || 'secondary') : null;

        const secondaryItems = hasSecondary ? (data.secondaryItems || formatItems(data.other.inventory || data.other)) : [];
        const secondaryLabel = hasSecondary ? (data.other.label || 'External') : '';

        set({
            isOpen: true,
            playerItems: playerItems,
            secondaryItems: secondaryItems,
            currentWeight: data.weight || 0,
            maxWeight: data.maxWeight || 120000,
            hasSecondary: hasSecondary,
            secondaryLabel: secondaryLabel,
            secondaryId: secondaryId
        });
    },

    closeInventory: () => {
        const { secondaryId } = get();
        fetchNui('CloseInventory', { name: secondaryId || 'player' }, {});
        set({ isOpen: false, activeItem: null, secondaryId: null });
    },

    hideInventory: () => {
        set({ isOpen: false, activeItem: null });
    },

    moveItem: (fromInv, fromSlot, toInv, toSlot) => {
        const state = get();
        const previousPlayerItems = [...state.playerItems];
        const previousSecondaryItems = [...state.secondaryItems];

        const getItems = (inv: 'player' | 'secondary') =>
            inv === 'player' ? [...state.playerItems] : [...state.secondaryItems];

        const sourceItems = getItems(fromInv);
        const targetItems = fromInv === toInv ? sourceItems : getItems(toInv);
        const sourceItemIndex = sourceItems.findIndex(i => i.slot === fromSlot);
        const targetItemIndex = targetItems.findIndex(i => i.slot === toSlot);

        if (sourceItemIndex === -1) return;

        const sourceItem = { ...sourceItems[sourceItemIndex] };
        const targetItem = targetItemIndex !== -1 ? { ...targetItems[targetItemIndex] } : undefined;

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

        const realFromInv = fromInv === 'player' ? 'player' : state.secondaryId;
        const realToInv = toInv === 'player' ? 'player' : state.secondaryId;

        fetchNui('SetInventoryData', {
            fromInventory: realFromInv,
            toInventory: realToInv,
            fromSlot,
            toSlot,
            fromAmount: sourceItem.count,
            toAmount: 0
        }, { success: true }).catch(() => {
            console.error("Rollback");
            set({ playerItems: previousPlayerItems, secondaryItems: previousSecondaryItems });
        });
    },

    deleteItemLocal: (inventory, slot, amount) => {
        const state = get();
        const isPlayer = inventory === 'player';
        const items = isPlayer ? [...state.playerItems] : [...state.secondaryItems];

        const itemIndex = items.findIndex(i => i.slot === slot);
        if (itemIndex === -1) return;

        const item = items[itemIndex];

        if (amount >= item.count) {
            items.splice(itemIndex, 1);
        } else {
            items[itemIndex] = { ...item, count: item.count - amount };
        }

        if (isPlayer) {
            set({ playerItems: items });
        } else {
            set({ secondaryItems: items });
        }
    }
}));