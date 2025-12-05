import React from 'react';
import { Slot } from './Slot';
import type { Item } from '../types/inventory';

interface GridProps {
    items: Item[];
    type: 'player' | 'secondary';
    slots: number;
}

export const InventoryGrid: React.FC<GridProps> = ({ items, type, slots }) => {
    // Generar array de slots vacíos o llenos
    const grid = Array.from({ length: slots }).map((_, i) => {
        const item = items.find(it => it.slot === i + 1);
        return (
            <Slot
                key={`${type}-${i}`}
                id={`${type}-${i + 1}`}
                index={i + 1}
                item={item}
                type={type}
            />
        );
    });

    return (
        <div className="grid grid-cols-5 gap-1 p-4 bg-np-dark/90 rounded-lg backdrop-blur-md border border-white/5">
            {grid}
        </div>
    );
};
