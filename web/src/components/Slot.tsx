import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Item } from '../types/inventory';
import clsx from 'clsx';

interface SlotProps {
    id: string;
    index: number;
    item?: Item;
    type: 'player' | 'secondary';
    isSelected?: boolean;
    onClick?: () => void;
    onRightClick?: () => void;
}

export const Slot: React.FC<SlotProps> = ({ id, index, item, type, isSelected, onClick, onRightClick }) => {

    // --- ÍNDICE LÓGICO ---
    // 'index' es 0, 1, 2 (para visuales CSS y Hotbar).
    // 'slotNumber' es 1, 2, 3 (para la lógica de la base de datos).
    const slotNumber = index + 1;

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: id,
        data: { index: slotNumber, type, item }
    });

    const { attributes, listeners, setNodeRef: setDragRef, isDragging, transform } = useDraggable({
        id: item ? `drag-${type}-${index}` : `empty-${type}-${index}`,
        data: { index: slotNumber, type, item },
        disabled: !item
    });

    // Estilo para mover el item (z-index alto para que flote sobre todo)
    const style = transform ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 9999,
    } : undefined;

    // Visualmente usamos el index original (0-based) para saber si es < 5
    const isHotbar = type === 'player' && index < 5;

    // --- FUNCIÓN DE CLICK DERECHO ROBUSTA ---
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // console.log(`[Slot] Click derecho en slot ${slotNumber}`, item); // Debug opcional

        if (item && onRightClick) {
            onRightClick();
        }
    };

    return (
        <div
            ref={setDropRef}
            onContextMenu={handleContextMenu}
            onClick={!isDragging ? onClick : undefined}
            className={clsx(
                "group relative w-full aspect-square rounded-md transition-colors duration-200 ease-out",
                "flex items-center justify-center select-none overflow-visible",

                // Estilos visuales
                isOver && !isDragging ? "bg-white/10 border border-white/40 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]" :
                    isSelected && item ? "bg-[#1e293b] border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.15)]" :
                        item ? "bg-[#1a1a1a] border border-white/5 hover:border-white/20 hover:bg-[#222]" :
                            "bg-black/20 border border-white/5 hover:bg-white/5"
            )}
        >
            {/* Número de Slot Visual (index + 1) */}
            <span className={clsx(
                "absolute top-1 left-1.5 text-[10px] font-bold z-0 pointer-events-none",
                isHotbar ? "text-zinc-500 group-hover:text-zinc-300" : "text-zinc-700 group-hover:text-zinc-600"
            )}>
                {index + 1}
            </span>

            {/* Barra Hotbar */}
            {isHotbar && (
                <div className={clsx("absolute top-0 left-0 w-full h-[2px] transition-colors", isSelected ? "bg-cyan-500" : "bg-transparent")} />
            )}

            {/* Item Draggable */}
            {item && (
                <div
                    ref={setDragRef}
                    style={style}
                    {...listeners}
                    {...attributes}
                    onContextMenu={handleContextMenu}
                    className={clsx(
                        "w-full h-full p-2 relative z-10 cursor-grab active:cursor-grabbing flex items-center justify-center touch-none",
                        isDragging ? "opacity-0" : "opacity-100"
                    )}
                >
                    <img
                        // --- CORRECCIÓN FINAL: AGREGA EL PUNTO AL INICIO ---
                        // De: src={`/images/...`}  ->  A: src={`./images/...`}
                        src={item.image || `./images/${item.name.toLowerCase()}.png`}

                        onError={(e) => {
                            // Si falla, bajamos opacidad pero no ocultamos para que veas si carga algo
                            e.currentTarget.style.opacity = '0.5';
                            console.warn('Fallo ruta:', e.currentTarget.src);
                        }}

                        className={clsx(
                            "w-full h-full object-contain filter drop-shadow-md pointer-events-none transition-transform duration-200 group-hover:scale-110",
                            !isDragging && "opacity-100"
                        )}
                        alt={item.label}
                    />
                    {item.count > 1 && (
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 border border-white/10 backdrop-blur-sm rounded-sm text-[9px] font-bold text-zinc-300 pointer-events-none">
                            {item.count}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};