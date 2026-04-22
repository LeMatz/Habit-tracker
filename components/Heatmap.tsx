import React, { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { DailyCheckin } from '../types';

interface HeatmapProps {
  checkins: DailyCheckin[];
  endDate?: string;
}

type SlotKind = 'emergency' | 'twoMinutes' | 'complete' | 'missed' | 'empty';

type Slot = { kind: SlotKind };

const TOTAL_SLOTS = 84; // 12 weeks × 7 days
const COLS = 12;
const ROWS = 7;

const colorFor = (kind: SlotKind): string => {
  switch (kind) {
    case 'emergency':
      return '#f97316';
    case 'twoMinutes':
      return '#6366f1';
    case 'complete':
      return '#06b6d4';
    case 'missed':
      return '#ffffff';
    case 'empty':
      return '#0f172a';
  }
};

const Heatmap: React.FC<HeatmapProps> = ({ checkins, endDate }) => {
  const grid = useMemo(() => {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const offset = -3;
    const localNow = new Date(utcTime + 3600000 * offset);
    const todayStr = endDate ?? localNow.toISOString().split('T')[0];

    const sortedCheckins = [...checkins].sort((a, b) => a.date.localeCompare(b.date));
    const firstCheckinDate = sortedCheckins.length > 0 ? sortedCheckins[0].date : null;

    let missedDaysCount = 0;
    if (firstCheckinDate) {
      const start = new Date(firstCheckinDate + 'T12:00:00');
      const end = new Date(todayStr + 'T12:00:00');
      const diffTime = Math.max(0, end.getTime() - start.getTime());
      const totalDaysActive = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      missedDaysCount = Math.max(0, totalDaysActive - checkins.length);
    }

    const slots: Slot[] = [];

    checkins.forEach((c) => {
      if (c.buttonType === 'emergency') slots.push({ kind: 'emergency' });
      else if (c.buttonType === 'twoMinutes') slots.push({ kind: 'twoMinutes' });
      else slots.push({ kind: 'complete' });
    });

    const actualMissed = Math.min(missedDaysCount, TOTAL_SLOTS - slots.length);
    for (let i = 0; i < actualMissed; i++) slots.push({ kind: 'missed' });

    const remaining = TOTAL_SLOTS - slots.length;
    for (let i = 0; i < remaining; i++) slots.push({ kind: 'empty' });

    // Fisher-Yates shuffle
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    const columns: Slot[][] = [];
    for (let col = 0; col < COLS; col++) {
      const column: Slot[] = [];
      for (let row = 0; row < ROWS; row++) {
        column.push(slots[col * ROWS + row]);
      }
      columns.push(column);
    }

    return columns;
  }, [checkins, endDate]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 24,
      }}
      className="bg-slate-950/60 rounded-[2.5rem] border border-white/5"
    >
      {grid.map((column, wi) => (
        <View key={wi} style={{ marginRight: wi < COLS - 1 ? 6 : 0 }}>
          {column.map((slot, di) => (
            <View
              key={`${wi}-${di}`}
              style={{
                width: 16,
                height: 16,
                marginBottom: di < ROWS - 1 ? 6 : 0,
                borderRadius: 2,
                backgroundColor: colorFor(slot.kind),
                borderWidth: slot.kind === 'empty' ? 1 : 0,
                borderColor: 'rgba(255,255,255,0.05)',
                transform: [{ scale: slot.kind === 'empty' ? 0.85 : 1 }],
              }}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

export default Heatmap;
