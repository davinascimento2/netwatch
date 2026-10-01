export type DeviceType = 
  | 'pc'
  | 'laptop'
  | 'server'
  | 'router'
  | 'switch'
  | 'firewall'
  | 'access_point'
  | 'printer'
  | 'database'
  | 'cloud';

export type DeviceStatus = 'online' | 'offline' | 'busy' | 'warning';

export type CableType = 'ethernet' | 'fiber' | 'wifi';

export interface RouteEntry {
  id: string;
  destination: string; // e.g. "192.168.2.0/24" or "0.0.0.0/0"
  gateway: string;     // e.g. "192.168.1.1"
  interfaceName: string;
  metric: number;
}

export interface FirewallRule {
  id: string;
  action: 'ALLOW' | 'DENY';
  protocol: 'ALL' | 'ICMP' | 'TCP' | 'UDP' | 'DNS' | 'HTTP';
  sourceIp: string; // "ANY" or IP/CIDR
  targetIp: string; // "ANY" or IP/CIDR
  port?: number;    // specific port or undefined for any
  description: string;
}

export interface DnsRecord {
  id: string;
  domain: string;
  ip: string;
  type: 'A' | 'CNAME';
  ttl: number;
}

export interface ArpEntry {
  ip: string;
  mac: string;
  interfaceName: string;
  type: 'dynamic' | 'static';
}

export interface DhcpLease {
  ip: string;
  mac: string;
  hostname: string;
  expiresAt: number;
}

export interface DhcpConfig {
  enabled: boolean;
  poolStart: string;
  poolEnd: string;
  subnetMask: string;
  defaultGateway: string;
  dnsServer: string;
  leaseTimeSeconds: number;
  leases: DhcpLease[];
}

export interface NetworkDevice {
  id: string;
  name: string;
  type: DeviceType;
  ip: string;
  mac: string;
  subnetMask: string;
  gateway: string;
  dnsServer: string;
  vlanId: number;
  status: DeviceStatus;
  isDhcpClient: boolean;
  
  // Specific service configurations
  routingTable?: RouteEntry[];
  firewallRules?: FirewallRule[];
  dnsRecords?: DnsRecord[];
  dhcpConfig?: DhcpConfig;
  arpTable?: ArpEntry[];
  
  // Canvas coordinate storage
  x: number;
  y: number;
}

export interface NetworkConnection {
  id: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  bandwidthMbps: number; // 100, 1000, 10000
  latencyMs: number;     // e.g. 1ms - 50ms
  packetLossRate: number; // 0.0 - 1.0
  cableType: CableType;
  status: 'active' | 'degraded' | 'down';
}

export type PacketProtocol = 'ICMP' | 'TCP' | 'UDP' | 'DNS' | 'ARP' | 'DHCP' | 'HTTP';

export interface Packet {
  id: string;
  sourceId: string;
  targetId: string;
  protocol: PacketProtocol;
  sizeBytes: number;
  payload: string;
  path: string[];          // List of device IDs along the route
  currentHopIndex: number; // Current position in path
  status: 'in_transit' | 'delivered' | 'dropped';
  dropReason?: string;
  timestamp: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  source: string;
  target?: string;
  protocol?: PacketProtocol | string;
  message: string;
}

export interface PingResult {
  packetsSent: number;
  packetsReceived: number;
  packetLoss: number;
  minLatency: number;
  maxLatency: number;
  avgLatency: number;
  details: { seq: number; bytes: number; timeMs: number; ttl: number }[];
}

export interface TracerouteHop {
  hop: number;
  deviceId: string;
  deviceName: string;
  ip: string;
  latencyMs: number;
  status: 'ok' | 'timeout' | 'blocked';
}

export interface TopologyPreset {
  id: string;
  name: string;
  description: string;
  devices: NetworkDevice[];
  connections: NetworkConnection[];
}
