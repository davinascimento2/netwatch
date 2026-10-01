import React from 'react';
import { X, HelpCircle, Network, Shield, Navigation, Command, Cpu } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#090e18] border border-cyan-500/40 shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0e1626] border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 font-display uppercase tracking-wider">
              NetWatch Operations & Architecture Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs font-mono text-slate-300 leading-relaxed">
          {/* Quick Start */}
          <div className="space-y-1.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <h4 className="text-cyan-400 font-bold flex items-center space-x-1.5 uppercase text-[11px]">
              <Command className="w-3.5 h-3.5" />
              <span>Quick Start Controls</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong className="text-slate-100">Add Devices:</strong> Drag any device from the left palette onto the canvas, or click the <span className="text-cyan-400">+</span> button.</li>
              <li><strong className="text-slate-100">Connect Nodes:</strong> Drag a connection line from one device handle (top/bottom/left/right) to another.</li>
              <li><strong className="text-slate-100">Inspect & Configure:</strong> Click any node or link to edit its IP, Subnet, VLAN, Firewall rules, or Bandwidth.</li>
              <li><strong className="text-slate-100">Run Diagnostics:</strong> Select a device, open the Terminal tab below, and run <code className="text-cyan-300">ping 192.168.1.100</code> or <code className="text-cyan-300">traceroute 8.8.8.8</code>.</li>
            </ul>
          </div>

          {/* Core Simulation Systems */}
          <div className="space-y-3">
            <h4 className="text-slate-100 font-bold uppercase text-[11px] border-b border-slate-800 pb-1">
              Simulated Network Protocols & Engine
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Dijkstra Shortest Path Routing</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Every packet calculates the optimum transmission path considering link latencies, bandwidth caps, and degraded physical mediums.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1">
                <div className="flex items-center space-x-1.5 text-rose-400 font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Stateful Firewall (SPI)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Inspects incoming frames at firewall nodes against dynamic ALLOW/DENY rules by protocol (HTTP, DNS, ICMP, TCP) and drops violations.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <Network className="w-3.5 h-3.5" />
                  <span>VLAN (802.1Q) Isolation</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Frames in different VLAN tags are strictly isolated at Layer 2 and require an intervening Router to perform Inter-VLAN routing.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1">
                <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>DNS & ARP Caching</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Resolves domain names via mock DNS zones and maintains hardware MAC addresses in the Address Resolution Protocol table.
                </p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-200 uppercase">Keyboard Shortcuts</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">Ctrl + Z</kbd> Undo Canvas Change</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">Ctrl + Y</kbd> Redo Canvas Change</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">Ctrl + S</kbd> Save to LocalStorage</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">↑ / ↓</kbd> Terminal Command History</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
