export interface Item {
    name: string;
    label: string;
    count: number;
    slot: number;
    image?: string;
    weight?: number; // <--- AGREGADO: Esto soluciona el error en App.tsx
    metadata?: {
        durability?: number;
        serial?: string;
        description?: string;
        weight?: number;
        [key: string]: any; // Permitir otras propiedades dinámicas
    };
    description?: string;
}

export interface InventoryState {
    isOpen: boolean;
    playerItems: Item[];
    secondaryItems: Item[];
    maxWeight: number;
    currentWeight: number;

    // Actions
    setInventoryData: (data: any) => void;
    closeInventory: () => void; // Cierre iniciado por el Usuario (Manda fetchNui)
    hideInventory: () => void;  // Cierre iniciado por Lua (Solo oculta visualmente)
    moveItem: (
        fromInv: 'player' | 'secondary',
        fromSlot: number,
        toInv: 'player' | 'secondary',
        toSlot: number
    ) => void;
}