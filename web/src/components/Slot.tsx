import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { Item } from '../types/inventory';
import clsx from 'clsx';

interface SlotProps {
    id: string;
    index: number;
    item?: Item;
    type: 'player' | 'secondary';
    isSelected?: boolean;
    onClick?: () => void;
    // NUEVO: Prop para manejar el "Usar Item"
    onRightClick?: () => void;
}

export const Slot: React.FC<SlotProps> = ({ id, index, item, type, isSelected, onClick, onRightClick }) => {
    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: id,
        data: { index, type, item }
    });

    const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
        id: `drag-${id}-${index}`,
        data: { index, type, item },
        disabled: !item
    });

    const isHotbar = type === 'player' && index <= 5;

    // Manejador para el click derecho (Usar item)
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Evita que salga el menú del navegador
        if (!isDragging && item && onRightClick) {
            onRightClick();
        }
    };

    return (
        <div
            ref={setDropRef}
            onClick={!isDragging ? onClick : undefined}
            onContextMenu={handleContextMenu} // Añadido evento nativo
            // ESTILO CHAT: Aspecto de botón de interfaz, fondo oscuro sólido
            className={clsx(
                "relative w-full aspect-square rounded-lg transition-all duration-150",
                "flex items-center justify-center select-none overflow-hidden",

                // LÓGICA DE COLORES
                // Seleccionado: Borde claro sólido (estilo selección de color)
                isSelected && item ? "bg-[#2a2a2a] border-2 border-zinc-400" :

                    // Drag Over: Gris más claro
                    isOver ? "bg-[#333] border-2 border-zinc-600" :

                        // Normal (con item): Fondo 'card' sutil
                        item ? "bg-[#202020] border border-white/5 hover:bg-[#2a2a2a]" :

                            // Vacío: Muy oscuro, 'socket' vacío
                            "bg-[#0f0f0f] border border-[#222] hover:border-[#333]"
            )}
        >
            {/* Indicador Hotbar (Tag pequeño en esquina, estilo chat) */}
            {isHotbar && !item && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
            )}

            {/* Número de Slot (Tipografía limpia) - AHORA TOTALMENTE BLANCA */}
            <span className={clsx(
                "absolute top-1.5 left-2 text-[10px] font-medium text-white",
                // Eliminamos la distinción de color anterior para que siempre sea blanco
            )}>
                {index}
            </span>

            {/* Item */}
            {item && (
                <div
                    ref={setDragRef}
                    {...listeners}
                    {...attributes}
                    className={clsx(
                        "w-full h-full p-2.5 relative z-10 cursor-grab active:cursor-grabbing flex items-center justify-center",
                        isDragging ? "opacity-0" : "opacity-100"
                    )}
                >
                    <img
                        src={item.image || `./img/icons/${item.name}.png`}
                        // NUEVO: Si la imagen falla, usamos una por defecto o ocultamos el error
                        onError={(e) => {
                            // Opción A: Poner una imagen placeholder si tienes una
                            // e.currentTarget.src = './img/icons/default.png'; 
                            // Opción B: Ocultar la imagen rota (para que no se vea feo)
                            e.currentTarget.style.opacity = '0.5';
                        }}
                        className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
                        alt={item.label}
                    />

                    {/* Contador cantidad (Tag estilo 'POLICIA'/'OOC' del chat) */}
                    {item.count > 1 && (
                        <div className="absolute bottom-1 right-1 bg-[#151515] border border-white/10 text-white text-[9px] font-bold px-1.5 rounded shadow-sm">
                            x{item.count}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};