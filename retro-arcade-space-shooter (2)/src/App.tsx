import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameState, PlayerStats, HighScoreEntry, ShipType, UpgradeType, UpgradeState, GameSettings } from './game/types';
import { getInitialUpgrades } from './game/ships';
import { soundEngine } from './game/audio';
import { ArcadeHUD } from './components/ArcadeHUD';
import { StartScreen } from './components/StartScreen';
import { ShipSelectScreen } from './components/ShipSelectScreen';
import { ShopScreen } from './components/ShopScreen';
import { PauseMenu } from './components/PauseMenu';
import { GameOverModal } from './components/GameOverModal';
import { HighScoresModal } from './components/HighScoresModal';
import { TouchControls } from './components/TouchControls';
import { Tv, Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // "uiState" mirrors engine state but adds pure-UI 'shipselect'
  const [gameState, setGameState] = useState<GameState>('start');
  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    highScore: 3500,
    credits: 0,
    health: 100,
    maxHealth: 100,
    shield: 50,
    maxShield: 100,
    empCooldown: 0,
    empMaxCooldown: 20,
    empReady: true,
    weaponLevel: 1,
    weaponTimer: 0,
    speedTimer: 0,
    wave: 1,
    waveEnemiesRemaining: 0,
    bossActive: false,
    bossHealth: 0,
    bossMaxHealth: 1,
    comboMultiplier: 1,
    comboTimer: 0,
    kills: 0
  });

  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [upgrades, setUpgrades] = useState<UpgradeState>(getInitialUpgrades());
  const [settings, setSettings] = useState<GameSettings>({
    musicVolume: 0.4,
    sfxVolume: 0.7,
    shakeIntensity: 1.0
  });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [sfxActive, setSfxActive] = useState(true);
  const [musicActive, setMusicActive] = useState(true);
  const [scanlines, setScanlines] = useState(true);
  const [touchEnabled, setTouchEnabled] = useState(false);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setTouchEnabled(isTouch);
  }, []);

  // Initialize engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    engine.onStatsUpdate = (s) => setStats(s);
    engine.onStateChange = (newState) => {
      setGameState(newState);
      if (newState === 'shop') {
        setUpgrades({ ...engine.upgrades });
      }
    };

    setHighScores(engine.highScores);
    setSettings({ ...engine.settings });

    return () => engine.stop();
  }, []);

  // Audio toggles
  const handleToggleSFX = useCallback(() => setSfxActive(soundEngine.toggleSFX()), []);
  const handleToggleMusic = useCallback(() => setMusicActive(soundEngine.toggleMusic()), []);

  // Settings
  const handleSettingsChange = useCallback((patch: Partial<GameSettings>) => {
    if (!engineRef.current) return;
    engineRef.current.updateSettings(patch);
    setSettings({ ...engineRef.current.settings });
  }, []);

  // Navigation / game control
  const handleGoShipSelect = useCallback(() => setGameState('shipselect'), []);
  const handleBackToTitle = useCallback(() => setGameState('start'), []);

  const handleConfirmShip = useCallback((ship: ShipType) => {
    engineRef.current?.startGame(ship);
    setUpgrades(getInitialUpgrades());
  }, []);

  const handlePauseGame = useCallback(() => engineRef.current?.pauseGame(), []);
  const handleResumeGame = useCallback(() => engineRef.current?.resumeGame(), []);
  const handleRestartGame = useCallback(() => engineRef.current?.restartGame(), []);

  const handleHome = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.state = 'start';
      engineRef.current.stop();
    }
    setGameState('start');
  }, []);

  const handleTriggerEMP = useCallback(() => engineRef.current?.triggerEMP(), []);

  // Shop
  const handleBuyUpgrade = useCallback((type: UpgradeType) => {
    if (!engineRef.current) return;
    engineRef.current.buyUpgrade(type);
    setUpgrades({ ...engineRef.current.upgrades });
  }, []);

  const handleGetCost = useCallback((type: UpgradeType) => {
    return engineRef.current ? engineRef.current.getUpgradeCost(type) : 0;
  }, []);

  const handleShopContinue = useCallback(() => engineRef.current?.continueFromShop(), []);

  // High scores
  const handleSaveScore = useCallback((initials: string) => {
    if (engineRef.current) {
      engineRef.current.saveHighScore(initials);
      setHighScores([...engineRef.current.highScores]);
    }
  }, []);

  const handleResetScores = useCallback(() => {
    try { localStorage.removeItem('neovanguard_high_scores'); } catch { /* ignore */ }
    if (engineRef.current) {
      engineRef.current.highScores = [];
      engineRef.current.highScore = 0;
      setHighScores([]);
    }
  }, []);

  // Mobile input
  const handleTouchDirection = useCallback((keys: { ArrowLeft?: boolean; ArrowRight?: boolean; ArrowUp?: boolean; ArrowDown?: boolean }) => {
    if (!engineRef.current) return;
    engineRef.current.keys['ArrowLeft'] = !!keys.ArrowLeft;
    engineRef.current.keys['ArrowRight'] = !!keys.ArrowRight;
    engineRef.current.keys['ArrowUp'] = !!keys.ArrowUp;
    engineRef.current.keys['ArrowDown'] = !!keys.ArrowDown;
  }, []);

  const handleTouchFire = useCallback((firing: boolean) => {
    if (engineRef.current) engineRef.current.isFiring = firing;
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#030611] flex flex-col items-center justify-center overflow-hidden font-tech select-none">
      <div className="relative w-full h-full max-w-5xl max-h-[900px] flex flex-col justify-between p-2 sm:p-4 box-border">
        {/* Top Cabinet Bezel */}
        <header className="flex items-center justify-between px-3 py-1.5 mb-1 bg-slate-900/90 border border-cyan-500/30 rounded-xl shadow-md z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-cyan-400 shadow" />
            <h1 className="font-arcade text-xs sm:text-sm text-cyan-300 tracking-wider">
              NEO-VANGUARD
            </h1>
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              // ARCADE SPEC-04
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              onClick={() => setScanlines(!scanlines)}
              className={`p-1 px-2 rounded border transition flex items-center gap-1 cursor-pointer text-[11px] ${
                scanlines ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
              title="Toggle Retro Scanline Simulation"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CRT FX</span>
            </button>

            <button
              onClick={() => setTouchEnabled(!touchEnabled)}
              className={`p-1 px-2 rounded border transition flex items-center gap-1 cursor-pointer text-[11px] ${
                touchEnabled ? 'bg-pink-950/60 border-pink-500/40 text-pink-300' : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
              title="Toggle On-Screen Touch Controls"
            >
              {touchEnabled ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">TOUCH</span>
            </button>
          </div>
        </header>

        {/* Screen Viewport */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden rounded-2xl border-2 border-cyan-500/40 bg-black shadow-2xl shadow-cyan-950/50">
          <canvas ref={canvasRef} className="block touch-none cursor-crosshair max-w-full max-h-full aspect-auto" />

          {scanlines && <div className="absolute inset-0 scanlines pointer-events-none z-10" />}

          {gameState === 'playing' && (
            <ArcadeHUD
              stats={stats}
              onPause={handlePauseGame}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              sfxActive={sfxActive}
              musicActive={musicActive}
              onToggleSFX={handleToggleSFX}
              onToggleMusic={handleToggleMusic}
              onTriggerEMP={handleTriggerEMP}
            />
          )}

          {touchEnabled && gameState === 'playing' && (
            <TouchControls
              onDirectionChange={handleTouchDirection}
              onFireChange={handleTouchFire}
              onTriggerEMP={handleTriggerEMP}
              stats={stats}
            />
          )}

          {gameState === 'start' && (
            <StartScreen
              onStart={handleGoShipSelect}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              highScore={stats.highScore}
              sfxActive={sfxActive}
              musicActive={musicActive}
              onToggleSFX={handleToggleSFX}
              onToggleMusic={handleToggleMusic}
            />
          )}

          {gameState === 'shipselect' && (
            <ShipSelectScreen onConfirm={handleConfirmShip} onBack={handleBackToTitle} />
          )}

          {gameState === 'shop' && (
            <ShopScreen
              stats={stats}
              upgrades={upgrades}
              getCost={handleGetCost}
              onBuy={handleBuyUpgrade}
              onContinue={handleShopContinue}
              nextWave={stats.wave}
            />
          )}

          {gameState === 'paused' && (
            <PauseMenu
              onResume={handleResumeGame}
              onRestart={handleRestartGame}
              onHome={handleHome}
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
          )}

          {gameState === 'gameover' && (
            <GameOverModal
              stats={stats}
              onRestart={handleRestartGame}
              onHome={handleHome}
              onSaveScore={handleSaveScore}
              isNewRecord={stats.score >= stats.highScore && stats.score > 0}
            />
          )}

          {showLeaderboard && (
            <HighScoresModal
              scores={highScores}
              onClose={() => setShowLeaderboard(false)}
              onResetScores={handleResetScores}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-1 flex items-center justify-between px-2 text-[10px] font-mono text-slate-500">
          <span>[WASD / ARROWS] STEER &nbsp;•&nbsp; [SPACE] LASER &nbsp;•&nbsp; [B] EMP BOMB</span>
          <span className="hidden sm:inline">60 FPS // WAVE COMBAT + UPGRADE SHOP</span>
        </footer>
      </div>
    </div>
  );
}
