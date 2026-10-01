import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
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
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity
} from 'lucide-react';
import { NetworkDevice, DeviceType } from '../../types';

export const getDeviceIcon = (type: DeviceType, className = "w-6 h-6") => {
  switch (type) {
    case 'pc': return <Monitor className={className} />;
    case 'laptop': return <Laptop className={className} />;
    case 'server': return <Server className={className} />;
    case 'router': return <Router className={className} />;
    case 'switch': return <Network className={className} />;
    case 'firewall': return <Shield className={className} />;
    case 'access_point': return <Wifi className={className} />;
    case 'printer': return <Printer className={className} />;
    case 'database': return <Database className={className} />;
    case 'cloud': return <Cloud className={className} />;
    default: return <Monitor className={className} />;
  }
};

const getTypeColor = (type: DeviceType) => {
  switch (type) {
    case 'cloud': return 'text-sky-400 border-sky-500/30 bg-sky-950/20';
    case 'firewall': return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
    case 'router': return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
    case 'switch': return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20';
    case 'server': return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    case 'database': return 'text-purple-400 border-purple-500/30 bg-purple-950/20';
    case 'access_point': return 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20';
    default: return 'text-teal-400 border-teal-500/30 bg-teal-950/20';
  }
};

export const DeviceNode = memo(({ data, selected }: NodeProps) => {
  const device = data as unknown as NetworkDevice;
  const isOnline = device.status === 'online';
  const colorClass = getTypeColor(device.type);

  return (
    <div className={`relative group px-3.5 py-2.5 rounded-xl border backdrop-blur-md transition-all duration-200 select-none min-w-[170px] ${
      selected 
        ? 'border-cyan-400 bg-[#0f172a]/95 shadow-[0_0_20px_rgba(0,240,255,0.4)] ring-1 ring-cyan-400' 
        : 'border-slate-800/80 bg-[#090e17]/90 hover:border-slate-700 hover:shadow-lg'
    } ${!isOnline ? 'opacity-60 grayscale' : ''}`}>
      
      {/* 4 Handles for flexible connection routing */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top" 
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom" 
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left" 
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right" 
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform" 
      />

      <div className="flex items-center space-x-3">
        {/* Device Icon Badge */}
        <div className={`p-2 rounded-lg border flex items-center justify-center relative ${colorClass}`}>
          {getDeviceIcon(device.type, "w-5 h-5")}
          
          {/* Status Indicator Dot */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            {isOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isOnline ? 'bg-emerald-400' : 'bg-rose-500'
            }`}></span>
          </span>
        </div>

        {/* Device Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-100 truncate tracking-wide">
              {device.name}
            </span>
            <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
              VLAN {device.vlanId}
            </span>
          </div>

          {/* IP and Status */}
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-cyan-400">
            <span className="truncate">{device.ip}</span>
            <span className="text-[10px] text-slate-500 lowercase ml-1">
              {device.type}
            </span>
          </div>
        </div>
      </div>

      {/* Cyber Corner Decals */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-400/50 rounded-tl" />
      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-cyan-400/50 rounded-tr" />
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-cyan-400/50 rounded-bl" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-400/50 rounded-br" />
    </div>
  );
});

DeviceNode.displayName = 'DeviceNode';
