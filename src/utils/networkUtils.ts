import { NetworkDevice, NetworkConnection } from '../types';

export function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && (part === '0' || !part.startsWith('0'));
  });
}

export function isValidSubnetMask(mask: string): boolean {
  if (!isValidIp(mask)) return false;
  const long = ipToLong(mask);
  // A valid subnet mask in binary consists of a sequence of 1s followed by 0s
  const inverted = (~long) >>> 0;
  return ((inverted + 1) & inverted) === 0;
}

export function ipToLong(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

export function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255,
  ].join('.');
}

export function isSameSubnet(ip1: string, ip2: string, mask: string): boolean {
  if (!isValidIp(ip1) || !isValidIp(ip2) || !isValidIp(mask)) return false;
  const m = ipToLong(mask);
  return (ipToLong(ip1) & m) === (ipToLong(ip2) & m);
}

export function calculateNetworkAddress(ip: string, mask: string): string {
  if (!isValidIp(ip) || !isValidIp(mask)) return ip;
  return longToIp((ipToLong(ip) & ipToLong(mask)) >>> 0);
}

export function calculateBroadcastAddress(ip: string, mask: string): string {
  if (!isValidIp(ip) || !isValidIp(mask)) return ip;
  const net = ipToLong(ip) & ipToLong(mask);
  const inv = (~ipToLong(mask)) >>> 0;
  return longToIp((net | inv) >>> 0);
}

export function generateMacAddress(): string {
  const hex = '0123456789ABCDEF';
  const pairs: string[] = [];
  for (let i = 0; i < 6; i++) {
    pairs.push(hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)]);
  }
  // Ensure unicast and locally administered
  const first = parseInt(pairs[0], 16) | 0x02;
  pairs[0] = first.toString(16).toUpperCase().padStart(2, '0');
  return pairs.join(':');
}

export function generateRandomIp(subnetPrefix: string = '192.168.1'): string {
  const host = Math.floor(Math.random() * 200) + 10;
  return `${subnetPrefix}.${host}`;
}

/**
 * Dijkstra algorithm to compute the shortest weighted path between devices.
 * Edge weights consider connection latency and degraded links.
 */
export function dijkstraShortestPath(
  devices: NetworkDevice[],
  connections: NetworkConnection[],
  sourceId: string,
  targetId: string
): string[] | null {
  if (sourceId === targetId) return [sourceId];

  const deviceMap = new Map<string, NetworkDevice>();
  devices.forEach(d => deviceMap.set(d.id, d));

  const sourceDevice = deviceMap.get(sourceId);
  const targetDevice = deviceMap.get(targetId);

  if (!sourceDevice || !targetDevice) return null;
  if (sourceDevice.status === 'offline' || targetDevice.status === 'offline') return null;

  // Build adjacency graph
  const adj = new Map<string, { neighborId: string; weight: number }[]>();
  devices.forEach(d => adj.set(d.id, []));

  connections.forEach(conn => {
    if (conn.status === 'down') return;

    const u = conn.sourceDeviceId;
    const v = conn.targetDeviceId;
    const devU = deviceMap.get(u);
    const devV = deviceMap.get(v);

    if (!devU || !devV) return;
    if (devU.status === 'offline' || devV.status === 'offline') return;

    // Weight is latency + penalty for degraded connection
    let weight = conn.latencyMs || 5;
    if (conn.status === 'degraded') weight += 50;

    adj.get(u)?.push({ neighborId: v, weight });
    adj.get(v)?.push({ neighborId: u, weight });
  });

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  devices.forEach(d => {
    distances.set(d.id, Infinity);
    previous.set(d.id, null);
    unvisited.add(d.id);
  });

  distances.set(sourceId, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let currentId: string | null = null;
    let smallestDist = Infinity;

    unvisited.forEach(nodeId => {
      const dist = distances.get(nodeId) ?? Infinity;
      if (dist < smallestDist) {
        smallestDist = dist;
        currentId = nodeId;
      }
    });

    if (currentId === null || smallestDist === Infinity) break;
    if (currentId === targetId) break;

    unvisited.delete(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const { neighborId, weight } of neighbors) {
      if (!unvisited.has(neighborId)) continue;

      const alt = smallestDist + weight;
      if (alt < (distances.get(neighborId) ?? Infinity)) {
        distances.set(neighborId, alt);
        previous.set(neighborId, currentId);
      }
    }
  }

  // Reconstruct path
  if ((distances.get(targetId) ?? Infinity) === Infinity) {
    return null; // No path found
  }

  const path: string[] = [];
  let curr: string | null = targetId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous.get(curr) ?? null;
  }

  return path;
}
