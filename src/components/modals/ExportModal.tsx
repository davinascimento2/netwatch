import React, { useState } from 'react';
import { X, Download, Upload, Copy, Check } from 'lucide-react';
import { useNetworkStore } from '../../store/networkStore';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { exportJson, importJson } = useNetworkStore();
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentJson = exportJson();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netwatch-topology-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setErrorMsg('');
    if (!importText.trim()) return;
    const success = importJson(importText.trim());
    if (success) {
      onClose();
    } else {
      setErrorMsg('Invalid topology JSON format. Please verify structure.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        setImportText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl rounded-2xl bg-[#090e18] border border-cyan-500/40 shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0e1626] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 font-display uppercase tracking-wider">
              Topology Export & Import
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 font-mono text-xs">
          {/* Export Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Current Topology JSON</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={currentJson}
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none custom-scrollbar text-[11px]"
            />
          </div>

          {/* Import Section */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Import Custom Topology</label>
              <label className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <textarea
              placeholder="Paste JSON topology here to load..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 custom-scrollbar text-[11px]"
            />

            {errorMsg && (
              <p className="text-rose-400 text-xs font-semibold">{errorMsg}</p>
            )}

            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              Apply Imported Topology
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
