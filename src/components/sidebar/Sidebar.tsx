import React from 'react';
import { 
  Monitor, 
  Laptop, 
  Server, 
  Router, 
  Network, 
  Shield, 
  Wifi, 
  Printer, 
  Database, 
  Cloud,
  Plus,
  Layers,
  Sparkles,
  ServerCrash
} from 'lucide-react';
import { DeviceType } from '../../types';
import { useNetworkStore } from '../../store/networkStore';

interface DeviceItem {
  type: DeviceType;
  label: string;
  category: 'endpoints' | 'infrastructure' | 'services';
  icon: React.ReactNode;
  desc: string;
}

const PALETTE_DEVICES: DeviceItem[] = [
  // Endpoints
  { type: 'pc', label: 'Workstation', category: 'endpoints', icon: <Monitor className="w-4 h-4 text-teal-400" />, desc: 'Standard desktop terminal' },
  { type: 'laptop', label: 'Laptop', category: 'endpoints', icon: <Laptop className="w-4 h-4 text-cyan-400" />, desc: 'Mobile Wi-Fi endpoint' },
  { type: 'printer', label: 'Network Printer', category: 'endpoints', icon: <Printer className="w-4 h-4 text-slate-300" />, desc: 'Network printing queue' },

  // Infrastructure
  { type: 'router', label: 'Core Router', category: 'infrastructure', icon: <Router className="w-4 h-4 text-amber-400" />, desc: 'L3 routing & NAT gateway' },
  { type: 'switch', label: 'Ethernet Switch', category: 'infrastructure', icon: <Network className="w-4 h-4 text-sky-400" />, desc: 'L2 multi-port distribution' },
  { type: 'firewall', label: 'Security Firewall', category: 'infrastructure', icon: <Shield className="w-4 h-4 text-rose-400" />, desc: 'Stateful packet inspection' },
  { type: 'access_point', label: 'Access Point', category: 'infrastructure', icon: <Wifi className="w-4 h-4 text-indigo-400" />, desc: '802.11 Wi-Fi bridge' },

  // Services & Cloud
  { type: 'server', label: 'Web Server', category: 'services', icon: <Server className="w-4 h-4 text-emerald-400" />, desc: 'HTTP, DNS & application host' },
  { type: 'database', label: 'Database Cluster', category: 'services', icon: <Database className="w-4 h-4 text-purple-400" />, desc: 'High-availability data node' },
  { type: 'cloud', label: 'Cloud / Internet', category: 'services', icon: <Cloud className="w-4 h-4 text-blue-400" />, desc: 'External WAN gateway' }
];

export function Sidebar() {
  const { addDevice, devices, loadPreset } = useNetworkStore();

  const handleDragStart = (e: React.DragEvent, type: DeviceType) => {
    e.dataTransfer.setData('application/netwatch-device-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const categories = [
    { id: 'infrastructure', label: 'Infrastructure & Routing' },
    { id: 'endpoints', label: 'Endpoints & Clients' },
    { id: 'services', label: 'Servers & Cloud Services' }
  ];

  return (
    <aside className="w-64 h-full bg-[#080d16] border-r border-slate-800/80 flex flex-col select-none overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold tracking-wider uppercase text-cyan-400 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Device Palette</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Drag to canvas or click +</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700/60">
          {devices.length} Nodes
        </span>
      </div>

      {/* Palette Categories */}
      <div className="flex-1 p-3 space-y-4">
        {categories.map(cat => (
          <div key={cat.id} className="space-y-1.5">
            <h3 className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-1 font-semibold">
              {cat.label}
            </h3>

            <div className="space-y-1">
              {PALETTE_DEVICES.filter(d => d.category === cat.id).map(device => (
                <div
                  key={device.type}
                  draggable
                  onDragStart={e => handleDragStart(e, device.type)}
                  className="group relative flex items-center justify-between px-2.5 py-2 rounded-lg bg-[#0c121e]/80 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-[#111927] transition-all cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-colors">
                      {device.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                        {device.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {device.desc}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addDevice(device.type)}
                    title={`Add ${device.label}`}
                    className="p-1 rounded bg-slate-800/60 hover:bg-cyan-500 hover:text-black text-slate-400 opacity-60 group-hover:opacity-100 transition-all ml-1 flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Topology Presets Quick Selector */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070b13]">
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Quick Topologies</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => loadPreset('corporate')}
            className="px-2 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 text-[11px] text-slate-300 transition-colors text-left"
          >
            Corporate HQ
          </button>
          <button
            onClick={() => loadPreset('soho')}
            className="px-2 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 text-[11px] text-slate-300 transition-colors text-left"
          >
            SOHO Network
          </button>
          <button
            onClick={() => loadPreset('clean')}
            className="col-span-2 px-2 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:text-rose-300 text-[11px] text-slate-300 transition-colors text-left flex items-center justify-between"
          >
            <span>Empty Canvas</span>
            <ServerCrash className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}
