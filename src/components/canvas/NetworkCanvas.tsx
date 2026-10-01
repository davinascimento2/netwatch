import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useNetworkStore } from '../../store/networkStore';
import { DeviceNode } from './DeviceNode';
import { CustomEdge } from './CustomEdge';
import { DeviceType } from '../../types';

const nodeTypes = {
  deviceNode: DeviceNode
};

const edgeTypes = {
  customEdge: CustomEdge
};

function InnerNetworkCanvas() {
  const { 
    devices, 
    connections, 
    selectedDeviceId, 
    selectedConnectionId, 
    selectDevice, 
    selectConnection, 
    updateDevice, 
    addConnection,
    addDevice,
    activePackets
  } = useNetworkStore();

  const { screenToFlowPosition } = useReactFlow();

  // Map Zustand devices to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    return devices.map(d => ({
      id: d.id,
      type: 'deviceNode',
      position: { x: d.x, y: d.y },
      data: d as unknown as Record<string, unknown>,
      selected: d.id === selectedDeviceId
    }));
  }, [devices, selectedDeviceId]);

  // Map Zustand connections to React Flow edges
  const edges: Edge[] = useMemo(() => {
    return connections.map(c => {
      // Check if any active packet is currently traversing this link
      const isTraversing = activePackets.some(pkt => {
        const u = pkt.path[pkt.currentHopIndex];
        const v = pkt.path[pkt.currentHopIndex + 1];
        return (c.sourceDeviceId === u && c.targetDeviceId === v) ||
               (c.sourceDeviceId === v && c.targetDeviceId === u);
      });

      return {
        id: c.id,
        source: c.sourceDeviceId,
        target: c.targetDeviceId,
        type: 'customEdge',
        selected: c.id === selectedConnectionId,
        animated: isTraversing || c.status === 'active',
        data: c as unknown as Record<string, unknown>
      };
    });
  }, [connections, selectedConnectionId, activePackets]);

  // Handle connection drag between handles
  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      addConnection(connection.source, connection.target);
    }
  }, [addConnection]);

  // Sync position after node drag ends
  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    updateDevice(node.id, { x: node.position.x, y: node.position.y });
  }, [updateDevice]);

  // Handle Drop from sidebar palette onto canvas coordinates
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/netwatch-device-type') as DeviceType;
    if (!type) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    addDevice(type, Math.round(position.x), Math.round(position.y));
  }, [screenToFlowPosition, addDevice]);

  return (
    <div 
      className="w-full h-full relative bg-[#06090e] select-none"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={(_, node) => selectDevice(node.id)}
        onEdgeClick={(_, edge) => selectConnection(edge.id)}
        onPaneClick={() => {
          selectDevice(null);
          selectConnection(null);
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        className="netwatch-flow"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="rgba(56, 189, 248, 0.12)" 
        />
        
        <Controls 
          className="!bg-[#0c121d] !border !border-slate-800 !rounded-xl !p-1 !shadow-2xl [&>button]:!bg-transparent [&>button]:!border-b [&>button]:!border-slate-800/80 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-800/80 [&>button:hover]:!text-cyan-400"
          showInteractive={false}
        />

        <MiniMap
          nodeColor={(node) => {
            const dev = node.data as unknown as { type: DeviceType };
            if (dev?.type === 'cloud') return '#38bdf8';
            if (dev?.type === 'firewall') return '#f43f5e';
            if (dev?.type === 'router') return '#fbbf24';
            if (dev?.type === 'server') return '#10b981';
            return '#06b6d4';
          }}
          maskColor="rgba(6, 9, 14, 0.75)"
          className="!bg-[#0c121d] !border !border-slate-800 !rounded-xl !overflow-hidden !shadow-2xl"
        />
      </ReactFlow>

      {/* In-Flight Packet Counter Overlay */}
      {activePackets.length > 0 && (
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-[0_0_15px_rgba(0,240,255,0.3)] animate-pulse">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>{activePackets.length} PACKET(S) IN TRANSIT</span>
        </div>
      )}
    </div>
  );
}

export function NetworkCanvas() {
  return (
    <ReactFlowProvider>
      <InnerNetworkCanvas />
    </ReactFlowProvider>
  );
}
