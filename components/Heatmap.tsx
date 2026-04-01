
import React, { useMemo } from 'react';
import { DailyCheckin } from '../types';

interface HeatmapProps {
  checkins: DailyCheckin[];
  endDate?: string;
}

const Heatmap: React.FC<HeatmapProps> = ({ checkins, endDate }) => {
  const totalSlots = 84; // 12 semanas
  
  const gridData = useMemo(() => {
    // 1. Determinar la fecha de referencia local (UTC-3)
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const offset = -3; 
    const localNow = new Date(utcTime + (3600000 * offset));
    const todayStr = localNow.toISOString().split('T')[0];
    
    // 2. Encontrar la fecha del primer registro
    const sortedCheckins = [...checkins].sort((a, b) => a.date.localeCompare(b.date));
    const firstCheckinDate = sortedCheckins.length > 0 ? sortedCheckins[0].date : null;

    // 3. Calcular cuántos días han pasado desde el inicio hasta hoy
    let missedDaysCount = 0;
    if (firstCheckinDate) {
      const start = new Date(firstCheckinDate + 'T12:00:00');
      const end = new Date(todayStr + 'T12:00:00');
      const diffTime = Math.max(0, end.getTime() - start.getTime());
      const totalDaysActive = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      missedDaysCount = Math.max(0, totalDaysActive - checkins.length);
    }

    // 4. Preparar los estados de los 84 slots
    const slots: { colorClass: string }[] = [];

    // Agregar los completados
    checkins.forEach(checkin => {
      let colorClass = '';
      if (checkin.buttonType === 'emergency') {
        colorClass = 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)] scale-100 border-transparent';
      } else if (checkin.buttonType === 'twoMinutes') {
        colorClass = 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] scale-100 border-transparent';
      } else {
        colorClass = 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)] scale-100 border-transparent';
      }
      slots.push({ colorClass });
    });

    // Agregar los perdidos (Blanco)
    const actualMissed = Math.min(missedDaysCount, totalSlots - slots.length);
    for (let i = 0; i < actualMissed; i++) {
      slots.push({ colorClass: 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)] scale-100 border-transparent rounded-[2px]' });
    }

    // Rellenar el resto con "Sin Registro" (Negro)
    const remaining = totalSlots - slots.length;
    for (let i = 0; i < remaining; i++) {
      slots.push({ colorClass: 'bg-slate-900 border border-white/5 scale-[0.85] rounded-[2px]' });
    }

    // 5. Barajar aleatoriamente (Fisher-Yates)
    // Usamos un generador de números aleatorios simple para que sea estable por render si los checkins no cambian
    // Pero como está dentro de useMemo con [checkins], se mantendrá igual hasta que haya un nuevo checkin.
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    // 6. Convertir en rejilla de 12x7
    const grid = [];
    for (let col = 0; col < 12; col++) {
      const column = [];
      for (let row = 0; row < 7; row++) {
        column.push(slots[col * 7 + row]);
      }
      grid.push(column);
    }

    return grid;
  }, [checkins, endDate]);

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
