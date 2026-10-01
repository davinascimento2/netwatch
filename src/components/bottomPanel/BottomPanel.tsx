import React, { useState } from 'react';
import { 
  Activity, 
  Terminal as TerminalIcon, 
  Sliders, 
  FileText, 
  Send, 
  ChevronDown, 
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useNetworkStore } from '../../store/networkStore';
import { Dashboard } from './Dashboard';
import { Terminal } from './Terminal';
import { Inspector } from './Inspector';
import { Logs } from './Logs';
import { PacketSimulator } from './PacketSimulator';

export function BottomPanel() {
  const { activeTab, setActiveTab, activePackets, logs } = useNetworkStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-3.5 h-3.5" />, badge: null },
    { id: 'terminal', label: 'Terminal CLI', icon: <TerminalIcon className="w-3.5 h-3.5" />, badge: null },
    { id: 'inspector', label: 'Inspector', icon: <Sliders className="w-3.5 h-3.5" />, badge: null },
    { id: 'packetSimulator', label: 'Packet Dispatcher', icon: <Send className="w-3.5 h-3.5" />, badge: activePackets.length > 0 ? activePackets.length : null },
    { id: 'logs', label: 'Telemetry Logs', icon: <FileText className="w-3.5 h-3.5" />, badge: logs.length }
  ] as const;

  return (
    <div className={`transition-all duration-200 bg-[#080d16] border-t border-slate-800/80 flex flex-col z-20 ${
      isCollapsed ? 'h-9' : isExpanded ? 'h-[75vh]' : 'h-72'
    }`}>
      {/* Tab Navigation Header Bar */}
      <div className="h-9 bg-[#0a0f1a] border-b border-slate-800 px-3 flex items-center justify-between select-none">
        <div className="flex items-center space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setActiveTab(tab.id);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg text-xs font-mono font-medium transition-all ${
                activeTab === tab.id && !isCollapsed
                  ? 'bg-[#080d16] text-cyan-400 border-t-2 border-cyan-400 shadow-[0_-2px_8px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-800 text-cyan-300">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Window Controls (Expand / Collapse) */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isExpanded ? 'Restore Panel Height' : 'Maximize Panel'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'terminal' && <Terminal />}
          {activeTab === 'inspector' && <Inspector />}
          {activeTab === 'packetSimulator' && <PacketSimulator />}
          {activeTab === 'logs' && <Logs />}
        </div>
      )}
    </div>
  );
}
