export interface Item {
    name: string;
    label: string;
    count: number;
    slot: number;
    image?: string;
    metadata?: {
        durability?: number;
        serial?: string;
        description?: string;
        weight?: number;
    }
}

export interface InventoryState {
    isOpen: boolean;
    playerItems: Item[];
    secondaryItems: Item[];
    maxWeight: number;
    currentWeight: number;

    //Acciones

    setInventoryData: (data: any) => void;
    moveItem: (fromInv: 'player' | 'secondary', fromSlot: number, toInv: 'player' | 'secondary', toSlot: number) => void;
    closeInventory: () => void;
}




