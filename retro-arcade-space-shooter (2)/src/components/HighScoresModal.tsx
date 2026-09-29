import React from 'react';
import { Trophy, X, RotateCcw } from 'lucide-react';
import { HighScoreEntry } from '../game/types';

interface HighScoresModalProps {
  scores: HighScoreEntry[];
  onClose: () => void;
  onResetScores: () => void;
}

export const HighScoresModal: React.FC<HighScoresModalProps> = ({
  scores,
  onClose,
  onResetScores
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-lg w-full bg-slate-900/95 border-2 border-yellow-500/60 rounded-2xl p-6 shadow-2xl shadow-yellow-950/50 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="font-arcade text-lg text-yellow-400 tracking-wider">
              HALL OF FAME
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scores Table */}
        <div className="overflow-hidden rounded-xl border border-slate-800 mb-4">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">RANK</th>
                <th className="py-2.5 px-3">CALLSIGN</th>
                <th className="py-2.5 px-3">SECTOR</th>
                <th className="py-2.5 px-3 text-right">SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {scores.map((entry, index) => {
                let medalColor = 'text-slate-400';
                if (index === 0) medalColor = 'text-yellow-400 font-bold';
                else if (index === 1) medalColor = 'text-slate-200 font-bold';
                else if (index === 2) medalColor = 'text-amber-600 font-bold';

                return (
                  <tr key={entry.id || index} className="hover:bg-slate-800/30 transition">
                    <td className={`py-2 px-3 ${medalColor}`}>
                      {index === 0 ? '👑 #1' : `#${index + 1}`}
                    </td>
                    <td className="py-2 px-3 font-arcade text-[11px] text-cyan-300">
                      {entry.name}
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      W-{entry.wave}
                    </td>
                    <td className="py-2 px-3 text-right font-arcade text-yellow-300">
                      {entry.score.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => {
              if (window.confirm('Reset all saved local high scores?')) {
                onResetScores();
              }
            }}
            className="text-slate-500 hover:text-red-400 cursor-pointer transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> CLEAR SCORES
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-lg cursor-pointer transition font-mono uppercase"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
