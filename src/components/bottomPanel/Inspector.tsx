import React, { useState } from 'react';
import { 
  Sliders, 
  Trash2, 
  Power, 
  Shield, 
  Plus, 
  Navigation, 
  Globe, 
  Activity, 
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { useNetworkStore } from '../../store/networkStore';
import { FirewallRule, RouteEntry, DnsRecord } from '../../types';

export function Inspector() {
  const {
    devices,
    connections,
    selectedDeviceId,
    selectedConnectionId,
    updateDevice,
    removeDevice,
    updateConnection,
    removeConnection
  } = useNetworkStore();

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);
  const selectedConnection = connections.find(c => c.id === selectedConnectionId);

  // New rule state for firewall
  const [newRuleProto, setNewRuleProto] = useState<FirewallRule['protocol']>('ALL');
  const [newRuleAction, setNewRuleAction] = useState<'ALLOW' | 'DENY'>('DENY');
  const [newRuleDesc, setNewRuleDesc] = useState('');

  if (!selectedDevice && !selectedConnection) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono select-none">
        <div className="text-center space-y-1">
          <Sliders className="w-6 h-6 mx-auto text-slate-600 animate-pulse" />
          <div>SELECT A DEVICE OR CONNECTION ON THE CANVAS TO INSPECT</div>
        </div>
      </div>
    );
  }

  // --- CONNECTION INSPECTOR ---
  if (selectedConnection) {
    const srcDev = devices.find(d => d.id === selectedConnection.sourceDeviceId);
    const dstDev = devices.find(d => d.id === selectedConnection.targetDeviceId);

    return (
      <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4 select-none">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Link Inspector: {srcDev?.name} ⟷ {dstDev?.name}
            </span>
          </div>
          <button
            onClick={() => removeConnection(selectedConnection.id)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900 text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sever Link</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          {/* Bandwidth */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase">Bandwidth Capacity</label>
            <select
              value={selectedConnection.bandwidthMbps}
              onChange={e => updateConnection(selectedConnection.id, { bandwidthMbps: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value={100}>100 Mbps (Fast Ethernet)</option>
              <option value={1000}>1000 Mbps / 1 Gbps (Gigabit)</option>
              <option value={10000}>10 Gbps (Fiber Optic)</option>
              <option value={40000}>40 Gbps (Backbone Fiber)</option>
            </select>
          </div>

          {/* Latency */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase">Latency ({selectedConnection.latencyMs} ms)</label>
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              value={selectedConnection.latencyMs}
              onChange={e => updateConnection(selectedConnection.id, { latencyMs: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Link Status */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase">Link State</label>
            <select
              value={selectedConnection.status}
              onChange={e => updateConnection(selectedConnection.id, { status: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="active">Active (100% Throughput)</option>
              <option value="degraded">Degraded (Packet Jitter)</option>
              <option value="down">Severed / Down (Offline)</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  // --- DEVICE INSPECTOR ---
  if (!selectedDevice) return null;

  const isFirewall = selectedDevice.type === 'firewall';
  const isRouter = selectedDevice.type === 'router';
  const isServer = selectedDevice.type === 'server';

  const handleAddFirewallRule = () => {
    if (!newRuleDesc) return;
    const rule: FirewallRule = {
      id: `fr-${Date.now()}`,
      action: newRuleAction,
      protocol: newRuleProto,
      sourceIp: 'ANY',
      targetIp: 'ANY',
      description: newRuleDesc
    };
    const current = selectedDevice.firewallRules || [];
    updateDevice(selectedDevice.id, { firewallRules: [...current, rule] });
    setNewRuleDesc('');
  };

  const handleDeleteFirewallRule = (ruleId: string) => {
    const current = selectedDevice.firewallRules || [];
    updateDevice(selectedDevice.id, {
      firewallRules: current.filter(r => r.id !== ruleId)
    });
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4 select-none">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
            Node Configuration // {selectedDevice.name}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Power UP / DOWN */}
          <button
            onClick={() => updateDevice(selectedDevice.id, {
              status: selectedDevice.status === 'online' ? 'offline' : 'online'
            })}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              selectedDevice.status === 'online'
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900'
                : 'bg-rose-950/60 border border-rose-500/40 text-rose-400 hover:bg-rose-900'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{selectedDevice.status === 'online' ? 'POWER ON' : 'POWER OFF'}</span>
          </button>

          {/* Delete Node */}
          <button
            onClick={() => removeDevice(selectedDevice.id)}
            className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-colors"
            title="Decommission node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Network Configuration Form Fields */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase">Device Hostname</label>
          <input
            type="text"
            value={selectedDevice.name}
            onChange={e => updateDevice(selectedDevice.id, { name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* IP Address */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase">IPv4 Address</label>
          <input
            type="text"
            value={selectedDevice.ip}
            onChange={e => updateDevice(selectedDevice.id, { ip: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-cyan-300 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Subnet Mask */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase">Subnet Mask</label>
          <input
            type="text"
            value={selectedDevice.subnetMask}
            onChange={e => updateDevice(selectedDevice.id, { subnetMask: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Gateway */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase">Default Gateway</label>
          <input
            type="text"
            value={selectedDevice.gateway}
            onChange={e => updateDevice(selectedDevice.id, { gateway: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* DNS Server */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase">DNS Resolver</label>
          <input
            type="text"
            value={selectedDevice.dnsServer}
            onChange={e => updateDevice(selectedDevice.id, { dnsServer: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* MAC Address */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase">Hardware (MAC)</label>
          <input
            type="text"
            value={selectedDevice.mac}
            onChange={e => updateDevice(selectedDevice.id, { mac: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* VLAN ID */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase">VLAN Tag (802.1Q)</label>
          <input
            type="number"
            min="1"
            max="4094"
            value={selectedDevice.vlanId}
            onChange={e => updateDevice(selectedDevice.id, { vlanId: Number(e.target.value) })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-cyan-300 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* DHCP Client Toggle */}
        <div className="flex flex-col justify-end">
          <label className="flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={selectedDevice.isDhcpClient}
              onChange={e => updateDevice(selectedDevice.id, { isDhcpClient: e.target.checked })}
              className="accent-cyan-400 rounded"
            />
            <span>Obtain via DHCP</span>
          </label>
        </div>
      </div>

      {/* FIREWALL RULES SECTION (If Firewall) */}
      {isFirewall && (
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Stateful Packet Filtering Rules</span>
            </span>
          </div>

          {/* Add Rule Row */}
          <div className="flex flex-wrap gap-2 items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-xs font-mono">
            <select
              value={newRuleAction}
              onChange={e => setNewRuleAction(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
            >
              <option value="ALLOW">ALLOW</option>
              <option value="DENY">DENY</option>
            </select>

            <select
              value={newRuleProto}
              onChange={e => setNewRuleProto(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
            >
              <option value="ALL">ALL PROTOCOLS</option>
              <option value="HTTP">HTTP (80)</option>
              <option value="DNS">DNS (53)</option>
              <option value="ICMP">ICMP PING</option>
              <option value="TCP">TCP</option>
            </select>

            <input
              type="text"
              placeholder="Rule Description (e.g. Block ICMP flood)"
              value={newRuleDesc}
              onChange={e => setNewRuleDesc(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
            />

            <button
              onClick={handleAddFirewallRule}
              className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Rule</span>
            </button>
          </div>

          {/* Rules List */}
          <div className="space-y-1">
            {(selectedDevice.firewallRules || []).map(r => (
              <div 
                key={r.id} 
                className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-800 text-xs font-mono"
              >
                <div className="flex items-center space-x-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    r.action === 'ALLOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                  }`}>
                    {r.action}
                  </span>
                  <span className="text-cyan-400">{r.protocol}</span>
                  <span className="text-slate-300">{r.description}</span>
                </div>
                <button
                  onClick={() => handleDeleteFirewallRule(r.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DNS RECORDS (If Server) */}
      {isServer && selectedDevice.dnsRecords && (
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>Hosted DNS Zone (A Records)</span>
          </div>

          <div className="space-y-1">
            {selectedDevice.dnsRecords.map(rec => (
              <div key={rec.id} className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-800 text-xs font-mono">
                <span className="text-cyan-300">{rec.domain}</span>
                <span className="text-slate-400">IN {rec.type}</span>
                <span className="text-emerald-400">{rec.ip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
