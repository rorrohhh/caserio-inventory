import React, { useState } from 'react';
import type { Item } from '../types/inventory';
import { FaHandPaper, FaTrash, FaTimes, FaGift } from 'react-icons/fa';
import { fetchNui } from '../utils/fetchNui';
import { useInventory } from '../store/useInventory'; // <--- Importamos el store

interface InfoPanelProps {
    item: Item | null;
    source: 'player' | 'secondary'; // <--- Propiedad necesaria para saber de dónde borrar
    onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ item, source, onClose }) => {
    const [amount, setAmount] = useState(1);

    // Traemos la función para borrar visualmente (Optimistic UI)
    const { deleteItemLocal } = useInventory();

    if (!item) return null;

    const totalWeight = (item.weight || 0) * item.count / 1000;

    const handleUse = () => {
        fetchNui('useItem', { item }, { success: true });
        onClose();
    };

    const handleDrop = () => {
        // 1. Enviamos petición al servidor (Lua)
        fetchNui('DropItem', {
            item: item,
            amount: amount
        }, { success: true });

        // 2. Borramos visualmente INMEDIATAMENTE (Optimistic UI)
        deleteItemLocal(source, item.slot, amount);

        // 3. Cerramos el panel
        onClose();
    };

    const handleGive = () => {
        // 1. Enviamos petición al servidor
        fetchNui('GiveItem', {
            item: item,
            amount: amount
        }, { success: true });

        // 2. Opcional: Borramos visualmente al dar
        // (Si prefieres esperar a ver si hay un jugador cerca, quita esta línea)
        deleteItemLocal(source, item.slot, amount);

        onClose();
    };

    return (
        <div className="w-64 bg-[#111] border border-white/10 rounded-md p-4 shadow-2xl flex flex-col gap-3 font-sans select-none">

            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <h2 className="text-white font-bold text-base leading-tight">{item.label}</h2>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">{item.name}</span>
                </div>
                <div className="flex flex-col items-end">
                    <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors mb-1">
                        <FaTimes size={14} />
                    </button>
                    <span className="text-zinc-400 text-[10px] font-mono">
                        {totalWeight > 0 ? `${totalWeight.toFixed(2)}kg` : '0.0kg'}
                    </span>
                </div>
            </div>

            {/* BARRA DURABILIDAD */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                    <span>Durability</span>
                    <span>100%</span>
                </div>
                <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-cyan-500 w-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="text-xs text-zinc-500 italic leading-relaxed border-b border-white/5 pb-3">
                {item.description || "Sin descripción disponible."}
            </div>

            {/* SLIDER CANTIDAD */}
            <div className="flex items-center gap-2 bg-[#080808] p-1.5 rounded border border-[#222]">
                <input
                    type="range" min="1" max={item.count} value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <input
                    type="number" min="1" max={item.count} value={amount}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1 && val <= item.count) setAmount(val);
                    }}
                    className="w-10 bg-transparent text-white text-center text-xs font-bold focus:outline-none"
                />
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="grid grid-cols-3 gap-1 mt-1">
                {/* USE */}
                <button onClick={handleUse} className="bg-zinc-200 hover:bg-white text-black font-bold py-1.5 rounded text-[10px] flex flex-col items-center justify-center gap-1 transition-colors shadow-sm">
                    <FaHandPaper size={10} /> USE
                </button>

                {/* GIVE */}
                <button onClick={handleGive} className="bg-cyan-900/40 border border-cyan-800 hover:bg-cyan-800 text-cyan-200 font-bold py-1.5 rounded text-[10px] flex flex-col items-center justify-center gap-1 transition-all">
                    <FaGift size={10} /> GIVE
                </button>

                {/* DROP */}
                <button onClick={handleDrop} className="bg-transparent border border-red-900/50 hover:bg-red-900/20 text-red-400 font-bold py-1.5 rounded text-[10px] flex flex-col items-center justify-center gap-1 transition-all">
                    <FaTrash size={10} /> DROP
                </button>
            </div>
        </div>
    );
};