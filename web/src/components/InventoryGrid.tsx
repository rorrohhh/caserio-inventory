import React, { useState } from 'react';
import type { Item } from '../types/inventory';
import { FaHandPaper, FaTrash, FaTimes, FaCube, FaWeightHanging } from 'react-icons/fa';
import { fetchNui } from '../utils/fetchNui';

interface InfoPanelProps {
    item: Item | null;
    onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ item, onClose }) => {
    const [amount, setAmount] = useState(1);

    if (!item) return null;

    const handleUse = () => fetchNui('useItem', { item });

    const handleDrop = () => {
        fetchNui('DropItem', {
            item: item,
            amount: amount
        });
        onClose();
    };

    // Calculamos peso total para mostrar
    const totalWeight = ((item.weight || 0) * amount / 1000).toFixed(2);

    return (
        <div className="absolute left-[-280px] top-0 w-[270px] bg-[#111] border border-white/5 rounded-md shadow-2xl p-4 flex flex-col gap-4 font-sans animate-in fade-in slide-in-from-right-4 duration-200 z-50">

            {/* --- HEADER & CLOSE --- */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-white font-bold text-lg tracking-wide">{item.label}</h2>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-white/5">
                        {item.name}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="text-zinc-600 hover:text-white transition-colors p-1"
                >
                    <FaTimes size={14} />
                </button>
            </div>

            {/* --- PREVIEW IMAGEN GRANDE --- */}
            <div className="w-full h-32 bg-[#0a0a0a] rounded border border-[#222] flex items-center justify-center relative overflow-hidden group">
                {/* Luz de fondo sutil */}
                <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent opacity-50"></div>

                <img
                    src={item.image || `./img/icons/${item.name}.png`}
                    alt={item.label}
                    className="w-24 h-24 object-contain drop-shadow-xl z-10 transition-transform duration-300 group-hover:scale-110"
                />
            </div>

            {/* --- METADATA (PESO / CANTIDAD) --- */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#1a1a1a] p-2 rounded border border-white/5 flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase font-bold">
                        <FaCube /> <span>Stack</span>
                    </div>
                    <span className="text-white font-mono text-sm">{item.count}</span>
                </div>
                <div className="bg-[#1a1a1a] p-2 rounded border border-white/5 flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase font-bold">
                        <FaWeightHanging /> <span>Weight</span>
                    </div>
                    <span className="text-zinc-300 font-mono text-sm">{totalWeight}kg</span>
                </div>
            </div>

            {/* --- DESCRIPCIÓN --- */}
            <div className="bg-[#1a1a1a] p-3 rounded border border-white/5 min-h-[60px]">
                <p className="text-zinc-400 text-xs leading-relaxed italic">
                    {item.description || "No description available for this item."}
                </p>
            </div>

            {/* --- CONTROLES DE CANTIDAD --- */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-zinc-500 font-bold uppercase">
                    <span>Quantity</span>
                    <span className="text-white">{amount}</span>
                </div>

                <div className="flex items-center gap-3 bg-[#0f0f0f] p-2 rounded border border-[#222]">
                    <input
                        type="range"
                        min="1"
                        max={item.count}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-600 hover:accent-cyan-500"
                    />
                    <input
                        type="number"
                        min="1"
                        max={item.count}
                        value={amount}
                        onChange={(e) => {
                            const val = Math.min(Math.max(1, Number(e.target.value)), item.count);
                            setAmount(val);
                        }}
                        className="w-12 bg-transparent text-white text-right text-xs font-mono font-bold outline-none border-none focus:ring-0"
                    />
                </div>
            </div>

            {/* --- BOTONES DE ACCIÓN --- */}
            <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                    onClick={handleUse}
                    className="bg-[#222] border border-zinc-600 text-zinc-300 hover:text-white hover:bg-cyan-900/40 hover:border-cyan-500/50 py-2 rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
                >
                    <FaHandPaper size={10} /> Use
                </button>

                <button
                    onClick={handleDrop}
                    className="bg-[#222] border border-zinc-600 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 hover:border-red-500/50 py-2 rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
                >
                    <FaTrash size={10} /> Drop
                </button>
            </div>
        </div>
    );
};