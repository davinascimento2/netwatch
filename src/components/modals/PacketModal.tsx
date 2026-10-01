import React, { useState } from 'react';
import { X, Send, Play, ArrowRight } from 'lucide-react';
import { useNetworkStore } from '../../store/networkStore';
import { PacketProtocol } from '../../types';
import { dijkstraShortestPath } from '../../utils/networkUtils';

interface PacketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PacketModal({ isOpen, onClose }: PacketModalProps) {
  const { devices, connections, sendPacket } = useNetworkStore();

  const [srcId, setSrcId] = useState<string>(devices[0]?.id || '');
  const [dstId, setDstId] = useState<string>(devices[devices.length - 1]?.id || '');
  const [protocol, setProtocol] = useState<PacketProtocol>('ICMP');
  const [payload, setPayload] = useState('PING_ECHO_PACKET');

  if (!isOpen) return null;

  const path = srcId && dstId ? dijkstraShortestPath(devices, connections, srcId, dstId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srcId || !dstId) return;
    sendPacket(srcId, dstId, protocol, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg rounded-2xl bg-[#090e18] border border-cyan-500/40 shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0e1626] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 font-display uppercase tracking-wider">
              Dispatch Network Packet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase">Source Node</label>
              <select
                value={srcId}
                onChange={e => setSrcId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 focus:outline-none focus:border-cyan-400"
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.ip})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase">Target Node</label>
              <select
                value={dstId}
                onChange={e => setDstId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 focus:outline-none focus:border-cyan-400"
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.ip})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase">Protocol</label>
              <select
                value={protocol}
                onChange={e => setProtocol(e.target.value as PacketProtocol)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="ICMP">ICMP Echo Request</option>
                <option value="HTTP">HTTP GET Request</option>
                <option value="DNS">DNS Query</option>
                <option value="TCP">TCP [SYN] Handshake</option>
                <option value="ARP">ARP Who-Has Probe</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase">Data Payload</label>
              <input
                type="text"
                value={payload}
                onChange={e => setPayload(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Route Preview */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block mb-1.5 font-bold">
              Computed Transmission Route:
            </span>
            {path ? (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
                {path.map((nodeId, i) => {
                  const d = devices.find(x => x.id === nodeId);
                  return (
                    <React.Fragment key={nodeId}>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {d?.name}
                      </span>
                      {i < path.length - 1 && <ArrowRight className="w-3 h-3 text-cyan-400" />}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <span className="text-rose-400 text-xs">No route exists between these devices.</span>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!path}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Packet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
