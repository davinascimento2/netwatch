import { create } from 'zustand';
import { 
  NetworkDevice, 
  NetworkConnection, 
  Packet, 
  LogEntry, 
  DeviceType,
  PacketProtocol
} from '../types';
import { generateMacAddress, generateRandomIp } from '../utils/networkUtils';
import { NetworkService } from '../network/networkService';
import { sound } from '../utils/audio';

interface HistoryState {
  devices: NetworkDevice[];
  connections: NetworkConnection[];
}

export interface NetworkStoreState {
  devices: NetworkDevice[];
  connections: NetworkConnection[];
  selectedDeviceId: string | null;
  selectedConnectionId: string | null;
  logs: LogEntry[];
  activePackets: Packet[];
  
  // UI & Experience Controls
  activeTab: 'dashboard' | 'terminal' | 'inspector' | 'logs' | 'packetSimulator';
  soundEnabled: boolean;
  crtEffect: boolean;
  autoTraffic: boolean;
  
  // History for Undo/Redo
  past: HistoryState[];
  future: HistoryState[];

  // Actions
  addDevice: (type: DeviceType, x?: number, y?: number) => string;
  updateDevice: (id: string, updates: Partial<NetworkDevice>) => void;
  removeDevice: (id: string) => void;
  selectDevice: (id: string | null) => void;

  addConnection: (sourceId: string, targetId: string, bandwidth?: number, latency?: number) => void;
  updateConnection: (id: string, updates: Partial<NetworkConnection>) => void;
  removeConnection: (id: string) => void;
  selectConnection: (id: string | null) => void;

  sendPacket: (sourceId: string, targetId: string, protocol?: PacketProtocol, payload?: string) => boolean;
  stepPackets: () => void;

  addLog: (level: LogEntry['level'], source: string, message: string, target?: string, protocol?: string) => void;
  clearLogs: () => void;

  setActiveTab: (tab: NetworkStoreState['activeTab']) => void;
  toggleSound: () => void;
  toggleCrt: () => void;
  toggleAutoTraffic: () => void;

  loadPreset: (presetId: string) => void;
  saveTopology: () => void;
  loadTopology: () => boolean;
  exportJson: () => string;
  importJson: (json: string) => boolean;
  resetTopology: () => void;

  undo: () => void;
  redo: () => void;
}

const DEFAULT_DEVICES: NetworkDevice[] = [
  {
    id: 'cloud-1',
    name: 'Internet Gateway',
    type: 'cloud',
    ip: '8.8.8.8',
    mac: '00:00:5E:00:53:01',
    subnetMask: '255.255.255.0',
    gateway: '8.8.8.1',
    dnsServer: '8.8.8.8',
    vlanId: 1,
    status: 'online',
    isDhcpClient: false,
    x: 480,
    y: 40
  },
  {
    id: 'fw-1',
    name: 'Perimeter Firewall',
    type: 'firewall',
    ip: '192.168.1.3',
    mac: '00:00:5E:00:53:02',
    subnetMask: '255.255.255.0',
    gateway: '8.8.8.8',
    dnsServer: '8.8.8.8',
    vlanId: 1,
    status: 'online',
    isDhcpClient: false,
    firewallRules: [
      { id: 'r1', action: 'ALLOW', protocol: 'HTTP', sourceIp: 'ANY', targetIp: '192.168.1.100', port: 80, description: 'Allow Public Web Traffic' },
      { id: 'r2', action: 'ALLOW', protocol: 'DNS', sourceIp: 'ANY', targetIp: '192.168.1.100', port: 53, description: 'Allow DNS Inquiries' },
      { id: 'r3', action: 'ALLOW', protocol: 'ICMP', sourceIp: 'ANY', targetIp: 'ANY', description: 'Allow ICMP Echo Ping' }
    ],
    x: 480,
    y: 160
  },
  {
    id: 'router-1',
    name: 'Core Router (RT-01)',
    type: 'router',
    ip: '192.168.1.1',
    mac: '00:1A:2B:3C:4D:01',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.3',
    dnsServer: '192.168.1.100',
    vlanId: 1,
    status: 'online',
    isDhcpClient: false,
    routingTable: [
      { id: 'rt1', destination: '0.0.0.0/0', gateway: '192.168.1.3', interfaceName: 'eth0', metric: 1 },
      { id: 'rt2', destination: '192.168.1.0/24', gateway: '192.168.1.1', interfaceName: 'eth1', metric: 0 }
    ],
    x: 480,
    y: 280
  },
  {
    id: 'switch-1',
    name: 'Main Distribution Switch',
    type: 'switch',
    ip: '192.168.1.2',
    mac: '00:1A:2B:3C:4D:02',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dnsServer: '192.168.1.100',
    vlanId: 1,
    status: 'online',
    isDhcpClient: false,
    x: 480,
    y: 410
  },
  {
    id: 'srv-1',
    name: 'Web & DNS Server',
    type: 'server',
    ip: '192.168.1.100',
    mac: '00:1A:2B:3C:4D:10',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dnsServer: '127.0.0.1',
    vlanId: 1,
    status: 'online',
    isDhcpClient: false,
    dnsRecords: [
      { id: 'd1', domain: 'netwatch.internal', ip: '192.168.1.100', type: 'A', ttl: 3600 },
      { id: 'd2', domain: 'db.internal', ip: '192.168.1.150', type: 'A', ttl: 3600 },
      { id: 'd3', domain: 'gateway.internal', ip: '192.168.1.1', type: 'A', ttl: 3600 }
    ],
    x: 180,
    y: 350
  },
  {
    id: 'db-1',
    name: 'Database Cluster',
    type: 'database',
    ip: '192.168.1.150',
    mac: '00:1A:2B:3C:4D:11',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dnsServer: '192.168.1.100',
    vlanId: 1,
    status: 'online',
    isDhcpClient: false,
    x: 180,
    y: 490
  },
  {
    id: 'ap-1',
    name: 'Wi-Fi Access Point',
    type: 'access_point',
    ip: '192.168.1.4',
    mac: '00:1A:2B:3C:4D:04',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dnsServer: '192.168.1.100',
    vlanId: 1,
    status: 'online',
    isDhcpClient: false,
    x: 780,
    y: 350
  },
  {
    id: 'pc-1',
    name: 'Dev Station (PC-01)',
    type: 'pc',
    ip: '192.168.1.10',
    mac: '00:1A:2B:3C:4D:21',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dnsServer: '192.168.1.100',
    vlanId: 1,
    status: 'online',
    isDhcpClient: true,
    x: 360,
    y: 560
  },
  {
    id: 'pc-2',
    name: 'Admin Station (PC-02)',
    type: 'pc',
    ip: '192.168.1.11',
    mac: '00:1A:2B:3C:4D:22',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dnsServer: '192.168.1.100',
    vlanId: 1,
    status: 'online',
    isDhcpClient: true,
    x: 580,
    y: 560
  },
  {
    id: 'laptop-1',
    name: 'Executive Laptop',
    type: 'laptop',
    ip: '192.168.1.20',
    mac: '00:1A:2B:3C:4D:30',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dnsServer: '192.168.1.100',
    vlanId: 1,
    status: 'online',
    isDhcpClient: true,
    x: 780,
    y: 490
  },
  {
    id: 'prn-1',
    name: 'Office LaserJet',
    type: 'printer',
    ip: '192.168.1.30',
    mac: '00:1A:2B:3C:4D:40',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dnsServer: '192.168.1.100',
    vlanId: 1,
    status: 'online',
    isDhcpClient: false,
    x: 780,
    y: 620
  }
];

const DEFAULT_CONNECTIONS: NetworkConnection[] = [
  { id: 'c-cloud-fw', sourceDeviceId: 'cloud-1', targetDeviceId: 'fw-1', bandwidthMbps: 10000, latencyMs: 12, packetLossRate: 0, cableType: 'fiber', status: 'active' },
  { id: 'c-fw-rt', sourceDeviceId: 'fw-1', targetDeviceId: 'router-1', bandwidthMbps: 1000, latencyMs: 1, packetLossRate: 0, cableType: 'ethernet', status: 'active' },
  { id: 'c-rt-sw', sourceDeviceId: 'router-1', targetDeviceId: 'switch-1', bandwidthMbps: 1000, latencyMs: 1, packetLossRate: 0, cableType: 'ethernet', status: 'active' },
  { id: 'c-sw-srv', sourceDeviceId: 'switch-1', targetDeviceId: 'srv-1', bandwidthMbps: 1000, latencyMs: 1, packetLossRate: 0, cableType: 'ethernet', status: 'active' },
  { id: 'c-srv-db', sourceDeviceId: 'srv-1', targetDeviceId: 'db-1', bandwidthMbps: 10000, latencyMs: 0.5, packetLossRate: 0, cableType: 'fiber', status: 'active' },
  { id: 'c-sw-ap', sourceDeviceId: 'switch-1', targetDeviceId: 'ap-1', bandwidthMbps: 1000, latencyMs: 2, packetLossRate: 0, cableType: 'ethernet', status: 'active' },
  { id: 'c-sw-pc1', sourceDeviceId: 'switch-1', targetDeviceId: 'pc-1', bandwidthMbps: 1000, latencyMs: 1, packetLossRate: 0, cableType: 'ethernet', status: 'active' },
  { id: 'c-sw-pc2', sourceDeviceId: 'switch-1', targetDeviceId: 'pc-2', bandwidthMbps: 1000, latencyMs: 1, packetLossRate: 0, cableType: 'ethernet', status: 'active' },
  { id: 'c-ap-laptop', sourceDeviceId: 'ap-1', targetDeviceId: 'laptop-1', bandwidthMbps: 300, latencyMs: 6, packetLossRate: 0, cableType: 'wifi', status: 'active' },
  { id: 'c-sw-prn', sourceDeviceId: 'switch-1', targetDeviceId: 'prn-1', bandwidthMbps: 100, latencyMs: 3, packetLossRate: 0, cableType: 'ethernet', status: 'active' }
];

export const useNetworkStore = create<NetworkStoreState>((set, get) => ({
  devices: DEFAULT_DEVICES,
  connections: DEFAULT_CONNECTIONS,
  selectedDeviceId: 'pc-1',
  selectedConnectionId: null,
  logs: [
    {
      id: 'log-init-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      source: 'SYSTEM',
      message: 'NetWatch Cyberpunk Telemetry Engine initialized. Topology loaded.'
    },
    {
      id: 'log-init-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'success',
      source: 'Perimeter Firewall',
      message: 'Firewall rules compiled and active. Interface eth0 listening.'
    }
  ],
  activePackets: [],
  activeTab: 'dashboard',
  soundEnabled: true,
  crtEffect: false,
  autoTraffic: true,
  past: [],
  future: [],

  addDevice: (type: DeviceType, x = 300, y = 300) => {
    const state = get();
    sound.playClick();

    // Snapshot for undo
    const newPast = [...state.past, { devices: state.devices, connections: state.connections }];

    const id = `dev-${Date.now().toString(36)}`;
    const count = state.devices.filter(d => d.type === type).length + 1;
    const nameMap: Record<DeviceType, string> = {
      pc: `Workstation-${count}`,
      laptop: `Laptop-${count}`,
      server: `Server-${count}`,
      router: `Router-${count}`,
      switch: `Switch-${count}`,
      firewall: `Firewall-${count}`,
      access_point: `AP-${count}`,
      printer: `Printer-${count}`,
      database: `DB-Cluster-${count}`,
      cloud: `Cloud-GW-${count}`
    };

    const newDevice: NetworkDevice = {
      id,
      name: nameMap[type],
      type,
      ip: generateRandomIp('192.168.1'),
      mac: generateMacAddress(),
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServer: '192.168.1.100',
      vlanId: 1,
      status: 'online',
      isDhcpClient: type === 'pc' || type === 'laptop',
      x,
      y
    };

    set({
      devices: [...state.devices, newDevice],
      selectedDeviceId: id,
      past: newPast,
      future: []
    });

    get().addLog('info', newDevice.name, `New ${type.toUpperCase()} deployed at IP ${newDevice.ip}`);
    return id;
  },

  updateDevice: (id: string, updates: Partial<NetworkDevice>) => {
    set(state => ({
      devices: state.devices.map(d => (d.id === id ? { ...d, ...updates } : d))
    }));
  },

  removeDevice: (id: string) => {
    const state = get();
    sound.playClick();
    const dev = state.devices.find(d => d.id === id);

    set({
      past: [...state.past, { devices: state.devices, connections: state.connections }],
      future: [],
      devices: state.devices.filter(d => d.id !== id),
      connections: state.connections.filter(c => c.sourceDeviceId !== id && c.targetDeviceId !== id),
      selectedDeviceId: state.selectedDeviceId === id ? null : state.selectedDeviceId
    });

    if (dev) {
      get().addLog('warn', dev.name, 'Device decommissioned from network topology');
    }
  },

  selectDevice: (id: string | null) => {
    if (id) sound.playClick();
    set({ selectedDeviceId: id, selectedConnectionId: null });
  },

  addConnection: (sourceId: string, targetId: string, bandwidth = 1000, latency = 2) => {
    if (sourceId === targetId) return;
    const state = get();

    // Check if already connected
    const exists = state.connections.some(
      c => (c.sourceDeviceId === sourceId && c.targetDeviceId === targetId) ||
           (c.sourceDeviceId === targetId && c.targetDeviceId === sourceId)
    );
    if (exists) return;

    sound.playClick();

    const srcDev = state.devices.find(d => d.id === sourceId);
    const dstDev = state.devices.find(d => d.id === targetId);

    const isWifi = srcDev?.type === 'access_point' || dstDev?.type === 'access_point' || 
                   srcDev?.type === 'laptop' || dstDev?.type === 'laptop';

    const newConnection: NetworkConnection = {
      id: `conn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sourceDeviceId: sourceId,
      targetDeviceId: targetId,
      bandwidthMbps: isWifi ? 300 : bandwidth,
      latencyMs: isWifi ? 6 : latency,
      packetLossRate: 0,
      cableType: isWifi ? 'wifi' : (bandwidth >= 10000 ? 'fiber' : 'ethernet'),
      status: 'active'
    };

    set({
      past: [...state.past, { devices: state.devices, connections: state.connections }],
      future: [],
      connections: [...state.connections, newConnection]
    });

    if (srcDev && dstDev) {
      get().addLog('info', 'LINK LAYER', `Physical link established: ${srcDev.name} ⟷ ${dstDev.name} (${newConnection.bandwidthMbps} Mbps)`);
    }
  },

  updateConnection: (id: string, updates: Partial<NetworkConnection>) => {
    set(state => ({
      connections: state.connections.map(c => (c.id === id ? { ...c, ...updates } : c))
    }));
  },

  removeConnection: (id: string) => {
    const state = get();
    sound.playClick();
    set({
      past: [...state.past, { devices: state.devices, connections: state.connections }],
      future: [],
      connections: state.connections.filter(c => c.id !== id),
      selectedConnectionId: state.selectedConnectionId === id ? null : state.selectedConnectionId
    });
  },

  selectConnection: (id: string | null) => {
    if (id) sound.playClick();
    set({ selectedConnectionId: id, selectedDeviceId: null });
  },

  sendPacket: (sourceId: string, targetId: string, protocol: PacketProtocol = 'ICMP', payload = 'DATA_PAYLOAD') => {
    const state = get();
    const result = NetworkService.createPacket(state.devices, state.connections, sourceId, targetId, protocol, payload);

    if (!result.packet) {
      sound.playPacketDrop();
      const src = state.devices.find(d => d.id === sourceId)?.name || 'UNKNOWN';
      get().addLog('error', src, result.error || 'Failed to dispatch packet', undefined, protocol);
      return false;
    }

    sound.playPacketTransmit();
    set(s => ({
      activePackets: [...s.activePackets, result.packet!]
    }));

    const srcDev = state.devices.find(d => d.id === sourceId);
    const dstDev = state.devices.find(d => d.id === targetId);

    get().addLog(
      'info',
      srcDev?.name || 'SRC',
      `Transmitted ${protocol} packet (${result.packet.sizeBytes} B) -> ${dstDev?.name} via [${result.packet.path.length} hops]`,
      dstDev?.name,
      protocol
    );

    return true;
  },

  stepPackets: () => {
    const state = get();
    if (state.activePackets.length === 0) return;

    const remainingPackets: Packet[] = [];

    state.activePackets.forEach(pkt => {
      const nextHopIndex = pkt.currentHopIndex + 1;

      if (nextHopIndex >= pkt.path.length) {
        // Packet arrived at destination!
        sound.playPacketDeliver();
        const dst = state.devices.find(d => d.id === pkt.targetId)?.name || 'TARGET';
        get().addLog('success', dst, `${pkt.protocol} packet delivered successfully`, undefined, pkt.protocol);
      } else {
        // Inspect device at current hop (e.g. firewall filtering)
        const currentDevId = pkt.path[nextHopIndex];
        const currentDev = state.devices.find(d => d.id === currentDevId);

        if (currentDev?.type === 'firewall') {
          const evalResult = NetworkService.evaluateFirewall(currentDev, pkt);
          if (!evalResult.allowed) {
            sound.playPacketDrop();
            get().addLog('error', currentDev.name, `Packet blocked by firewall rule: ${evalResult.ruleDescription || 'DENY'}`, undefined, pkt.protocol);
            return; // Dropped!
          }
        }

        remainingPackets.push({
          ...pkt,
          currentHopIndex: nextHopIndex
        });
      }
    });

    set({ activePackets: remainingPackets });
  },

  addLog: (level, source, message, target, protocol) => {
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      source,
      target,
      protocol,
      message
    };
    set(state => ({
      logs: [newEntry, ...state.logs.slice(0, 199)] // keep last 200 logs
    }));
  },

  clearLogs: () => {
    sound.playClick();
    set({ logs: [] });
  },

  setActiveTab: tab => {
    sound.playClick();
    set({ activeTab: tab });
  },

  toggleSound: () => {
    const current = get().soundEnabled;
    sound.enabled = !current;
    if (!current) sound.playClick();
    set({ soundEnabled: !current });
  },

  toggleCrt: () => {
    sound.playClick();
    set(s => ({ crtEffect: !s.crtEffect }));
  },

  toggleAutoTraffic: () => {
    sound.playClick();
    set(s => ({ autoTraffic: !s.autoTraffic }));
  },

  loadPreset: (presetId: string) => {
    sound.playClick();
    const state = get();
    const newPast = [...state.past, { devices: state.devices, connections: state.connections }];

    if (presetId === 'corporate') {
      set({
        devices: DEFAULT_DEVICES,
        connections: DEFAULT_CONNECTIONS,
        selectedDeviceId: 'pc-1',
        past: newPast,
        future: []
      });
      get().addLog('info', 'PRESET', 'Loaded Corporate HQ & Cloud Gateway topology');
    } else if (presetId === 'soho') {
      const sohoDevices: NetworkDevice[] = [
        { id: 'soho-rt', name: 'Home Gateway / Wi-Fi Router', type: 'router', ip: '192.168.0.1', mac: generateMacAddress(), subnetMask: '255.255.255.0', gateway: '8.8.8.8', dnsServer: '8.8.8.8', vlanId: 1, status: 'online', isDhcpClient: false, x: 450, y: 150 },
        { id: 'soho-pc', name: 'Desktop PC', type: 'pc', ip: '192.168.0.10', mac: generateMacAddress(), subnetMask: '255.255.255.0', gateway: '192.168.0.1', dnsServer: '192.168.0.1', vlanId: 1, status: 'online', isDhcpClient: true, x: 250, y: 360 },
        { id: 'soho-laptop', name: 'Living Room Laptop', type: 'laptop', ip: '192.168.0.25', mac: generateMacAddress(), subnetMask: '255.255.255.0', gateway: '192.168.0.1', dnsServer: '192.168.0.1', vlanId: 1, status: 'online', isDhcpClient: true, x: 500, y: 360 },
        { id: 'soho-prn', name: 'Wi-Fi Smart Printer', type: 'printer', ip: '192.168.0.50', mac: generateMacAddress(), subnetMask: '255.255.255.0', gateway: '192.168.0.1', dnsServer: '192.168.0.1', vlanId: 1, status: 'online', isDhcpClient: false, x: 720, y: 360 },
      ];
      const sohoConnections: NetworkConnection[] = [
        { id: 'sc-1', sourceDeviceId: 'soho-rt', targetDeviceId: 'soho-pc', bandwidthMbps: 1000, latencyMs: 1, packetLossRate: 0, cableType: 'ethernet', status: 'active' },
        { id: 'sc-2', sourceDeviceId: 'soho-rt', targetDeviceId: 'soho-laptop', bandwidthMbps: 300, latencyMs: 5, packetLossRate: 0, cableType: 'wifi', status: 'active' },
        { id: 'sc-3', sourceDeviceId: 'soho-rt', targetDeviceId: 'soho-prn', bandwidthMbps: 150, latencyMs: 8, packetLossRate: 0, cableType: 'wifi', status: 'active' },
      ];
      set({
        devices: sohoDevices,
        connections: sohoConnections,
        selectedDeviceId: 'soho-pc',
        past: newPast,
        future: []
      });
      get().addLog('info', 'PRESET', 'Loaded SOHO (Small Office / Home) topology');
    } else if (presetId === 'clean') {
      set({
        devices: [],
        connections: [],
        selectedDeviceId: null,
        selectedConnectionId: null,
        past: newPast,
        future: []
      });
      get().addLog('info', 'PRESET', 'Canvas cleared for custom topology design');
    }
  },

  saveTopology: () => {
    sound.playClick();
    const { devices, connections } = get();
    try {
      localStorage.setItem('netwatch_topology', JSON.stringify({ devices, connections }));
      get().addLog('success', 'STORAGE', 'Topology successfully saved to browser localStorage');
    } catch {
      get().addLog('error', 'STORAGE', 'Failed to save topology to localStorage');
    }
  },

  loadTopology: () => {
    sound.playClick();
    try {
      const raw = localStorage.getItem('netwatch_topology');
      if (!raw) {
        get().addLog('warn', 'STORAGE', 'No saved topology found in localStorage');
        return false;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.devices) && Array.isArray(parsed.connections)) {
        set({
          devices: parsed.devices,
          connections: parsed.connections,
          selectedDeviceId: parsed.devices[0]?.id || null
        });
        get().addLog('success', 'STORAGE', `Restored ${parsed.devices.length} devices and ${parsed.connections.length} connections`);
        return true;
      }
      return false;
    } catch {
      get().addLog('error', 'STORAGE', 'Corrupt topology data in localStorage');
      return false;
    }
  },

  exportJson: () => {
    sound.playClick();
    const { devices, connections } = get();
    return JSON.stringify({ version: '1.0.0', exportedAt: new Date().toISOString(), devices, connections }, null, 2);
  },

  importJson: (json: string) => {
    sound.playClick();
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data.devices) && Array.isArray(data.connections)) {
        const state = get();
        set({
          past: [...state.past, { devices: state.devices, connections: state.connections }],
          future: [],
          devices: data.devices,
          connections: data.connections,
          selectedDeviceId: data.devices[0]?.id || null
        });
        get().addLog('success', 'IMPORT', `Imported ${data.devices.length} devices and ${data.connections.length} connections from JSON`);
        return true;
      }
      return false;
    } catch {
      get().addLog('error', 'IMPORT', 'Failed to parse JSON topology format');
      return false;
    }
  },

  resetTopology: () => {
    get().loadPreset('corporate');
  },

  undo: () => {
    const { past, devices, connections, future } = get();
    if (past.length === 0) return;
    sound.playClick();

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      devices: previous.devices,
      connections: previous.connections,
      past: newPast,
      future: [{ devices, connections }, ...future]
    });
    get().addLog('info', 'HISTORY', 'Undo performed');
  },

  redo: () => {
    const { future, devices, connections, past } = get();
    if (future.length === 0) return;
    sound.playClick();

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      devices: next.devices,
      connections: next.connections,
      past: [...past, { devices, connections }],
      future: newFuture
    });
    get().addLog('info', 'HISTORY', 'Redo performed');
  }
}));
