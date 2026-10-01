import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info 
} from 'lucide-react';
import { useNetworkStore } from '../../store/networkStore';
import { LogEntry } from '../../types';

export function Logs() {
  const { logs, clearLogs } = useNetworkStore();
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => {
    if (filterLevel !== 'ALL' && log.level !== filterLevel.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchSrc = log.source.toLowerCase().includes(q);
      const matchDst = log.target?.toLowerCase().includes(q);
      const matchProto = log.protocol?.toLowerCase().includes(q);
      return matchMsg || matchSrc || matchDst || matchProto;
    }
    return true;
  });

  const handleDownloadLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netwatch-telemetry-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return (
          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>SUCCESS</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            <span>ERROR</span>
          </span>
        );
      case 'warn':
        return (
          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>WARN</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
            <Info className="w-3 h-3" />
            <span>INFO</span>
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#070a10] select-none">
      {/* Top Filter Bar */}
      <div className="px-4 py-2 bg-[#090e18] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Telemetry Event Stream
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
            {filteredLogs.length} Events
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 w-36 sm:w-48"
            />
          </div>

          {/* Level Filter Buttons */}
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[10px] font-mono">
            {['ALL', 'INFO', 'SUCCESS', 'WARN', 'ERROR'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterLevel === lvl
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Actions */}
          <button
            onClick={handleDownloadLogs}
            className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={clearLogs}
            className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-xs">
            NO LOG ENTRIES RECORDED
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className="flex items-start justify-between p-2 rounded bg-[#0b101a]/70 border border-slate-800/60 hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-start space-x-3 min-w-0">
                <span className="text-[10px] text-slate-500 flex-shrink-0 pt-0.5">
                  {log.timestamp}
                </span>
                {getLevelBadge(log.level)}
                {log.protocol && (
                  <span className="px-1 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 font-bold flex-shrink-0">
                    {log.protocol}
                  </span>
                )}
                <span className="text-slate-400 font-semibold truncate flex-shrink-0">
                  [{log.source}]
                </span>
                <span className="text-slate-200 break-all">
                  {log.message}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
