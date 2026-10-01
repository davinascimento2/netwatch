import React, { memo } from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getSmoothStepPath, 
  EdgeProps 
} from '@xyflow/react';
import { NetworkConnection } from '../../types';

export const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16
  });

  const conn = data as unknown as NetworkConnection | undefined;
  const isWifi = conn?.cableType === 'wifi';
  const isFiber = conn?.cableType === 'fiber';

  let strokeColor = '#38bdf8'; // Default cyan ethernet
  if (isWifi) strokeColor = '#10b981'; // Emerald wifi
  if (isFiber) strokeColor = '#c084fc'; // Purple fiber
  if (conn?.status === 'down') strokeColor = '#ef4444'; // Red down

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3.5 : 2,
          stroke: selected ? '#00f0ff' : strokeColor,
          strokeDasharray: isWifi ? '5 5' : (conn?.status === 'degraded' ? '8 4' : undefined),
          filter: selected ? 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.7))' : undefined,
          transition: 'all 0.2s ease'
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-tight transition-all duration-150 border select-none ${
            selected
              ? 'bg-slate-900 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
              : 'bg-[#090e17]/90 text-slate-400 border-slate-800/80 hover:border-slate-600 hover:text-slate-200'
          }`}
        >
          {conn ? (
            <span className="flex items-center space-x-1">
              <span>{conn.latencyMs}ms</span>
              <span className="text-slate-600">•</span>
              <span>{conn.bandwidthMbps >= 1000 ? `${conn.bandwidthMbps / 1000}G` : `${conn.bandwidthMbps}M`}</span>
            </span>
          ) : (
            'Link'
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
