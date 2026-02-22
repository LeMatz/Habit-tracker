
import React, { useMemo } from 'react';
import { DailyCheckin } from '../types';

interface HeatmapProps {
  checkins: DailyCheckin[];
}

const Heatmap: React.FC<HeatmapProps> = ({ checkins }) => {
  const totalSlots = 84; // 12 columnas * 7 filas (Matriz de 12x7)
  
  const gridData = useMemo(() => {
    // 1. Crear una rejilla vacía inicializada con slots inactivos mucho más visibles
    // Usamos bg-slate-800/50 y un borde sutil para que parezcan "sockets" vacíos
    const grid = Array.from({ length: 12 }, () => 
      Array(7).fill({ colorClass: 'bg-slate-800/40 border border-white/5 scale-[0.85]' })
    );

    if (checkins.length === 0) return grid;

    // 2. Generar todos los índices posibles (0 a 83) y barajarlos aleatoriamente
    const availableIndices = Array.from({ length: totalSlots }, (_, i) => i);
    const shuffledIndices = availableIndices.sort(() => Math.random() - 0.5);

    // 3. Tomar los check-ins y asignarlos a las posiciones aleatorias barajadas
    checkins.slice(-totalSlots).forEach((checkin, index) => {
      const slotIndex = shuffledIndices[index];
      const col = Math.floor(slotIndex / 7);
      const row = slotIndex % 7;

      let colorClass = 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]'; // Completo
      if (checkin.buttonType === 'emergency') {
        colorClass = 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]';
      } else if (checkin.buttonType === 'twoMinutes') {
        colorClass = 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]';
      }

      grid[col][row] = { colorClass: `${colorClass} scale-100 border-transparent` };
    });

    return grid;
  }, [checkins]);

  return (
    <div className="flex space-x-1.5 overflow-x-auto no-scrollbar p-6 bg-slate-950/60 rounded-[2.5rem] border border-white/5 shadow-inner justify-center mb-2">
      {gridData.map((week, wi) => (
        <div key={wi} className="flex flex-col space-y-1.5 shrink-0">
          {week.map((day, di) => (
            <div
              key={`${wi}-${di}`}
              className={`w-4 h-4 rounded-[2px] transition-all duration-1000 ease-out ${
                day.colorClass
              }`}
              style={{ 
                transitionDelay: `${(wi * 7 + di) * 5}ms` 
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Heatmap;
