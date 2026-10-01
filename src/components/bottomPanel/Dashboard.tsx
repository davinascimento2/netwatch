import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertOctagon, 
  Wifi, 
  Network, 
  TrendingUp, 
  Server,
  Cpu
} from 'lucide-react';
import { useNetworkStore } from '../../store/networkStore';

export function Dashboard() {
  const { devices, connections, activePackets, logs } = useNetworkStore();

  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const offlineDevices = devices.length - onlineDevices;
  const activeConnections = connections.filter(c => c.status === 'active').length;

  const deliveredLogs = logs.filter(l => l.level === 'success').length;
  const errorLogs = logs.filter(l => l.level === 'error').length;
  const totalEvents = logs.length;

  // Approximate health score
  const healthScore = devices.length > 0 
    ? Math.round((onlineDevices / devices.length) * 0.7 * 100 + (activeConnections / (connections.length || 1)) * 0.3 * 100)
    : 100;

  // Protocol distribution stats
  const protoCounts = {
    ICMP: logs.filter(l => l.protocol === 'ICMP').length,
    HTTP: logs.filter(l => l.protocol === 'HTTP').length,
    DNS: logs.filter(l => l.protocol === 'DNS').length,
    TCP: logs.filter(l => l.protocol === 'TCP').length,
    OTHER: logs.filter(l => !['ICMP', 'HTTP', 'DNS', 'TCP'].includes(l.protocol as string) && l.protocol).length
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4 select-none">
      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Network Health */}
        <div className="p-3 rounded-xl bg-[#0c121d] border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Health Index</div>
            <div className="text-xl font-bold font-mono text-slate-100 flex items-baseline space-x-1">
              <span>{healthScore}%</span>
              <span className="text-[10px] text-emerald-400 font-normal">OPTIMAL</span>
            </div>
          </div>
        </div>

        {/* Nodes Active */}
        <div className="p-3 rounded-xl bg-[#0c121d] border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Active Nodes</div>
            <div className="text-xl font-bold font-mono text-slate-100 flex items-baseline space-x-1">
              <span>{onlineDevices}</span>
              <span className="text-[10px] text-slate-400 font-normal">/ {devices.length} UP</span>
            </div>
          </div>
        </div>

        {/* Links Active */}
        <div className="p-3 rounded-xl bg-[#0c121d] border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-sky-950/50 border border-sky-500/30 text-sky-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Active Links</div>
            <div className="text-xl font-bold font-mono text-slate-100 flex items-baseline space-x-1">
              <span>{activeConnections}</span>
              <span className="text-[10px] text-slate-400 font-normal">CONNECTED</span>
            </div>
          </div>
        </div>

        {/* Packet Events */}
        <div className="p-3 rounded-xl bg-[#0c121d] border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-purple-950/50 border border-purple-500/30 text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Delivered Packets</div>
            <div className="text-xl font-bold font-mono text-slate-100 flex items-baseline space-x-1">
              <span>{deliveredLogs}</span>
              <span className="text-[10px] text-emerald-400 font-normal">({errorLogs} dropped)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Device Registry & Protocol Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Device Status Table */}
        <div className="md:col-span-2 p-3 rounded-xl bg-[#0c121d] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Node Telemetry Registry</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">{devices.length} Devices Registered</span>
          </div>

          <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {devices.map(dev => (
              <div 
                key={dev.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${dev.status === 'online' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  <span className="font-semibold text-slate-200">{dev.name}</span>
                  <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400 lowercase">{dev.type}</span>
                </div>
                <div className="flex items-center space-x-3 font-mono text-[11px]">
                  <span className="text-cyan-400">{dev.ip}</span>
                  <span className="text-slate-400 text-[10px] hidden sm:inline">{dev.mac}</span>
                  <span className="text-slate-400 text-[10px]">VLAN {dev.vlanId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Protocol Breakdown */}
        <div className="p-3 rounded-xl bg-[#0c121d] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protocol Breakdown</span>
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {Object.entries(protoCounts).map(([proto, count]) => {
              const total = Object.values(protoCounts).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={proto} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 font-semibold">{proto}</span>
                    <span className="text-cyan-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
