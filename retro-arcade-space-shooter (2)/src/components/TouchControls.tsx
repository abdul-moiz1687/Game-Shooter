import React, { useRef, useState, useEffect } from 'react';
import { Crosshair, Zap } from 'lucide-react';
import { PlayerStats } from '../game/types';

interface TouchControlsProps {
  onDirectionChange: (keys: { ArrowLeft?: boolean; ArrowRight?: boolean; ArrowUp?: boolean; ArrowDown?: boolean }) => void;
  onFireChange: (firing: boolean) => void;
  onTriggerEMP: () => void;
  stats: PlayerStats;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onDirectionChange,
  onFireChange,
  onTriggerEMP,
  stats
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [activeTouchId, setActiveTouchId] = useState<number | null>(null);

  const resetJoystick = () => {
    setKnobPos({ x: 0, y: 0 });
    setActiveTouchId(null);
    onDirectionChange({});
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const touch = Array.from(e.touches).find(t => t.identifier === activeTouchId) || e.touches[0];
    if (!touch) return;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const maxDist = 45;
    const dist = Math.hypot(dx, dy);

    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    setKnobPos({ x: dx, y: dy });

    // Threshold deadzone
    const deadzone = 10;
    const keys: { ArrowLeft?: boolean; ArrowRight?: boolean; ArrowUp?: boolean; ArrowDown?: boolean } = {};

    if (dx < -deadzone) keys.ArrowLeft = true;
    if (dx > deadzone) keys.ArrowRight = true;
    if (dy < -deadzone) keys.ArrowUp = true;
    if (dy > deadzone) keys.ArrowDown = true;

    onDirectionChange(keys);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (touch) {
      setActiveTouchId(touch.identifier);
      handleTouchMove(e);
    }
  };

  useEffect(() => {
    return () => {
      onDirectionChange({});
      onFireChange(false);
    };
  }, [onDirectionChange, onFireChange]);

  return (
    <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none z-20 flex justify-between items-end select-none">
      {/* Virtual Analog Joystick (Bottom-Left) */}
      <div
        ref={joystickRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={resetJoystick}
        onTouchCancel={resetJoystick}
        className="w-28 h-28 rounded-full bg-slate-900/60 backdrop-blur-md border-2 border-cyan-500/40 pointer-events-auto flex items-center justify-center relative touch-none shadow-lg shadow-cyan-950/40"
      >
        {/* Outer boundary guide */}
        <div className="w-16 h-16 rounded-full border border-cyan-500/20" />
        {/* Thumb Knob */}
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-400 border border-white/40 shadow-lg shadow-cyan-500/50 absolute transition-transform duration-75"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
          }}
        />
      </div>

      {/* Action Buttons (Bottom-Right) */}
      <div className="flex flex-col gap-3 pointer-events-auto items-end">
        {/* EMP Trigger Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            if (stats.empReady) onTriggerEMP();
          }}
          disabled={!stats.empReady}
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 transition active:scale-95 shadow-lg ${
            stats.empReady
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-300 text-white shadow-pink-500/50 animate-pulse'
              : 'bg-slate-900/80 border-slate-700 text-slate-500 opacity-60'
          }`}
          title="EMP Bomb"
        >
          <Zap className="w-5 h-5" />
          <span className="font-arcade text-[8px] mt-0.5">EMP</span>
        </button>

        {/* Turbo Fire Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onFireChange(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onFireChange(false);
          }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-600 via-amber-500 to-orange-400 border-2 border-yellow-200 text-slate-950 flex flex-col items-center justify-center shadow-lg shadow-amber-500/40 active:scale-95 transition cursor-pointer"
          title="Fire Cannons"
        >
          <Crosshair className="w-7 h-7" />
          <span className="font-arcade text-[9px] font-bold mt-0.5">FIRE</span>
        </button>
      </div>
    </div>
  );
};
