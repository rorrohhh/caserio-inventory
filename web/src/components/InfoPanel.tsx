import React, { useState } from 'react';
import type { Item } from '../types/inventory';
import { FaHandPaper, FaTrash, FaTimes } from 'react-icons/fa'; // Agregado FaTimes
import { fetchNui } from '../utils/fetchNui';

interface InfoPanelProps {
    item: Item | null;
    onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ item, onClose }) => {
    const [amount, setAmount] = useState(1);

    if (!item) return null;

    const handleUse = () => fetchNui('useItem', { item });
    const handleDrop = () => fetchNui('dropItem', { item, amount });

    return (
        <div className="absolute left-[-260px] top-0 w-60 bg-np-bg border border-np-border rounded-xl p-4 shadow-2xl z-50 animate-fade-in">

            {/* Header con botón cerrar */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-white font-bold text-lg">{item.label}</h2>
                    <span className="text-gray-500 text-xs uppercase font-bold">{item.name}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <FaTimes />
                    </button>
                    <span className="text-gray-400 text-xs">
                        {(item.metadata?.weight || 0.5) * item.count}kg
                    </span>
                </div>
            </div>

            {/* Durabilidad */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Durability</span>
                    <span>{item.metadata?.durability || 100}%</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-np-yellow transition-all duration-300"
                        style={{ width: `${item.metadata?.durability || 100}%` }}
                    />
                </div>
            </div>

            <p className="text-gray-400 text-xs mb-4 italic">
                {item.metadata?.description || "Sin descripción disponible."}
            </p>

            {/* Input Cantidad */}
            <div className="flex items-center bg-np-panel rounded mb-3 border border-np-border">
                <input
                    type="range"
                    min="1"
                    max={item.count}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mx-2 accent-np-yellow"
                />
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-12 bg-transparent text-white text-center text-sm font-bold p-1 outline-none"
                />
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={handleUse}
                    className="bg-np-text text-black font-bold py-2 rounded flex items-center justify-center gap-2 hover:bg-white transition-colors"
                >
                    <FaHandPaper size={12} /> USE
                </button>
                <button
                    onClick={handleDrop}
                    className="bg-transparent border border-gray-600 text-gray-300 font-bold py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                >
                    <FaTrash size={12} /> DROP
                </button>
            </div>
        </div>
    );
};
