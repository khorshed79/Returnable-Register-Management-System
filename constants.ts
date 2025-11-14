import { User, Item, GatePass, Role, GatePassStatus, GatePassType, Requester, RequesterCategory } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Admin User', role: Role.Admin, email: 'admin@jabedagro.com' },
  { id: 'u2', name: 'Security Guard', role: Role.Security, email: 'security@jabedagro.com' },
  { id: 'u3', name: 'John Doe (Head)', role: Role.DepartmentHead, email: 'john.doe@jabedagro.com' },
  { id: 'u4', name: 'Jane Smith (Store)', role: Role.StoreOfficer, email: 'jane.smith@jabedagro.com' },
];

export const ITEMS: Item[] = [
  { id: 'i1', name: 'Laptop HP Probook', code: 'ITM-001', category: 'IT Equipment', unit: 'Pcs', department: 'IT', stock: 1 },
  { id: 'i2', name: 'Electric Motor 5HP', code: 'EQP-002', category: 'Machinery', unit: 'Pcs', department: 'Maintenance', stock: 1 },
  { id: 'i3', name: 'Seed Bag (50kg)', code: 'RAW-003', category: 'Raw Material', unit: 'Bag', department: 'Production', stock: 50 },
  { id: 'i4', name: 'Fertilizer Pack', code: 'AGR-004', category: 'Agro Supplies', unit: 'Pack', department: 'Farming', stock: 0 },
  { id: 'i5', name: 'Welding Machine', code: 'EQP-005', category: 'Tools', unit: 'Pcs', department: 'Workshop', stock: 0 },
  { id: 'i6', name: 'Desktop Computer Dell', code: 'ITM-006', category: 'IT Equipment', unit: 'Pcs', department: 'Accounts', stock: 0 },
];

export const REQUESTERS: Requester[] = [
    { id: 'r1', name: 'A. R. Khan', category: 'Management', department: 'Executive' },
    { id: 'r2', name: 'E. Haque', category: 'Management', department: 'Accounts' },
    { id: 'r3', name: 'B. Islam', category: 'Factory Employee', department: 'Maintenance' },
    { id: 'r4', name: 'C. Ahmed', category: 'Factory Employee', department: 'Production' },
    { id: 'r5', name: 'D. Chowdhury', category: 'Factory Employee', department: 'Farming' },
    { id: 'r6', name: 'Mostafizur Rahman', category: 'Factory Employee', department: 'IT' },
    { id: 'r7', name: 'Salma Akter', category: 'Factory Employee', department: 'HR' },
    { id: 'r8', name: 'Prime Contractors Ltd.', category: 'Contractor', department: 'Civil' },
    { id: 'r9', name: 'John Smith (Auditor)', category: 'Visitor', department: 'Audit' },
];


const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const fiveDaysAgo = new Date(today);
fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);


export const GATE_PASSES: GatePass[] = [
  {
    id: 'gp1',
    gatePassNo: `GP-${new Date().getFullYear()}-0001`,
    department: 'IT',
    requesterName: 'A. R. Khan',
    requesterCategory: 'Management',
    purpose: 'Repair',
    vehicleInfo: { driverName: 'Karim Mia', numberPlate: 'DH-GA-12-3456' },
    items: [{ itemId: 'i1', quantity: 1, unit: 'Pcs', remarks: 'Screen flickering issue' }],
    type: GatePassType.Returnable,
    status: GatePassStatus.Overdue,
    createdAt: fiveDaysAgo.toISOString(),
    expectedReturnDate: threeDaysAgo.toISOString(),
    approvedBy: 'John Doe (Head)',
    photoUrl: 'https://picsum.photos/400/300'
  },
  {
    id: 'gp2',
    gatePassNo: `GP-${new Date().getFullYear()}-0002`,
    department: 'Maintenance',
    requesterName: 'B. Islam',
    requesterCategory: 'Factory Employee',
    purpose: 'External Servicing',
    vehicleInfo: { driverName: 'Rahim Sheikh', numberPlate: 'CH-KA-45-7890' },
    items: [{ itemId: 'i2', quantity: 1, unit: 'Pcs', remarks: 'Bearing change needed' }],
    type: GatePassType.Returnable,
    status: GatePassStatus.Delivered,
    createdAt: yesterday.toISOString(),
    expectedReturnDate: tomorrow.toISOString(),
    approvedBy: 'John Doe (Head)',
    deliveredBy: 'Security Guard',
  },
  {
    id: 'gp3',
    gatePassNo: `GP-${new Date().getFullYear()}-0003`,
    department: 'Production',
    requesterName: 'C. Ahmed',
    requesterCategory: 'Factory Employee',
    purpose: 'Delivery to Client',
    vehicleInfo: { driverName: 'Jamal Uddin', numberPlate: 'SY-DA-11-2233' },
    items: [{ itemId: 'i3', quantity: 50, unit: 'Bag', remarks: 'Order #C-554' }],
    type: GatePassType.NonReturnable,
    status: GatePassStatus.Delivered,
    createdAt: today.toISOString(),
    approvedBy: 'John Doe (Head)',
    deliveredBy: 'Security Guard',
  },
  {
    id: 'gp4',
    gatePassNo: `GP-${new Date().getFullYear()}-0004`,
    department: 'Farming',
    requesterName: 'D. Chowdhury',
    requesterCategory: 'Factory Employee',
    purpose: 'Field Application',
    vehicleInfo: { driverName: 'N/A', numberPlate: 'N/A' },
    items: [{ itemId: 'i4', quantity: 10, unit: 'Pack', remarks: 'For sector B' }],
    type: GatePassType.NonReturnable,
    status: GatePassStatus.Approved,
    createdAt: today.toISOString(),
    approvedBy: 'John Doe (Head)',
  },
  {
    id: 'gp5',
    gatePassNo: `GP-${new Date().getFullYear()}-0005`,
    department: 'Accounts',
    requesterName: 'E. Haque',
    requesterCategory: 'Management',
    purpose: 'Return to Vendor',
    vehicleInfo: { driverName: 'Akbar Ali', numberPlate: 'DH-GA-99-8877' },
    items: [{ itemId: 'i6', quantity: 1, unit: 'Pcs', remarks: 'Faulty power supply' }],
    type: GatePassType.Returnable,
    status: GatePassStatus.Returned,
    createdAt: fiveDaysAgo.toISOString(),
    expectedReturnDate: threeDaysAgo.toISOString(),
    returnedAt: yesterday.toISOString(),
    approvedBy: 'John Doe (Head)',
    deliveredBy: 'Security Guard',
    returnedBy: 'Warehouse Staff',
  },
];
