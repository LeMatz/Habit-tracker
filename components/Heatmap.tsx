
import React, { useMemo } from 'react';
import { DailyCheckin } from '../types';

interface HeatmapProps {
  checkins: DailyCheckin[];
}

const Heatmap: React.FC<HeatmapProps> = ({ checkins }) => {
  const totalSlots = 84; // 12 columns * 7 rows
  
  const gridData = useMemo(() => {
    // Generate stable random indices
    const indices = Array.from({ length: totalSlots }, (_, i) => i);
    const seededShuffle = (array: number[]) => {
      let m = array.length, t, i;
      while (m) {
        i = Math.floor(Math.abs(Math.sin(m)) * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }
      return array;
    };
    const shuffled = seededShuffle([...indices]);

    const grid = Array.from({ length: 12 }, () => Array(7).fill(null));
    
    // Map each checkin to a shuffled index
    checkins.forEach((checkin, idx) => {
      if (idx < totalSlots) {
        const slotIdx = shuffled[idx];
        const col = Math.floor(slotIdx / 7);
        const row = slotIdx % 7;
        
        let colorClass = 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'; // Complete
        if (checkin.buttonType === 'emergency') colorClass = 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
        if (checkin.buttonType === 'twoMinutes') colorClass = 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]';
        
        grid[col][row] = { colorClass };
      }
    });

    return grid;
  }, [checkins]);

  return (
    <div className="flex space-x-1.5 overflow-x-auto no-scrollbar p-5 bg-black/60 rounded-[2rem] border border-white/5 shadow-inner">
      {gridData.map((week, wi) => (
        <div key={wi} className="flex flex-col space-y-1.5">
          {week.map((day, di) => (
            <div
              key={`${wi}-${di}`}
              className={`w-3.5 h-3.5 rounded-[3px] transition-all duration-1000 ${
                day ? day.colorClass : 'bg-white/5 border border-white/5'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Heatmap;
