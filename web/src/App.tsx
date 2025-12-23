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
import clsx from 'clsx';

// Definimos un tipo para saber de dónde viene el item seleccionado
type Selection = {
  item: Item;
  source: 'player' | 'secondary';
};

const App: React.FC = () => {
  const {
    isOpen,
    playerItems,
    secondaryItems,
    hasSecondary,
    secondaryLabel,
    moveItem,
    closeInventory,
    hideInventory,
    setInventoryData
  } = useInventory();

  // CAMBIO: Ahora guardamos el objeto Selection en lugar de solo Item
  const [selection, setSelection] = useState<Selection | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<Item | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const data = event.data;
      if (data.action === 'openInventory' || data.action === 'open') setInventoryData(data);
      if (data.action === 'close') hideInventory();
    };
    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, [setInventoryData, hideInventory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && (e.key === 'Escape' || e.key === 'Tab')) closeInventory();
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

    if (activeData && overData && (activeData.index !== overData.index || activeData.type !== overData.type)) {
      moveItem(activeData.type, activeData.index, overData.type, overData.index);
    }
  };

  const calculateWeight = (items: Item[]) => {
    return items.reduce((acc, item) => {
      const weight = Number(item.weight) || Number(item.metadata?.weight) || 0;
      return acc + (item.count * weight);
    }, 0) / 1000;
  };

  if (!isOpen) return null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} autoScroll={false}>

      <div className="fixed bottom-10 right-10 z-50 font-sans select-none">

        <div className="flex flex-col gap-3 w-[420px]">

          {/* CABECERA */}
          <div className="flex justify-between items-center bg-[#111] p-3 rounded-md border border-white/5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-[#222] px-3 py-1 rounded text-xs font-bold text-zinc-400 border border-white/5">
                ID: 154
              </div>
              <div className="h-4 w-[1px] bg-white/10"></div>
              <span className="text-sm font-bold text-white tracking-wider">INVENTORY</span>
            </div>
            <button className="text-zinc-500 hover:text-white transition-colors">
              <FaCog size={14} />
            </button>
          </div>

          {/* CUERPO DEL INVENTARIO */}
          <div className="bg-[#111] rounded-md border border-white/5 shadow-2xl relative flex flex-col overflow-visible">

            {/* PANEL FLOTANTE */}
            {selection && (
              <div className="absolute right-[105%] top-0 z-50 animate-in fade-in slide-in-from-right-4 duration-200">
                <InfoPanel
                  item={selection.item}
                  source={selection.source} // Pasamos el origen para poder borrarlo visualmente
                  onClose={() => setSelection(null)}
                />
              </div>
            )}

            {/* BARRA SUPERIOR */}
            <div className="p-4 pb-2 flex flex-col gap-3 bg-[#111]">
              <div className="flex justify-between items-center text-xs font-bold tracking-wide text-zinc-500">
                <div className="flex items-center gap-2">
                  <FaUser size={10} />
                  <span>PLAYER STORAGE</span>
                </div>
                <span className="font-mono text-zinc-400">
                  {calculateWeight(playerItems).toFixed(1)}kg / 40kg
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-[#080808] border border-[#222] rounded-md py-2 pl-3 pr-8 text-xs text-gray-300 focus:outline-none focus:border-zinc-600 transition-colors"
                />
                <div className="absolute right-3 top-2.5 text-zinc-600">
                  <FaSearch size={10} />
                </div>
              </div>
            </div>

            {/* GRILLA JUGADOR */}
            <div className="p-3">
              <div className={clsx(
                "grid grid-cols-5 gap-1 p-1 pr-3 auto-rows-max overflow-y-auto custom-scrollbar",
                hasSecondary ? "h-[235px]" : "h-[310px]"
              )}>
                {Array.from({ length: 40 }).map((_, i) => {
                  const item = playerItems.find(it => it.slot === i + 1);
                  return (
                    <Slot
                      key={`player-${i}`}
                      id={`player-${i + 1}`}
                      index={i}
                      type="player"
                      item={item}
                      isSelected={selection?.item.slot === item?.slot && selection?.item.name === item?.name && selection?.source === 'player'}
                      onClick={() => setSelection(null)}
                      onRightClick={() => {
                        if (item) setSelection({ item, source: 'player' });
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN SECUNDARIA */}
            {hasSecondary && (
              <>
                <div className="h-[1px] w-full bg-[#222] mx-auto w-[92%]"></div>
                <div className="p-4 pt-2 flex flex-col gap-2 bg-[#111]">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-500 mt-1">
                    <div className="flex items-center gap-2">
                      <FaBox size={10} />
                      <span className="uppercase">{secondaryLabel}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-1 p-1 pr-3 auto-rows-max overflow-y-auto custom-scrollbar h-[230px]">
                    {Array.from({ length: Math.max(20, ...secondaryItems.map(i => i.slot)) }).map((_, i) => {
                      const item = secondaryItems.find(it => it.slot === i + 1);
                      return (
                        <Slot
                          key={`sec-${i}`}
                          id={`secondary-${i + 1}`}
                          index={i}
                          type="secondary"
                          item={item}
                          onRightClick={() => {
                            if (item) setSelection({ item, source: 'secondary' });
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      <DragOverlay>
        {activeDragItem ? (
          <div className="w-16 h-16 bg-[#1f1f1f] border border-zinc-500 rounded-md flex items-center justify-center shadow-2xl cursor-grabbing pointer-events-none z-[100]">
            {/* CORRECCIÓN: Ruta absoluta y minúsculas para el icono fantasma */}
            <img
              src={`./images/${activeDragItem.name.toLowerCase()}.png`}
              className="w-12 h-12 object-contain"
              alt=""
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default App;