import React, { useState, useMemo } from 'react';
import { GatePass, Item, GatePassStatus, GatePassType, RequesterCategory, Requester, User, Role } from '../../types';
import Modal from '../common/Modal';
import { generateReminderMessage, generateOverdueSummaryReport } from '../../services/geminiService';
import { REQUESTERS } from '../../constants';

const statusColors: { [key in GatePassStatus]: string } = {
  [GatePassStatus.Pending]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  [GatePassStatus.Approved]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [GatePassStatus.Delivered]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [GatePassStatus.Returned]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [GatePassStatus.Overdue]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [GatePassStatus.Cancelled]: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-400',
};

const ViewIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const ReminderIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>);
const ManageIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>);
const WhatsAppIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>);
const ImoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.25 15.375c.092.34-.142.682-.48.774-.34.092-.682-.142-.774-.48a4.008 4.008 0 00-6.8-2.618 4.013 4.013 0 00-2.618 6.8c.092.34-.142.682-.48.774-.34.092-.682-.142-.774-.48a5.513 5.513 0 013.6-9.352 5.513 5.513 0 019.352 3.6zm-12.75 3.375a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM12 24C5.372 24 0 18.628 0 12S5.372 0 12 0s12 5.372 12 12-5.372 12-12 12z"/></svg>);
const CopyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);

const normalizePhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Case 1: Standard local BD format (e.g., 01712345678) -> 8801712345678
    if (cleaned.startsWith('01') && cleaned.length === 11) {
        return '880' + cleaned.substring(1);
    }
    
    // Case 2: Local BD format without leading zero (e.g., 1712345678) -> 8801712345678
    if (cleaned.startsWith('1') && cleaned.length === 10) {
        return '880' + cleaned;
    }
    
    // Case 3: Already has BD country code (e.g., 8801712345678)
    if (cleaned.startsWith('880') && cleaned.length === 13) {
        return cleaned;
    }

    // For other formats (including international), return the cleaned number.
    return cleaned;
};


interface GatePassesProps {
  currentUser: User;
  gatePasses: GatePass[];
  items: Item[];
  requesters: Requester[];
  requesterCategories: RequesterCategory[];
  addGatePass: (pass: GatePass) => void;
  updateGatePass: (pass: GatePass) => void;
  updateItemStock: (itemId: string, quantityChange: number) => void;
  googleSheetUrl: string;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  onAddItem: (item: Omit<Item, 'id'>) => void;
}

const GatePasses: React.FC<GatePassesProps> = ({ currentUser, gatePasses, items, requesters, requesterCategories, addGatePass, updateGatePass, updateItemStock, googleSheetUrl, showNotification, onAddItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const [isReminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderPhoneNumber, setReminderPhoneNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManagePassModalOpen, setManagePassModalOpen] = useState(false);
  
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryReport, setSummaryReport] = useState<{ summary: string; tableData: GatePass[] } | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryPhoneNumber, setSummaryPhoneNumber] = useState('');

  const [units, setUnits] = useState(['Pcs', 'Kg', 'Bag', 'Pack', 'Ltr', 'Set', 'Box']);
  const [isUnitModalOpen, setUnitModalOpen] = useState(false);
  const [newUnit, setNewUnit] = useState('');

  const [isAddItemModalOpen, setAddItemModalOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({ name: '', code: '', category: '', unit: 'Pcs', department: '', stock: 0 });
  
  const getInitialPassState = () => {
    const now = new Date();
    // To fix timezone offset issue for date input
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return {
        id: '',
        gatePassNo: '',
        department: '',
        requesterName: '',
        requesterCategory: '',
        purpose: '',
        vehicleInfo: { driverName: '', numberPlate: '' },
        items: [{ itemId: '', quantity: 1, unit: 'Pcs', remarks: '' }],
        type: GatePassType.NonReturnable,
        status: GatePassStatus.Approved,
        createdAt: new Date().toISOString(),
        expectedReturnDate: '',
        // Form specific fields
        passDate: now.toISOString().split('T')[0],
        passTime: new Date().toTimeString().substring(0, 5),
        returnDate: now.toISOString().split('T')[0],
        returnTime: new Date().toTimeString().substring(0, 5),
        returnedBy: ''
    };
  }

  const [managedPassData, setManagedPassData] = useState<any>(getInitialPassState());

  const getItemName = (itemId: string) => items.find(i => i.id === itemId)?.name || 'Unknown Item';
  
  const overdueAndPendingPasses = useMemo(() => {
    return gatePasses.filter(p => 
      p.status === GatePassStatus.Overdue || 
      (p.type === GatePassType.Returnable && p.status === GatePassStatus.Delivered)
    );
  }, [gatePasses]);
  
  const sortedOverduePasses = useMemo(() => {
    return [...overdueAndPendingPasses].sort((a, b) => {
        const dateA = a.expectedReturnDate ? new Date(a.expectedReturnDate).getTime() : Infinity;
        const dateB = b.expectedReturnDate ? new Date(b.expectedReturnDate).getTime() : Infinity;
        return dateA - dateB; // Oldest first
    });
  }, [overdueAndPendingPasses]);


  const filteredGatePasses = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    
    return gatePasses.filter(pass => {
        // Date Range Filter
        if (fromDate && pass.createdAt < new Date(`${fromDate}T00:00:00`).toISOString()) {
            return false;
        }
        if (toDate && pass.createdAt > new Date(`${toDate}T23:59:59`).toISOString()) {
            return false;
        }

        // Global Search Filter
        if (searchTerm) {
             const searchFields = [
                pass.gatePassNo,
                pass.requesterName,
                pass.department,
                getItemName(pass.items[0].itemId),
                pass.type,
                pass.status
             ];
             return searchFields.some(field => field.toLowerCase().includes(lowercasedSearchTerm));
        }
        
        return true; // Pass if no date or search filters
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [gatePasses, searchTerm, fromDate, toDate, items]);
  
  const availableRequesters = useMemo(() => {
    if (!managedPassData.requesterCategory) return [];
    return requesters.filter(r => r.category === managedPassData.requesterCategory);
  }, [managedPassData.requesterCategory, requesters]);

  const calculateDuration = (startISO?: string, endISO?: string): string => {
    if (!startISO || !endISO) return 'N/A';
    const start = new Date(startISO);
    const end = new Date(endISO);
    let diff = end.getTime() - start.getTime();
    if (isNaN(diff) || diff < 0) return 'N/A';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || result === '') result += `${minutes}m`;
    
    return result.trim() || '0m';
  };

  const handleOpenManageModal = (pass?: GatePass) => {
    if (pass) {
        const passDateObj = new Date(pass.createdAt);
        passDateObj.setMinutes(passDateObj.getMinutes() - passDateObj.getTimezoneOffset());
        
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

        setManagedPassData({
            ...pass,
            passDate: passDateObj.toISOString().split('T')[0],
            passTime: new Date(pass.createdAt).toTimeString().substring(0, 5),
            returnDate: now.toISOString().split('T')[0],
            returnTime: now.toTimeString().substring(0, 5),
            returnedBy: '',
        });
    } else {
        setManagedPassData(getInitialPassState());
    }
    setManagePassModalOpen(true);
  };

  const handleOpenReminderModal = (pass: GatePass) => {
    setManagedPassData(pass);
    setReminderMessage('');
    setReminderPhoneNumber('');
    setReminderModalOpen(true);
  };
  
  const handleGenerateReminder = async () => {
      if(!managedPassData) return;
      setIsGenerating(true);
      const item = items.find(i => i.id === managedPassData.items[0].itemId);
      if(item){
          const message = await generateReminderMessage(managedPassData, item);
          setReminderMessage(message);
      }
      setIsGenerating(false);
  }

  const handleShare = (platform: 'whatsapp' | 'copy') => {
    if (!reminderMessage) {
        alert('Please generate a message first.');
        return;
    }
    if (platform === 'whatsapp' && !reminderPhoneNumber) {
        alert('Please enter a phone number to share on WhatsApp.');
        return;
    }
  
    const encodedMessage = encodeURIComponent(reminderMessage);
    
    if (platform === 'whatsapp') {
      const normalizedPhoneNumber = normalizePhoneNumber(reminderPhoneNumber);
      if(!normalizedPhoneNumber) {
          alert('Please enter a valid phone number.');
          return;
      }
      const whatsappUrl = `https://wa.me/${normalizedPhoneNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(reminderMessage).then(() => {
        showNotification('Message copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        showNotification('Failed to copy message.', 'error');
      });
    }
  };

  const handleManagedPassChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'requesterName') {
        const selectedRequester = availableRequesters.find(r => r.name === value);
        setManagedPassData((prev: any) => ({ 
          ...prev, 
          requesterName: value,
          department: selectedRequester?.department || prev.department
        }));
        return;
    }

    if (name === 'requesterCategory') {
      setManagedPassData((prev: any) => ({ ...prev, requesterCategory: value, requesterName: '', department: '' }));
      return;
    }

    if (name === 'item.itemId') {
        const selectedItem = items.find(i => i.id === value);
        const updatedItems = [...managedPassData.items];
        updatedItems[0] = { ...updatedItems[0], itemId: value, unit: selectedItem?.unit || 'Pcs' };
        setManagedPassData((prev: any) => ({ ...prev, items: updatedItems }));
        return;
    }
    
    if (name.startsWith('vehicleInfo.')) {
        const field = name.split('.')[1];
        setManagedPassData((prev: any) => ({ ...prev, vehicleInfo: { ...prev.vehicleInfo!, [field]: value } }));
    } else if (name.startsWith('item.')) {
        const field = name.split('.')[1];
        const updatedItems = [...managedPassData.items];
        let parsedValue: string | number = value;
        if (field === 'quantity') {
            parsedValue = parseInt(value, 10) || 1;
        }
        updatedItems[0] = { ...updatedItems[0], [field]: parsedValue };
        setManagedPassData((prev: any) => ({ ...prev, items: updatedItems }));
    } else {
        setManagedPassData((prev: any) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleTypeChange = (setter: React.Dispatch<React.SetStateAction<any>>, type: GatePassType) => {
    setter((prev: any) => ({
      ...prev,
      type,
      expectedReturnDate: type === GatePassType.NonReturnable ? '' : prev.expectedReturnDate,
    }));
  };
  
  const handleAddUnit = () => {
    if (newUnit && !units.includes(newUnit)) {
        setUnits(prev => [...prev, newUnit].sort());
    }
    setNewUnit('');
    setUnitModalOpen(false);
  };

  const sendToGoogleSheet = (pass: GatePass) => {
    if (!googleSheetUrl) {
      console.warn("Google Sheet URL not configured. Skipping submission.");
      return;
    }

    const itemDetails = items.find(i => i.id === pass.items[0].itemId);

    const payload = {
      gatePassNo: pass.gatePassNo,
      createdAt: new Date(pass.createdAt).toLocaleString('en-GB'),
      requesterName: pass.requesterName,
      department: pass.department,
      itemName: itemDetails ? itemDetails.name : 'Unknown Item',
      quantity: pass.items[0].quantity,
      unit: pass.items[0].unit,
      type: pass.type,
      status: pass.status,
      purpose: pass.purpose,
      vehicleInfo: `${pass.vehicleInfo.driverName || 'N/A'} / ${pass.vehicleInfo.numberPlate || 'N/A'}`,
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    fetch(googleSheetUrl, {
      method: 'POST',
      body: formData,
    })
    .then(() => console.log("Gate Pass data submission initiated to Google Sheet."))
    .catch(error => console.error(
      "Fetch to Google Sheet failed. This is often expected due to CORS redirect. Data might have been saved successfully.",
      error
    ));
  };

  const handleSavePass = (e: React.FormEvent) => {
    e.preventDefault();
    const { id, requesterName, department, requesterCategory, items: passItems, passDate, passTime } = managedPassData;

    if (!requesterName || !department || !requesterCategory || !passItems[0].itemId || passItems[0].quantity <= 0) {
        alert('Please fill all required fields.');
        return;
    }
    
    const createdAt = new Date(`${passDate}T${passTime}`).toISOString();

    const passPayload: GatePass = {
        ...(managedPassData as any),
        createdAt: createdAt,
        expectedReturnDate: managedPassData.type === GatePassType.Returnable && managedPassData.expectedReturnDate ? managedPassData.expectedReturnDate : undefined,
    };
    
    if (id) {
        updateGatePass(passPayload);
        showNotification('Gate Pass updated successfully!');
    } else {
        const gatePassNumbers = gatePasses
            .map(p => {
                const parts = p.gatePassNo.split('-');
                return parseInt(parts[parts.length - 1], 10);
            })
            .filter(num => !isNaN(num));
        
        const maxNumber = gatePassNumbers.length > 0 ? Math.max(...gatePassNumbers) : 0;
        const nextNumber = maxNumber + 1;
        
        const newPass = {
            ...passPayload,
            id: `gp-${Date.now()}`,
            gatePassNo: `GP-${String(nextNumber).padStart(2, '0')}`,
        }
        addGatePass(newPass);
        updateItemStock(newPass.items[0].itemId, newPass.items[0].quantity);
        sendToGoogleSheet(newPass);
        showNotification('Gate Pass created successfully!');
    }
    setManagePassModalOpen(false);
  };

  const handleConfirmReturn = () => {
    if (!managedPassData || !managedPassData.returnDate || !managedPassData.returnTime || !managedPassData.returnedBy) {
        alert("Please provide the return date, time, and the name of the person returning the item.");
        return;
    }

    const returnedAtISO = new Date(`${managedPassData.returnDate}T${managedPassData.returnTime}`).toISOString();

    const updatedPass = {
        ...managedPassData,
        status: GatePassStatus.Returned,
        returnedAt: returnedAtISO,
        returnedBy: managedPassData.returnedBy,
    };

    updateGatePass(updatedPass);
    updateItemStock(managedPassData.items[0].itemId, -managedPassData.items[0].quantity);
    showNotification('Item return confirmed successfully!');
    setManagePassModalOpen(false);
  };
  
  const handleGenerateSummary = async () => {
    if (sortedOverduePasses.length === 0) return;
    
    setIsGeneratingSummary(true);
    setSummaryReport(null);
    setSummaryModalOpen(true);

    const summaryData = sortedOverduePasses.map(pass => ({
        gatePassNo: pass.gatePassNo,
        itemName: `${getItemName(pass.items[0].itemId)} (${pass.items[0].quantity} ${pass.items[0].unit})`,
        requesterName: pass.requesterName,
        department: pass.department,
        dueDate: pass.expectedReturnDate ? new Date(pass.expectedReturnDate).toLocaleDateString('en-CA') : 'N/A'
    }));

    const summaryText = await generateOverdueSummaryReport(summaryData.length, summaryData.slice(0, 3));
    setSummaryReport({ summary: summaryText, tableData: sortedOverduePasses });
    setIsGeneratingSummary(false);
  };

  const handleShareSummaryToWhatsApp = () => {
    if (!summaryReport || !summaryPhoneNumber) {
        alert('Please enter a phone number and ensure the report is generated.');
        return;
    }

    const { summary, tableData } = summaryReport;

    let message = `${summary}\n\n`;
    message += "--- Overdue Items List ---\n\n";

    tableData.forEach(pass => {
        const itemName = `${getItemName(pass.items[0].itemId)} (${pass.items[0].quantity} ${pass.items[0].unit})`;
        const dueDate = pass.expectedReturnDate ? new Date(pass.expectedReturnDate).toLocaleDateString('en-CA') : 'N/A';
        message += `GP No: *${pass.gatePassNo}*\n`;
        message += `Item: ${itemName}\n`;
        message += `Requester: ${pass.requesterName}\n`;
        message += `Department: ${pass.department}\n`;
        message += `Due Date: *${dueDate}*\n`;
        message += `--------------------\n\n`;
    });

    const encodedMessage = encodeURIComponent(message);
    const normalizedPhoneNumber = normalizePhoneNumber(summaryPhoneNumber);
    if (!normalizedPhoneNumber) {
        alert('Please enter a valid phone number.');
        return;
    }
    const whatsappUrl = `https://wa.me/${normalizedPhoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemData.name || !newItemData.code || !newItemData.category || !newItemData.unit || !newItemData.department) {
        alert('Please fill all required fields.');
        return;
    }
    onAddItem(newItemData);
    showNotification(`Item "${newItemData.name}" added successfully!`);
    setAddItemModalOpen(false);
    setNewItemData({ name: '', code: '', category: '', unit: 'Pcs', department: '', stock: 0 });
  };
  
  const canCreatePass = currentUser.role === Role.Admin || currentUser.role === Role.Security;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gate Pass Management</h1>
        <div className="flex items-center gap-2">
            {currentUser.role === Role.Admin && (
              <button 
                  onClick={handleGenerateSummary}
                  disabled={overdueAndPendingPasses.length === 0 || isGeneratingSummary}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:bg-orange-300 disabled:cursor-not-allowed"
                  title={overdueAndPendingPasses.length === 0 ? "No overdue or pending returnable items" : "Generate a summary report of all pending returns"}
              >
                  {isGeneratingSummary ? 'Generating...' : `Overdue Summary (${overdueAndPendingPasses.length})`}
              </button>
            )}
            {canCreatePass && (
              <button onClick={() => handleOpenManageModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
              + Create New Pass
              </button>
            )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
                type="text"
                placeholder="Search by GP No, Requester, Item, Status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
                <label htmlFor="fromDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">From:</label>
                <input
                    type="date"
                    id="fromDate"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="toDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
                 <input
                    type="date"
                    id="toDate"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">GP No</th>
              <th scope="col" className="px-6 py-3">Requester</th>
              <th scope="col" className="px-6 py-3">Department</th>
              <th scope="col" className="px-6 py-3">Item</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Type</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGatePasses.map((pass) => (
              <tr key={pass.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{pass.gatePassNo}</td>
                <td className="px-6 py-4">{pass.requesterName}</td>
                <td className="px-6 py-4">{pass.department}</td>
                <td className="px-6 py-4">{getItemName(pass.items[0].itemId)} ({pass.items[0].quantity} {pass.items[0].unit})</td>
                <td className="px-6 py-4">{new Date(pass.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">{pass.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[pass.status]}`}>
                    {pass.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center space-x-2">
                  <button onClick={() => handleOpenManageModal(pass)} title="View Details" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"><ViewIcon /></button>
                  {pass.status === GatePassStatus.Overdue && currentUser.role === Role.Admin && (
                    <button
                      onClick={() => handleOpenReminderModal(pass)}
                      title="Send Reminder"
                      className="relative p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                    >
                      <span className="sr-only">Send Reminder</span>
                      <ReminderIcon />
                      <span className="absolute top-0.5 right-0.5 block h-2 w-2 transform rounded-full bg-red-600 ring-2 ring-white dark:ring-gray-800"></span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {managedPassData && isReminderModalOpen && (
          <Modal title="Generate AI Reminder" isOpen={isReminderModalOpen} onClose={() => setReminderModalOpen(false)} size="2xl" closeOnOverlayClick={false}>
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Generate a professional reminder message for this overdue item using AI.</p>
                    <button 
                      onClick={handleGenerateReminder}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
                    >
                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </button>
                </div>
                <textarea 
                  rows={5} 
                  readOnly 
                  value={reminderMessage}
                  placeholder="Generated message will appear here..."
                  className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                ></textarea>
                
                {reminderMessage && (
                  <div className="space-y-4 pt-4 border-t dark:border-gray-600">
                      <div>
                          <label htmlFor="reminderPhone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Recipient Phone Number</label>
                          <input
                              type="tel"
                              id="reminderPhone"
                              value={reminderPhoneNumber}
                              onChange={(e) => setReminderPhoneNumber(e.target.value)}
                              placeholder="e.g., 01712345678 or 8801712345678"
                              className="w-full p-2.5 border rounded-lg bg-gray-50 border-gray-300 text-gray-900 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                          />
                      </div>

                      <div className="flex items-center justify-start gap-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Share via:</p>
                          <button
                              type="button"
                              onClick={() => handleShare('whatsapp')}
                              disabled={!reminderPhoneNumber}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                              <WhatsAppIcon />
                              WhatsApp
                          </button>
                           <button
                              type="button"
                              disabled
                              title="Direct sharing to Imo is not supported via web."
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg cursor-not-allowed opacity-50"
                          >
                              <ImoIcon />
                              Imo
                          </button>
                          <button
                              type="button"
                              onClick={() => handleShare('copy')}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                          >
                              <CopyIcon />
                              Copy
                          </button>
                      </div>
                       <p className="text-xs text-gray-500">You can also copy this message and send it via Email or other platforms.</p>
                  </div>
                )}
              </div>
          </Modal>
      )}

      {isSummaryModalOpen && (
        <Modal 
            title="Overdue Items Summary Report" 
            isOpen={isSummaryModalOpen} 
            onClose={() => {
                setSummaryModalOpen(false);
                setSummaryPhoneNumber('');
            }}
            size="4xl"
            footer={
                <div className="flex justify-end w-full gap-2">
                    <button type="button" onClick={() => { setSummaryModalOpen(false); setSummaryPhoneNumber(''); }} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600">Close</button>
                    <button type="button" onClick={() => window.print()} disabled={!summaryReport} className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-indigo-400">
                        Print Report
                    </button>
                </div>
            }
        >
            <div id="printable-summary-area">
                <div id="summary-report-content" className="space-y-4">
                  {isGeneratingSummary && !summaryReport ? (
                     <div className="flex items-center justify-center h-40">
                        <p className="text-gray-600 dark:text-gray-400">Generating AI summary, please wait...</p>
                     </div>
                  ) : summaryReport ? (
                    <>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{summaryReport.summary}</p>
                        <div className="mt-4 border dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="overflow-y-auto max-h-96">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                                        <tr>
                                            <th scope="col" className="px-4 py-3">GP No.</th>
                                            <th scope="col" className="px-4 py-3">Item Name</th>
                                            <th scope="col" className="px-4 py-3">Requester</th>
                                            <th scope="col" className="px-4 py-3">Department</th>
                                            <th scope="col" className="px-4 py-3">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800">
                                        {summaryReport.tableData.map(pass => (
                                            <tr key={pass.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{pass.gatePassNo}</td>
                                                <td className="px-4 py-2">{`${getItemName(pass.items[0].itemId)} (${pass.items[0].quantity} ${pass.items[0].unit})`}</td>
                                                <td className="px-4 py-2">{pass.requesterName}</td>
                                                <td className="px-4 py-2">{pass.department}</td>
                                                <td className="px-4 py-2 text-red-600 dark:text-red-400 font-semibold">{pass.expectedReturnDate ? new Date(pass.expectedReturnDate).toLocaleDateString('en-CA') : 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                  ) : (
                    <p>Could not generate report.</p>
                  )}
                </div>
            </div>

            {summaryReport && (
                <div className="mt-6 pt-4 border-t dark:border-gray-600">
                    <div className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="flex-grow w-full">
                            <label htmlFor="summaryPhone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Recipient Phone Number (for WhatsApp)</label>
                            <input
                                type="tel"
                                id="summaryPhone"
                                value={summaryPhoneNumber}
                                onChange={(e) => setSummaryPhoneNumber(e.target.value)}
                                placeholder="e.g., 01712345678 or 8801712345678"
                                className="w-full p-2.5 border rounded-lg bg-gray-50 border-gray-300 text-gray-900 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleShareSummaryToWhatsApp}
                            disabled={!summaryPhoneNumber}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            <WhatsAppIcon />
                            Send Report
                        </button>
                    </div>
                </div>
            )}
            
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-summary-area, #printable-summary-area * { visibility: visible; }
                    #printable-summary-area { position: absolute; left: 2rem; top: 2rem; right: 2rem; }
                }
            `}</style>
        </Modal>
      )}

      {managedPassData && (
      <Modal 
        title={managedPassData.id ? `Gate Pass Details: ${managedPassData.gatePassNo}` : 'Create New Gate Pass'} 
        isOpen={isManagePassModalOpen} 
        onClose={() => setManagePassModalOpen(false)} 
        size="5xl" 
        closeOnOverlayClick={false}
      >
        <form onSubmit={handleSavePass} className="space-y-3 max-h-[80vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                 <div>
                    <label htmlFor="requesterCategory" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Requester Category</label>
                    <select name="requesterCategory" id="requesterCategory" value={managedPassData.requesterCategory} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required>
                        <option value="">Select Category</option>
                        {requesterCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="requesterName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Requester Name</label>
                    <select name="requesterName" id="requesterName" value={managedPassData.requesterName} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600" required disabled={!managedPassData.requesterCategory}>
                        <option value="">Select Name</option>
                        {availableRequesters.map(req => (
                            <option key={req.id} value={req.name}>{req.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="department" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Department</label>
                    <select name="department" id="department" value={managedPassData.department} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required>
                        <option value="">Select Department</option>
                        {[...new Set(items.map(item => item.department))].sort().map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="purpose" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Purpose</label>
                    <input type="text" name="purpose" id="purpose" value={managedPassData.purpose} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                <div>
                    <label htmlFor="passDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date</label>
                    <input type="date" name="passDate" id="passDate" value={managedPassData.passDate} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                <div>
                    <label htmlFor="passTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Time</label>
                    <input type="time" name="passTime" id="passTime" value={managedPassData.passTime} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                 <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Type</label>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => handleTypeChange(setManagedPassData, GatePassType.Returnable)} className={`w-full px-4 py-2.5 text-sm rounded-lg transition-colors ${managedPassData.type === GatePassType.Returnable ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}>Returnable</button>
                        <button type="button" onClick={() => handleTypeChange(setManagedPassData, GatePassType.NonReturnable)} className={`w-full px-4 py-2.5 text-sm rounded-lg transition-colors ${managedPassData.type === GatePassType.NonReturnable ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}>Non-Returnable</button>
                    </div>
                </div>
                {managedPassData.type === GatePassType.Returnable && (
                    <div>
                        <label htmlFor="expectedReturnDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Expected Return Date</label>
                        <input type="date" name="expectedReturnDate" value={managedPassData.expectedReturnDate?.split('T')[0] || ''} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" min={new Date().toISOString().split('T')[0]}/>
                    </div>
                )}
            </div>
            
            <hr className="my-3 dark:border-gray-600"/>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Item Details</h4>
                <button 
                    type="button" 
                    onClick={() => setAddItemModalOpen(true)}
                    className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
                >
                    + Add New Item
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-5">
                    <label htmlFor="item.itemId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Item</label>
                    <select name="item.itemId" id="item.itemId" value={managedPassData.items[0].itemId} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required>
                        <option value="">Select an Item</option>
                        {items.map(item => (
                            <option key={item.id} value={item.id}>{item.name} (Stock: {item.stock})</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="item.quantity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Quantity</label>
                    <input type="number" name="item.quantity" id="item.quantity" value={managedPassData.items[0].quantity} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required min="1" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="item.unit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Unit</label>
                    <div className="flex">
                        <select name="item.unit" id="item.unit" value={managedPassData.items[0].unit} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <button type="button" onClick={() => setUnitModalOpen(true)} title="Manage Units" className="p-2.5 text-gray-500 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-100 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600">
                           <ManageIcon />
                        </button>
                    </div>
                </div>
                <div className="md:col-span-3">
                    <label htmlFor="item.remarks" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Remarks</label>
                    <textarea name="item.remarks" id="item.remarks" rows={1} value={managedPassData.items[0].remarks} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"></textarea>
                </div>
            </div>
            
            <hr className="my-3 dark:border-gray-600"/>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Vehicle Information (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label htmlFor="vehicleInfo.driverName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Driver Name</label>
                    <input type="text" name="vehicleInfo.driverName" id="vehicleInfo.driverName" value={managedPassData.vehicleInfo!.driverName} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="vehicleInfo.numberPlate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Vehicle Number / Plate</label>
                    <input type="text" name="vehicleInfo.numberPlate" id="vehicleInfo.numberPlate" value={managedPassData.vehicleInfo!.numberPlate} onChange={handleManagedPassChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                </div>
            </div>

            {managedPassData.id && managedPassData.status === GatePassStatus.Returned && (
                 <>
                <hr className="my-3 dark:border-gray-600"/>
                 <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Return Details</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Returned By</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{managedPassData.returnedBy}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Returned At</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{new Date(managedPassData.returnedAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{calculateDuration(managedPassData.createdAt, managedPassData.returnedAt)}</p>
                        </div>
                    </div>
                </div>
                </>
            )}

            {managedPassData.id && managedPassData.type === GatePassType.Returnable && (managedPassData.status === GatePassStatus.Delivered || managedPassData.status === GatePassStatus.Overdue) && (
                <>
                <hr className="my-3 dark:border-gray-600"/>
                <div className="p-4 bg-green-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">Item Return</h4>
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                         <div className="md:col-span-3">
                            <label htmlFor="returnDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Return Date</label>
                            <input type="date" name="returnDate" id="returnDate" value={managedPassData.returnDate} onChange={handleManagedPassChange} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="returnTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Return Time</label>
                            <input type="time" name="returnTime" id="returnTime" value={managedPassData.returnTime} onChange={handleManagedPassChange} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div className="md:col-span-3">
                            <label htmlFor="returnedBy" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Returned By</label>
                            <input type="text" name="returnedBy" id="returnedBy" value={managedPassData.returnedBy} onChange={handleManagedPassChange} placeholder="Enter name" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Duration</label>
                            <p className="p-2.5 font-semibold text-gray-700 dark:text-gray-300 truncate">
                                {calculateDuration(managedPassData.createdAt, `${managedPassData.returnDate}T${managedPassData.returnTime}`)}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                             <button type="button" onClick={handleConfirmReturn} className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 whitespace-nowrap">Confirm</button>
                        </div>
                    </div>
                </div>
                </>
            )}

            <div className="flex items-center justify-end pt-4 space-x-2 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setManagePassModalOpen(false)} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cancel</button>
                {canCreatePass && (
                  <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">
                      {managedPassData.id ? 'Update Gate Pass' : 'Save Gate Pass'}
                  </button>
                )}
            </div>
        </form>
      </Modal>
      )}

      <Modal title="Manage Units" isOpen={isUnitModalOpen} onClose={() => setUnitModalOpen(false)} size="sm">
        <div className="space-y-4">
            <label htmlFor="newUnit" className="block text-sm font-medium text-gray-900 dark:text-white">Add New Unit</label>
            <input 
                type="text" 
                id="newUnit"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., Meter"
            />
        </div>
        <div className="flex items-center justify-end pt-4 space-x-2">
            <button type="button" onClick={() => setUnitModalOpen(false)} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600">Cancel</button>
            <button type="button" onClick={handleAddUnit} className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Add Unit</button>
        </div>
      </Modal>

      <Modal 
        title="Add New Item" 
        isOpen={isAddItemModalOpen} 
        onClose={() => setAddItemModalOpen(false)}
        size="2xl"
      >
          <form onSubmit={handleSaveNewItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="newItemName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Item Name</label>
                    <input type="text" name="name" id="newItemName" value={newItemData.name} onChange={(e) => setNewItemData(p => ({...p, name: e.target.value}))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
                <div>
                    <label htmlFor="newItemCode" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Item Code</label>
                    <input type="text" name="code" id="newItemCode" value={newItemData.code} onChange={(e) => setNewItemData(p => ({...p, code: e.target.value}))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
                <div>
                    <label htmlFor="newItemCategory" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                    <input type="text" name="category" id="newItemCategory" value={newItemData.category} onChange={(e) => setNewItemData(p => ({...p, category: e.target.value}))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
                 <div>
                    <label htmlFor="newItemDepartment" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Department</label>
                    <input type="text" name="department" id="newItemDepartment" value={newItemData.department} onChange={(e) => setNewItemData(p => ({...p, department: e.target.value}))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
                 <div>
                    <label htmlFor="newItemUnit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Unit</label>
                    <input type="text" name="unit" id="newItemUnit" value={newItemData.unit} onChange={(e) => setNewItemData(p => ({...p, unit: e.target.value}))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
                 <div>
                    <label htmlFor="newItemStock" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Stock Quantity</label>
                    <input type="number" name="stock" id="newItemStock" value={newItemData.stock} onChange={(e) => setNewItemData(p => ({...p, stock: parseInt(e.target.value, 10)}))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required min="0"/>
                </div>
              </div>
              <div className="flex items-center justify-end pt-4 space-x-2 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={() => setAddItemModalOpen(false)} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600">Cancel</button>
                  <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Save Item</button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default GatePasses;