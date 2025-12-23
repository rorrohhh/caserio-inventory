export interface Item {
    name: string;
    label: string;
    count: number;
    slot: number;
    image?: string;
    weight?: number;
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

    hasSecondary: boolean;
    secondaryLabel: string;

    // --- NUEVA PROPIEDAD AGREGADA ---
    secondaryId: string | null;
    // --------------------------------

    activeItem: Item | null;
    deleteItemLocal: (inventory: 'player' | 'secondary', slot: number, amount: number) => void;
    setActiveItem: (item: Item | null) => void;


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