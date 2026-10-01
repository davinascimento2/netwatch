import React, { useState, useEffect } from 'react';
import { Toolbar } from './components/toolbar/Toolbar';
import { Sidebar } from './components/sidebar/Sidebar';
import { NetworkCanvas } from './components/canvas/NetworkCanvas';
import { BottomPanel } from './components/bottomPanel/BottomPanel';
import { PacketModal } from './components/modals/PacketModal';
import { ExportModal } from './components/modals/ExportModal';
import { HelpModal } from './components/modals/HelpModal';
import { useNetworkStore } from './store/networkStore';
import { sound } from './utils/audio';

export function App() {
  const { 
    crtEffect, 
    autoTraffic, 
    devices, 
    sendPacket, 
    stepPackets,
    undo,
    redo,
    saveTopology
  } = useNetworkStore();

  const [isPacketModalOpen, setIsPacketModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Keyboard Shortcuts (Undo, Redo, Save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveTopology();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveTopology]);

  // Periodic Packet Progression (Hop Stepper)
  useEffect(() => {
    const timer = setInterval(() => {
      stepPackets();
    }, 1200);

    return () => clearInterval(timer);
  }, [stepPackets]);

  // Auto-Traffic Simulation (Living Network Activity)
  useEffect(() => {
    if (!autoTraffic) return;

    const interval = setInterval(() => {
      const onlineDevices = devices.filter(d => d.status === 'online');
      if (onlineDevices.length < 2) return;

      const randomSrc = onlineDevices[Math.floor(Math.random() * onlineDevices.length)];
      const otherDevices = onlineDevices.filter(d => d.id !== randomSrc.id);
      if (otherDevices.length === 0) return;

      const randomDst = otherDevices[Math.floor(Math.random() * otherDevices.length)];
      const protos = ['ICMP', 'HTTP', 'DNS', 'TCP'] as const;
      const proto = protos[Math.floor(Math.random() * protos.length)];

      sendPacket(randomSrc.id, randomDst.id, proto, `AUTO_${proto}_TELEMETRY`);
    }, 4500);

    return () => clearInterval(interval);
  }, [autoTraffic, devices, sendPacket]);

  // Initial boot sound on first user gesture
  useEffect(() => {
    const handleFirstClick = () => {
      sound.playBootSound();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#06090e] text-slate-100 overflow-hidden font-sans">
      {/* Top Cyber Navigation Bar */}
      <Toolbar 
        onOpenPacketModal={() => setIsPacketModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Device Palette) */}
        <Sidebar />

        {/* Central Network Visualization Canvas */}
        <main className="flex-1 h-full relative overflow-hidden">
          <NetworkCanvas />
        </main>
      </div>

      {/* Bottom Telemetry Panel (Dashboard, CLI Terminal, Inspector, Logs) */}
      <BottomPanel />

      {/* Retro CRT Scanline Overlay Effect */}
      {crtEffect && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-70" />
          <div className="absolute inset-0 bg-radial-vignette opacity-40 pointer-events-none" />
        </div>
      )}

      {/* Modals */}
      <PacketModal
        isOpen={isPacketModalOpen}
        onClose={() => setIsPacketModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}

export default App;
