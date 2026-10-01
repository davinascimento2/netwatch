import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft, Trash2, Laptop } from 'lucide-react';
import { useNetworkStore } from '../../store/networkStore';
import { NetworkService } from '../../network/networkService';
import { sound } from '../../utils/audio';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success';
  text: string;
}

export function Terminal() {
  const { devices, connections, selectedDeviceId, selectDevice } = useNetworkStore();
  const [currentDevId, setCurrentDevId] = useState<string>(selectedDeviceId || devices[0]?.id || '');
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: '1', type: 'output', text: 'NETWATCH TELEMETRY CLI v2.0.0 [Ready]' },
    { id: '2', type: 'output', text: 'Type "help" to list diagnostic network commands.' }
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync selected device
  useEffect(() => {
    if (selectedDeviceId && devices.some(d => d.id === selectedDeviceId)) {
      setCurrentDevId(selectedDeviceId);
    }
  }, [selectedDeviceId, devices]);

  // Auto scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const activeDevice = devices.find(d => d.id === currentDevId) || devices[0];

  const handleDeviceChange = (newId: string) => {
    setCurrentDevId(newId);
    selectDevice(newId);
    setLines(prev => [
      ...prev,
      { id: Date.now().toString(), type: 'output', text: `Switched active terminal context to: ${devices.find(d => d.id === newId)?.name || newId}` }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    sound.playTerminalKey();

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[history.length - 1 - nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[history.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputVal.trim());
    }
  };

  const executeCommand = (cmd: string) => {
    if (!cmd) return;

    sound.playClick();
    const promptLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'input',
      text: `[${activeDevice?.name || 'device'}@netwatch ~]$ ${cmd}`
    };

    setHistory(prev => [cmd, ...prev]);
    setHistoryIndex(-1);
    setInputVal('');

    const parts = cmd.split(' ').filter(Boolean);
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const outputLines: TerminalLine[] = [];

    switch (mainCmd) {
      case 'help':
        outputLines.push(
          { id: `${Date.now()}-1`, type: 'output', text: 'NETWATCH DIAGNOSTIC SUITE COMMANDS:' },
          { id: `${Date.now()}-2`, type: 'output', text: '  ping <ip|host>         - Test ICMP echo reachability and latency' },
          { id: `${Date.now()}-3`, type: 'output', text: '  traceroute <ip|host>   - Trace packet path and hop delays' },
          { id: `${Date.now()}-4`, type: 'output', text: '  ipconfig | ifconfig    - Display IP, MAC, Subnet, Gateway & VLAN' },
          { id: `${Date.now()}-5`, type: 'output', text: '  arp -a                 - Show resolved Address Resolution Protocol table' },
          { id: `${Date.now()}-6`, type: 'output', text: '  nslookup <domain>      - Query simulated DNS records' },
          { id: `${Date.now()}-7`, type: 'output', text: '  route print            - Print device routing table' },
          { id: `${Date.now()}-8`, type: 'output', text: '  clear                  - Clear terminal buffer' }
        );
        break;

      case 'clear':
        setLines([]);
        return;

      case 'ipconfig':
      case 'ifconfig':
        if (!activeDevice) {
          outputLines.push({ id: Date.now().toString(), type: 'error', text: 'No device selected' });
        } else {
          outputLines.push(
            { id: `${Date.now()}-1`, type: 'output', text: `Ethernet adapter [${activeDevice.name}]:` },
            { id: `${Date.now()}-2`, type: 'output', text: `   Connection-specific DNS Suffix  . : internal.lan` },
            { id: `${Date.now()}-3`, type: 'output', text: `   Physical (MAC) Address . . . . . : ${activeDevice.mac}` },
            { id: `${Date.now()}-4`, type: 'output', text: `   IPv4 Address . . . . . . . . . . : ${activeDevice.ip}` },
            { id: `${Date.now()}-5`, type: 'output', text: `   Subnet Mask  . . . . . . . . . . : ${activeDevice.subnetMask}` },
            { id: `${Date.now()}-6`, type: 'output', text: `   Default Gateway  . . . . . . . . : ${activeDevice.gateway}` },
            { id: `${Date.now()}-7`, type: 'output', text: `   DNS Server . . . . . . . . . . . : ${activeDevice.dnsServer}` },
            { id: `${Date.now()}-8`, type: 'output', text: `   VLAN ID  . . . . . . . . . . . . : ${activeDevice.vlanId}` },
            { id: `${Date.now()}-9`, type: 'output', text: `   DHCP Enabled . . . . . . . . . . : ${activeDevice.isDhcpClient ? 'Yes' : 'No'}` }
          );
        }
        break;

      case 'ping':
        if (!args[0]) {
          outputLines.push({ id: Date.now().toString(), type: 'error', text: 'Usage: ping <ip-address | domain>' });
        } else if (!activeDevice) {
          outputLines.push({ id: Date.now().toString(), type: 'error', text: 'Source device offline or unavailable' });
        } else {
          const target = args[0];
          const result = NetworkService.simulatePing(devices, connections, activeDevice.id, target);

          outputLines.push({ id: `${Date.now()}-0`, type: 'output', text: `Pinging ${target} with 32 bytes of data:` });

          if (result.details.length === 0) {
            outputLines.push(
              { id: `${Date.now()}-1`, type: 'error', text: 'Request timed out.' },
              { id: `${Date.now()}-2`, type: 'error', text: 'Destination host unreachable.' }
            );
          } else {
            result.details.forEach(d => {
              outputLines.push({
                id: `${Date.now()}-${d.seq}`,
                type: 'success',
                text: `Reply from ${target}: bytes=${d.bytes} time=${d.timeMs}ms TTL=${d.ttl}`
              });
            });
          }

          outputLines.push(
            { id: `${Date.now()}-stat1`, type: 'output', text: `Ping statistics for ${target}:` },
            { id: `${Date.now()}-stat2`, type: 'output', text: `    Packets: Sent = ${result.packetsSent}, Received = ${result.packetsReceived}, Lost = ${result.packetsSent - result.packetsReceived} (${result.packetLoss}% loss)` }
          );

          if (result.packetsReceived > 0) {
            outputLines.push({
              id: `${Date.now()}-stat3`,
              type: 'output',
              text: `Approximate round trip times in milli-seconds: Min = ${result.minLatency}ms, Max = ${result.maxLatency}ms, Avg = ${result.avgLatency}ms`
            });
          }
        }
        break;

      case 'traceroute':
      case 'tracert':
        if (!args[0]) {
          outputLines.push({ id: Date.now().toString(), type: 'error', text: 'Usage: traceroute <ip-address | domain>' });
        } else if (!activeDevice) {
          outputLines.push({ id: Date.now().toString(), type: 'error', text: 'Source device unavailable' });
        } else {
          const target = args[0];
          const hops = NetworkService.simulateTraceroute(devices, connections, activeDevice.id, target);

          outputLines.push({
            id: `${Date.now()}-0`,
            type: 'output',
            text: `Tracing route to ${target} over a maximum of 30 hops:`
          });

          if (hops.length === 0) {
            outputLines.push({ id: `${Date.now()}-1`, type: 'error', text: 'Destination unreachable: No route exists.' });
          } else {
            hops.forEach(h => {
              outputLines.push({
                id: `${Date.now()}-${h.hop}`,
                type: h.status === 'ok' ? 'output' : 'error',
                text: `  ${h.hop.toString().padStart(2, ' ')}   ${h.latencyMs.toFixed(1).padStart(5, ' ')} ms   ${h.ip.padEnd(16, ' ')} [${h.deviceName}]`
              });
            });
            outputLines.push({ id: `${Date.now()}-end`, type: 'success', text: 'Trace complete.' });
          }
        }
        break;

      case 'nslookup':
        if (!args[0]) {
          outputLines.push({ id: Date.now().toString(), type: 'error', text: 'Usage: nslookup <domain>' });
        } else {
          const domain = args[0];
          const ip = NetworkService.resolveDns(devices, domain);
          outputLines.push(
            { id: `${Date.now()}-1`, type: 'output', text: `Server:  ${activeDevice?.dnsServer || '192.168.1.100'}` },
            { id: `${Date.now()}-2`, type: 'output', text: `Address: ${activeDevice?.dnsServer || '192.168.1.100'}#53` }
          );
          if (ip) {
            outputLines.push(
              { id: `${Date.now()}-3`, type: 'output', text: 'Non-authoritative answer:' },
              { id: `${Date.now()}-4`, type: 'success', text: `Name:    ${domain}` },
              { id: `${Date.now()}-5`, type: 'success', text: `Address: ${ip}` }
            );
          } else {
            outputLines.push({ id: `${Date.now()}-err`, type: 'error', text: `** server can't find ${domain}: NXDOMAIN` });
          }
        }
        break;

      case 'arp':
        outputLines.push(
          { id: `${Date.now()}-1`, type: 'output', text: `Interface: ${activeDevice?.ip || '192.168.1.10'} --- 0x2` },
          { id: `${Date.now()}-2`, type: 'output', text: '  Internet Address      Physical Address      Type' }
        );
        devices.forEach(d => {
          if (d.id !== activeDevice?.id && d.status === 'online') {
            outputLines.push({
              id: `${Date.now()}-${d.id}`,
              type: 'output',
              text: `  ${d.ip.padEnd(20, ' ')}  ${d.mac.padEnd(20, ' ')}  dynamic`
            });
          }
        });
        break;

      case 'route':
        if (args[0] === 'print' || args.length === 0) {
          outputLines.push(
            { id: `${Date.now()}-1`, type: 'output', text: 'IPv4 Route Table' },
            { id: `${Date.now()}-2`, type: 'output', text: '===========================================================================' },
            { id: `${Date.now()}-3`, type: 'output', text: 'Network Destination        Netmask          Gateway       Interface  Metric' },
            { id: `${Date.now()}-4`, type: 'output', text: `          0.0.0.0          0.0.0.0    ${activeDevice?.gateway.padEnd(14, ' ')}  ${activeDevice?.ip.padEnd(10, ' ')}       1` },
            { id: `${Date.now()}-5`, type: 'output', text: `      192.168.1.0    255.255.255.0          On-link   ${activeDevice?.ip.padEnd(10, ' ')}     256` },
            { id: `${Date.now()}-6`, type: 'output', text: `        127.0.0.1  255.255.255.255          On-link       127.0.0.1       1` }
          );
        } else {
          outputLines.push({ id: Date.now().toString(), type: 'error', text: 'Usage: route print' });
        }
        break;

      default:
        outputLines.push({
          id: Date.now().toString(),
          type: 'error',
          text: `Command not recognized: "${cmd}". Type "help" for a list of valid commands.`
        });
        break;
    }

    setLines(prev => [...prev, promptLine, ...outputLines]);
  };

  return (
    <div className="h-full flex flex-col bg-[#05080e] font-mono text-xs select-text">
      {/* Terminal Header & Device Selector */}
      <div className="px-4 py-2 bg-[#090e18] border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">CLI Diagnostic Console</span>
          <span className="text-[10px] text-slate-400">({activeDevice?.name})</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <Laptop className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={currentDevId}
              onChange={e => handleDeviceChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.ip})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setLines([])}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div 
        onClick={() => inputRef.current?.focus()}
        className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-1 cursor-text"
      >
        {lines.map(line => {
          let color = 'text-slate-300';
          if (line.type === 'input') color = 'text-cyan-400 font-bold';
          if (line.type === 'success') color = 'text-emerald-400';
          if (line.type === 'error') color = 'text-rose-400';

          return (
            <div key={line.id} className={`${color} leading-relaxed whitespace-pre-wrap`}>
              {line.text}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Terminal Input Line */}
      <div className="px-3 py-2 bg-[#080d16] border-t border-slate-800/80 flex items-center space-x-2">
        <span className="text-cyan-400 font-bold flex-shrink-0">
          [{activeDevice?.name || 'terminal'}]$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ping 192.168.1.100, traceroute 8.8.8.8, ipconfig, arp -a..."
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none"
          autoFocus
        />
        <button
          onClick={() => executeCommand(inputVal.trim())}
          className="p-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
