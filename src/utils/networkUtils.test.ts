import { 
  isValidIp, 
  isValidSubnetMask, 
  ipToLong, 
  longToIp, 
  isSameSubnet, 
  calculateNetworkAddress, 
  calculateBroadcastAddress,
  generateMacAddress,
  dijkstraShortestPath
} from './networkUtils';
import { NetworkDevice, NetworkConnection } from '../types';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${msg}`);
}

console.log('--- Running NetWatch Utility Tests ---');

// IP validation
assert(isValidIp('192.168.1.1'), 'Valid IP 192.168.1.1');
assert(isValidIp('10.0.0.1'), 'Valid IP 10.0.0.1');
assert(!isValidIp('256.1.1.1'), 'Invalid IP 256.1.1.1');
assert(!isValidIp('192.168.1'), 'Invalid incomplete IP');
assert(!isValidIp('not-an-ip'), 'Invalid string');

// Subnet validation
assert(isValidSubnetMask('255.255.255.0'), 'Valid mask /24');
assert(isValidSubnetMask('255.255.0.0'), 'Valid mask /16');
assert(isValidSubnetMask('255.0.0.0'), 'Valid mask /8');
assert(!isValidSubnetMask('255.255.255.1'), 'Invalid subnet mask');

// Conversion
const ip = '192.168.1.100';
assert(longToIp(ipToLong(ip)) === ip, 'ipToLong and longToIp roundtrip');

// Subnet containment
assert(isSameSubnet('192.168.1.10', '192.168.1.50', '255.255.255.0'), 'Same /24 subnet');
assert(!isSameSubnet('192.168.1.10', '192.168.2.10', '255.255.255.0'), 'Different subnets');

// Network and Broadcast
assert(calculateNetworkAddress('192.168.1.50', '255.255.255.0') === '192.168.1.0', 'Network calculation');
assert(calculateBroadcastAddress('192.168.1.50', '255.255.255.0') === '192.168.1.255', 'Broadcast calculation');

// MAC Address
const mac = generateMacAddress();
assert(/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(mac), `Generated valid MAC format: ${mac}`);

// Dijkstra Algorithm
const mockDevices: NetworkDevice[] = [
  { id: 'dev-1', name: 'PC1', type: 'pc', ip: '192.168.1.10', mac: '00:11:22:33:44:55', subnetMask: '255.255.255.0', gateway: '192.168.1.1', dnsServer: '8.8.8.8', vlanId: 1, status: 'online', isDhcpClient: false, x: 0, y: 0 },
  { id: 'dev-2', name: 'Switch1', type: 'switch', ip: '192.168.1.2', mac: '00:11:22:33:44:66', subnetMask: '255.255.255.0', gateway: '192.168.1.1', dnsServer: '8.8.8.8', vlanId: 1, status: 'online', isDhcpClient: false, x: 100, y: 0 },
  { id: 'dev-3', name: 'Server1', type: 'server', ip: '192.168.1.100', mac: '00:11:22:33:44:77', subnetMask: '255.255.255.0', gateway: '192.168.1.1', dnsServer: '8.8.8.8', vlanId: 1, status: 'online', isDhcpClient: false, x: 200, y: 0 },
];

const mockConnections: NetworkConnection[] = [
  { id: 'c1', sourceDeviceId: 'dev-1', targetDeviceId: 'dev-2', bandwidthMbps: 1000, latencyMs: 2, packetLossRate: 0, cableType: 'ethernet', status: 'active' },
  { id: 'c2', sourceDeviceId: 'dev-2', targetDeviceId: 'dev-3', bandwidthMbps: 1000, latencyMs: 3, packetLossRate: 0, cableType: 'ethernet', status: 'active' },
];

const path = dijkstraShortestPath(mockDevices, mockConnections, 'dev-1', 'dev-3');
assert(path !== null && path.length === 3, 'Shortest path found');
assert(path?.[0] === 'dev-1' && path?.[1] === 'dev-2' && path?.[2] === 'dev-3', 'Correct hop order');

console.log('🎉 ALL NETWATCH TESTS PASSED!');
