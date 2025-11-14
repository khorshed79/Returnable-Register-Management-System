export enum Role {
  Admin = 'Admin',
  Security = 'Security',
  DepartmentHead = 'Department Head',
  StoreOfficer = 'Store Officer',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password?: string; // Added for authentication
}

export interface Item {
  id: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  department: string;
  stock: number;
}

export enum GatePassStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Delivered = 'Delivered',
  Returned = 'Returned',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled'
}

export enum GatePassType {
    Returnable = 'Returnable',
    NonReturnable = 'Non-Returnable'
}

export interface GatePassItem {
    itemId: string;
    quantity: number;
    unit: string;
    remarks: string;
}

export interface GatePass {
  id: string;
  gatePassNo: string;
  department: string;
  requesterName: string;
  requesterCategory: string;
  purpose: string;
  vehicleInfo: {
    driverName: string;
    numberPlate: string;
  };
  items: GatePassItem[];
  type: GatePassType;
  status: GatePassStatus;
  createdAt: string;
  expectedReturnDate?: string;
  returnedAt?: string;
  approvedBy?: string;
  deliveredBy?: string;
  returnedBy?: string;
  photoUrl?: string;
}

export interface GatePassSheetData {
  rowIndex: number;
  'SL No.': string;
  'Gate Pass No': string;
  'Date & Time': string;
  Requester: string;
  Department: string;
  Item: string;
  Quantity: string;
  Unit: string;
  Type: string;
  Status: string;
  Purpose: string;
  'Vehicle Info': string;
}


export type RequesterCategory = string;

export interface Requester {
    id: string;
    name: string;
    category: RequesterCategory;
    department?: string;
}