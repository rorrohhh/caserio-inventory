import React, { useEffect, useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core';
import { useInventory } from './store/useInventory';
import { Slot } from './components/Slot';
import { InfoPanel } from './components/InfoPanel';
import { FaSearch, FaUser, FaBox, FaCog } from 'react-icons/fa';
import type { Item } from './types/inventory';

const App: React.FC = () => {
  const { isOpen, playerItems, secondaryItems, moveItem, closeInventory, hideInventory, setInventoryData } = useInventory();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<Item | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  // Listener Universal (Compatible con QB Standard y Custom)
  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      // Algunos scripts mandan event.data directo, otros event.data.action
      const data = event.data;
      const action = data.action;

      // QB-Inventory original usa "open", nosotros usábamos "openInventory"
      if (action === 'openInventory' || action === 'open') {
        setInventoryData(data);
      }

      // Manejo de cierre
      if (action === 'close') {
        hideInventory();
      }

      // Soporte extra: actualización parcial (muy común en QB)
      if (action === 'updateSlot') {
        // Aquí podrías implementar lógica para actualizar un solo slot si quisieras hilar fino
        // Por ahora, si el backend es bueno, mandará toda la data de nuevo o usaremos el optimistic
      }
    };

    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, [setInventoryData, hideInventory]);

  // Escuchar tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && (e.key === 'Escape' || e.key === 'Tab')) {
        closeInventory();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeInventory]);

  const handleDragStart = (event: any) => setActiveDragItem(event.active.data.current.item);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over) return;
    const activeData = active.data.current as any;
    const overData = over.data.current as any;

    // Evitar movimientos al mismo slot
    if (activeData && overData && (activeData.index !== overData.index || activeData.type !== overData.type)) {
      moveItem(activeData.type, activeData.index, overData.type, overData.index);
    }
  };

  if (!isOpen) return null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen w-screen flex items-end justify-end pr-10 pb-10 bg-black/60 font-sans">

        {/* PANEL PRINCIPAL */}
        <div className="flex flex-col gap-3 w-[440px]">

          {/* CABECERA */}
          <div className="flex justify-between items-center bg-[#151515] p-3 rounded-lg border border-white/5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-[#2a2a2a] px-3 py-1 rounded text-xs font-bold text-gray-300 tracking-wide border border-white/5">
                ID: 154
              </div>
              <div className="h-4 w-[1px] bg-white/10"></div>
              <span className="text-sm font-bold text-white tracking-wider">INVENTORY</span>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors p-2 bg-[#2a2a2a] rounded hover:bg-[#333]">
              <FaCog size={14} />
            </button>
          </div>

          {/* CONTENEDOR */}
          <div className="bg-[#151515] p-4 rounded-xl border border-white/5 shadow-2xl relative">

            {selectedItem && (
              <div className="absolute inset-x-4 top-4 z-50 animate-in fade-in zoom-in duration-200">
                <InfoPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
              </div>
            )}

            {/* SECCIÓN JUGADOR */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <FaUser className="text-zinc-500" size={10} />
                  <span className="text-zinc-400 font-bold">PLAYER STORAGE</span>
                </div>
                <span className="text-zinc-500 font-mono">
                  {/* Calculo de peso seguro (si metadata no existe usa 0) */}
                  {(playerItems.reduce((acc, item) => acc + (item.count * (item.weight || item.metadata?.weight || 0)), 0) / 1000).toFixed(1)}kg / 40kg
                </span>
              </div>

              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg py-2 pl-3 pr-10 text-sm text-gray-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <div className="absolute right-2 top-2 text-zinc-600">
                  <FaSearch size={12} />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {Array.from({ length: 40 }).map((_, i) => {
                  const item = playerItems.find(it => it.slot === i + 1);
                  return (
                    <Slot
                      key={`player-${i}`}
                      id={`player-${i + 1}`}
                      index={i + 1}
                      type="player"
                      item={item}
                      isSelected={selectedItem?.slot === item?.slot && selectedItem?.name === item?.name}
                      onClick={() => setSelectedItem(item || null)}
                    />
                  );
                })}
              </div>
            </div>

            <div className="h-[1px] w-full bg-[#333] my-3"></div>

            {/* SECCIÓN SECUNDARIA (Maletero / Guantera / Drops) */}
            <div>
              <div className="flex justify-between items-center mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <FaBox className="text-zinc-500" size={10} />
                  <span className="text-zinc-400 font-bold uppercase">External</span>
                </div>
                <div className="w-20 h-1.5 bg-[#0a0a0a] rounded overflow-hidden">
                  <div className="h-full bg-zinc-500 w-[70%]"></div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {/* Mostramos 20 slots o más si hay items en slots altos */}
                {Array.from({ length: Math.max(20, ...secondaryItems.map(i => i.slot)) }).map((_, i) => {
                  const item = secondaryItems.find(it => it.slot === i + 1);
                  return <Slot key={`sec-${i}`} id={`secondary-${i + 1}`} index={i + 1} type="secondary" item={item} />;
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      <DragOverlay>
        {activeDragItem ? (
          <div className="w-16 h-16 bg-[#2a2a2a] border border-zinc-500 rounded-lg flex items-center justify-center shadow-2xl cursor-grabbing">
            <img src={activeDragItem.image || `./img/icons/${activeDragItem.name}.png`} className="w-12 h-12 object-contain" alt="" />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default App;