import React, { useState } from 'react';
import { 
  Activity, 
  Send, 
  Volume2, 
  VolumeX, 
  Tv, 
  Save, 
  FolderOpen, 
  RotateCcw, 
  RotateCw, 
  Radio, 
  Download, 
  Upload, 
  Trash2,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { useNetworkStore } from '../../store/networkStore';

interface ToolbarProps {
  onOpenPacketModal: () => void;
  onOpenExportModal: () => void;
  onOpenHelpModal: () => void;
}

export function Toolbar({ onOpenPacketModal, onOpenExportModal, onOpenHelpModal }: ToolbarProps) {
  const {
    devices,
    connections,
    activePackets,
    soundEnabled,
    toggleSound,
    crtEffect,
    toggleCrt,
    autoTraffic,
    toggleAutoTraffic,
    saveTopology,
    loadTopology,
    undo,
    redo,
    past,
    future,
    resetTopology
  } = useNetworkStore();

  const [resetConfirm, setResetConfirm] = useState(false);

  const activeDevices = devices.filter(d => d.status === 'online').length;

  return (
    <header className="h-14 bg-[#080d16] border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-20">
      {/* Brand & Status Indicator */}
      <div className="flex items-center space-x-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-extrabold tracking-wider text-slate-100 font-display">
                NET<span className="text-cyan-400">WATCH</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v2.0 PRO
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>TELEMETRY ONLINE</span>
            </div>
          </div>
        </div>

        {/* Live Counters */}
        <div className="hidden lg:flex items-center space-x-2 ml-4 pl-4 border-l border-slate-800">
          <div className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="text-slate-400">NODES:</span> <span className="text-emerald-400 font-bold">{activeDevices}</span>/{devices.length}
          </div>
          <div className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="text-slate-400">LINKS:</span> <span className="text-cyan-400 font-bold">{connections.length}</span>
          </div>
          {activePackets.length > 0 && (
            <div className="px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 animate-pulse">
              TRANSIT: {activePackets.length}
            </div>
          )}
        </div>
      </div>

      {/* Central Action Controls */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={onOpenPacketModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-[0_0_12px_rgba(0,240,255,0.25)] transition-all active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Dispatch Packet</span>
        </button>

        <button
          onClick={toggleAutoTraffic}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            autoTraffic
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
          title="Toggle automated telemetry traffic"
        >
          <Radio className={`w-3.5 h-3.5 ${autoTraffic ? 'animate-pulse text-emerald-400' : ''}`} />
          <span>AUTO TRAFFIC</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={past.length === 0}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={redo}
          disabled={future.length === 0}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Utility & Settings Controls */}
      <div className="flex items-center space-x-1.5">
        {/* Save / Load */}
        <button
          onClick={saveTopology}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 text-slate-300 transition-colors"
          title="Save topology to LocalStorage"
        >
          <Save className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={loadTopology}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 text-slate-300 transition-colors"
          title="Load saved topology from LocalStorage"
        >
          <FolderOpen className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenExportModal}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 text-slate-300 transition-colors"
          title="Export / Import JSON"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className={`p-1.5 rounded-lg border transition-all ${
            soundEnabled
              ? 'bg-slate-900 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-900/50 border-slate-800 text-slate-400'
          }`}
          title={soundEnabled ? 'Disable Audio Synthesizer' : 'Enable Audio Synthesizer'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* CRT Scanline Toggle */}
        <button
          onClick={toggleCrt}
          className={`p-1.5 rounded-lg border transition-all ${
            crtEffect
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/50 border-slate-800 text-slate-400'
          }`}
          title="Toggle CRT Scanline Retro Filter"
        >
          <Tv className="w-3.5 h-3.5" />
        </button>

        {/* Reset Confirmation */}
        {resetConfirm ? (
          <div className="flex items-center space-x-1 bg-rose-950/80 border border-rose-500/60 rounded-lg p-0.5">
            <button
              onClick={() => {
                resetTopology();
                setResetConfirm(false);
              }}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white"
            >
              Reset?
            </button>
            <button
              onClick={() => setResetConfirm(false)}
              className="text-[10px] px-1.5 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:text-rose-400 text-slate-400 transition-colors"
            title="Reset default topology"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Help */}
        <button
          onClick={onOpenHelpModal}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 text-slate-300 transition-colors ml-1"
          title="Guide & Keyboard Shortcuts"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
