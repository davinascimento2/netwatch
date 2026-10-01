import {
  NetworkDevice,
  NetworkConnection,
  Packet,
  PacketProtocol,
  PingResult,
  TracerouteHop,
  LogEntry
} from '../types';
import { dijkstraShortestPath, isSameSubnet } from '../utils/networkUtils';

export class NetworkService {
  /**
   * Resolves a domain name to an IP using any DNS server devices in the topology.
   */
  static resolveDns(devices: NetworkDevice[], domain: string): string | null {
    const cleanDomain = domain.toLowerCase().trim();
    for (const dev of devices) {
      if (dev.dnsRecords && dev.dnsRecords.length > 0) {
        const match = dev.dnsRecords.find(r => r.domain.toLowerCase() === cleanDomain);
        if (match) return match.ip;
      }
    }
    // Default fallback well-known mock records
    if (cleanDomain === 'google.com' || cleanDomain === 'www.google.com') return '142.250.190.46';
    if (cleanDomain === 'github.com') return '140.82.121.4';
    if (cleanDomain === 'local.server') return '192.168.1.100';
    return null;
  }

  /**
   * Evaluates if a firewall device permits a packet based on its rules.
   */
  static evaluateFirewall(firewall: NetworkDevice, packet: Packet): { allowed: boolean; ruleDescription?: string } {
    if (!firewall.firewallRules || firewall.firewallRules.length === 0) {
      return { allowed: true };
    }

    for (const rule of firewall.firewallRules) {
      const matchProto = rule.protocol === 'ALL' || rule.protocol === packet.protocol;
      if (!matchProto) continue;

      // In real simulation, check IP match
      if (rule.action === 'DENY') {
        return { allowed: false, ruleDescription: rule.description };
      }
      if (rule.action === 'ALLOW') {
        return { allowed: true, ruleDescription: rule.description };
      }
    }

    return { allowed: true };
  }

  /**
   * Checks if VLAN isolation permits direct communication without a router.
   */
  static checkVlanIsolation(src: NetworkDevice, dst: NetworkDevice, path: NetworkDevice[]): boolean {
    if (src.vlanId === dst.vlanId) return true;
    // Cross-VLAN requires at least one router in the path to perform inter-VLAN routing
    const hasRouter = path.some(d => d.type === 'router');
    return hasRouter;
  }

  /**
   * Generates a packet and calculates its path.
   */
  static createPacket(
    devices: NetworkDevice[],
    connections: NetworkConnection[],
    sourceId: string,
    targetId: string,
    protocol: PacketProtocol = 'ICMP',
    payload: string = 'ECHO_REQUEST',
    sizeBytes: number = 64
  ): { packet: Packet | null; error?: string } {
    const src = devices.find(d => d.id === sourceId);
    const dst = devices.find(d => d.id === targetId);

    if (!src || !dst) return { packet: null, error: 'Source or destination device not found' };
    if (src.status === 'offline') return { packet: null, error: `${src.name} is powered OFF` };
    if (dst.status === 'offline') return { packet: null, error: `${dst.name} is powered OFF` };

    const pathIds = dijkstraShortestPath(devices, connections, sourceId, targetId);
    if (!pathIds || pathIds.length === 0) {
      return { packet: null, error: 'Destination host unreachable: No physical or logical route' };
    }

    const pathDevices = pathIds.map(id => devices.find(d => d.id === id)!).filter(Boolean);

    // Check VLAN compatibility
    if (!this.checkVlanIsolation(src, dst, pathDevices)) {
      return { packet: null, error: `VLAN Isolation: Cannot cross VLAN ${src.vlanId} to VLAN ${dst.vlanId} without a Router` };
    }

    const packet: Packet = {
      id: `pkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sourceId,
      targetId,
      protocol,
      sizeBytes,
      payload,
      path: pathIds,
      currentHopIndex: 0,
      status: 'in_transit',
      timestamp: Date.now()
    };

    return { packet };
  }

  /**
   * Simulates a standard 4-packet ICMP Ping with realistic timing and packet loss.
   */
  static simulatePing(
    devices: NetworkDevice[],
    connections: NetworkConnection[],
    sourceId: string,
    targetIpOrHost: string
  ): PingResult {
    let resolvedIp = targetIpOrHost;
    if (!/^\d+\.\d+\.\d+\.\d+$/.test(targetIpOrHost)) {
      const dnsIp = this.resolveDns(devices, targetIpOrHost);
      if (dnsIp) resolvedIp = dnsIp;
    }

    const targetDevice = devices.find(d => d.ip === resolvedIp);
    const sourceDevice = devices.find(d => d.id === sourceId);

    const details: { seq: number; bytes: number; timeMs: number; ttl: number }[] = [];

    if (!sourceDevice || !targetDevice || targetDevice.status === 'offline') {
      return {
        packetsSent: 4,
        packetsReceived: 0,
        packetLoss: 100,
        minLatency: 0,
        maxLatency: 0,
        avgLatency: 0,
        details: []
      };
    }

    const path = dijkstraShortestPath(devices, connections, sourceId, targetDevice.id);
    if (!path) {
      return {
        packetsSent: 4,
        packetsReceived: 0,
        packetLoss: 100,
        minLatency: 0,
        maxLatency: 0,
        avgLatency: 0,
        details: []
      };
    }

    // Calculate base path latency
    let baseLatency = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      const conn = connections.find(c => 
        (c.sourceDeviceId === u && c.targetDeviceId === v) || 
        (c.sourceDeviceId === v && c.targetDeviceId === u)
      );
      baseLatency += conn ? conn.latencyMs : 2;
    }

    const hopsCount = path.length;
    const ttl = Math.max(1, 64 - hopsCount + 1);

    let received = 0;
    const latencies: number[] = [];

    for (let seq = 1; seq <= 4; seq++) {
      // Add subtle random network jitter
      const jitter = (Math.random() * 2 - 1) * 1.5;
      const timeMs = Math.max(1, Math.round((baseLatency * 2 + jitter) * 10) / 10);
      
      // 98% delivery rate on good links
      const isLost = Math.random() < 0.02;
      if (!isLost) {
        received++;
        latencies.push(timeMs);
        details.push({ seq, bytes: 32, timeMs, ttl });
      }
    }

    const loss = Math.round(((4 - received) / 4) * 100);
    const minLatency = latencies.length ? Math.min(...latencies) : 0;
    const maxLatency = latencies.length ? Math.max(...latencies) : 0;
    const avgLatency = latencies.length ? Math.round((latencies.reduce((a, b) => a + b, 0) / latencies.length) * 10) / 10 : 0;

    return {
      packetsSent: 4,
      packetsReceived: received,
      packetLoss: loss,
      minLatency,
      maxLatency,
      avgLatency,
      details
    };
  }

  /**
   * Simulates hop-by-hop Traceroute.
   */
  static simulateTraceroute(
    devices: NetworkDevice[],
    connections: NetworkConnection[],
    sourceId: string,
    targetIpOrHost: string
  ): TracerouteHop[] {
    let resolvedIp = targetIpOrHost;
    if (!/^\d+\.\d+\.\d+\.\d+$/.test(targetIpOrHost)) {
      const dnsIp = this.resolveDns(devices, targetIpOrHost);
      if (dnsIp) resolvedIp = dnsIp;
    }

    const targetDevice = devices.find(d => d.ip === resolvedIp);
    if (!targetDevice) return [];

    const pathIds = dijkstraShortestPath(devices, connections, sourceId, targetDevice.id);
    if (!pathIds) return [];

    const hops: TracerouteHop[] = [];
    let accumulatedLatency = 0;

    for (let i = 0; i < pathIds.length; i++) {
      const currentId = pathIds[i];
      const dev = devices.find(d => d.id === currentId);
      if (!dev) continue;

      if (i > 0) {
        const prevId = pathIds[i - 1];
        const conn = connections.find(c => 
          (c.sourceDeviceId === prevId && c.targetDeviceId === currentId) ||
          (c.sourceDeviceId === currentId && c.targetDeviceId === prevId)
        );
        accumulatedLatency += (conn?.latencyMs || 2) + Math.random() * 1.5;
      }

      hops.push({
        hop: i + 1,
        deviceId: dev.id,
        deviceName: dev.name,
        ip: dev.ip,
        latencyMs: Math.round(accumulatedLatency * 10) / 10,
        status: dev.status === 'offline' ? 'timeout' : 'ok'
      });
    }

    return hops;
  }
}
