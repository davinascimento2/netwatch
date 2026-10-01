import React, { useState } from 'react';
import { 
  Send, 
  Play, 
  FastForward, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Sliders,
  Cpu
} from 'lucide-react';
import { useNetworkStore } from '../../store/networkStore';
import { PacketProtocol } from '../../types';
import { dijkstraShortestPath } from '../../utils/networkUtils';
import { sound } from '../../utils/audio';

export function PacketSimulator() {
  const { devices, connections, sendPacket, stepPackets, activePackets } = useNetworkStore();

  const [srcId, setSrcId] = useState<string>(devices[0]?.id || '');
  const [dstId, setDstId] = useState<string>(devices[devices.length - 1]?.id || '');
  const [protocol, setProtocol] = useState<PacketProtocol>('ICMP');
  const [packetSize, setPacketSize] = useState<number>(64);
  const [payload, setPayload] = useState<string>('GET /index.html HTTP/1.1');

  // Preview path
  const previewPath = srcId && dstId ? dijkstraShortestPath(devices, connections, srcId, dstId) : null;

  const handleSend = () => {
    if (!srcId || !dstId) return;
    sendPacket(srcId, dstId, protocol, payload);
  };

  const handleStep = () => {
    sound.playClick();
    stepPackets();
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Send className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
            Packet Dispatch & Hop Analysis
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleStep}
            disabled={activePackets.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono transition-all"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Step Hop ({activePackets.length} in transit)</span>
          </button>

          <button
            onClick={handleSend}
            className="flex items-center space-x-1.5 px-3.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Transmit Packet</span>
          </button>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        {/* Source */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase">Source Node</label>
          <select
            value={srcId}
            onChange={e => setSrcId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            {devices.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.ip})
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase">Destination Node</label>
          <select
            value={dstId}
            onChange={e => setDstId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            {devices.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.ip})
              </option>
            ))}
          </select>
        </div>

        {/* Protocol */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase">Transport Protocol</label>
          <select
            value={protocol}
            onChange={e => setProtocol(e.target.value as PacketProtocol)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="ICMP">ICMP Echo (Ping)</option>
            <option value="HTTP">HTTP GET Request (80)</option>
            <option value="DNS">DNS Query (53)</option>
            <option value="TCP">TCP Handshake [SYN]</option>
            <option value="ARP">ARP Resolution Probe</option>
          </select>
        </div>

        {/* Packet Size */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase">Frame Size ({packetSize} Bytes)</label>
          <input
            type="range"
            min="32"
            max="1500"
            value={packetSize}
            onChange={e => setPacketSize(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
      </div>

      {/* Calculated Route Preview */}
      <div className="p-3 rounded-xl bg-[#0c121d] border border-slate-800 space-y-2">
        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>CALCULATED ROUTE PATH (DIJKSTRA)</span>
          <span className="text-cyan-400 font-bold">{previewPath ? `${previewPath.length} Hops` : 'No Route'}</span>
        </div>

        {previewPath && previewPath.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
            {previewPath.map((nodeId, idx) => {
              const dev = devices.find(d => d.id === nodeId);
              return (
                <React.Fragment key={nodeId}>
                  <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold">#{idx + 1}</span>
                    <span className="text-cyan-300 font-semibold">{dev?.name}</span>
                    <span className="text-slate-400 text-[10px]">({dev?.ip})</span>
                  </div>
                  {idx < previewPath.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 animate-pulse" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono py-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Target is unreachable or physically isolated from source device.</span>
          </div>
        )}
      </div>
    </div>
  );
}
