import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GatePassSheetData } from '../../types';
import { getGatePassesFromSheet, updateGatePassInSheet, deleteGatePassInSheet } from '../../services/sheetService';

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const CancelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

interface GatePassDetailsProps {
    googleSheetUrl: string;
    showNotification: (message: string, type?: 'success' | 'error') => void;
}

const parseDateString = (dateStr: string): Date | null => {
    // Expected format: "dd/mm/yyyy, hh:mm:ss"
    if (!dateStr || typeof dateStr !== 'string') return null;

    const parts = dateStr.split(', ');
    if (parts.length !== 2) return null; // Invalid format

    const datePart = parts[0];
    const timePart = parts[1];

    const dateComponents = datePart.split('/');
    if (dateComponents.length !== 3) return null; // Invalid date part

    const timeComponents = timePart.split(':');
    if (timeComponents.length < 2) return null; // Invalid time part, seconds optional

    const day = parseInt(dateComponents[0], 10);
    const month = parseInt(dateComponents[1], 10) - 1; // Month is 0-indexed in JS Date
    const year = parseInt(dateComponents[2], 10);

    const hour = parseInt(timeComponents[0], 10);
    const minute = parseInt(timeComponents[1], 10);
    const second = timeComponents.length === 3 ? parseInt(timeComponents[2], 10) : 0;

    if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
        return null;
    }

    return new Date(year, month, day, hour, minute, second);
};


const GatePassDetails: React.FC<GatePassDetailsProps> = ({ googleSheetUrl, showNotification }) => {
    const [sheetData, setSheetData] = useState<GatePassSheetData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [editingRow, setEditingRow] = useState<GatePassSheetData | null>(null);
    const tableRef = useRef(null);

    const fetchData = async () => {
        if (!googleSheetUrl) {
            showNotification('Google Sheet URL is not configured in Settings.', 'error');
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const data = await getGatePassesFromSheet(googleSheetUrl);
            setSheetData(data);
        } catch (error: any) {
            showNotification(`Failed to load data: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [googleSheetUrl]);

    const filteredData = useMemo(() => {
        return sheetData.filter(row => {
            // Search filter logic
            const rowValues = Object.values(row).join(' ').toLowerCase();
            const searchMatch = searchTerm === '' || rowValues.includes(searchTerm.toLowerCase());

            // Date filter logic
            let dateMatch = true; // Assume true if no date filters are set
            if (fromDate || toDate) {
                const rowDateObj = parseDateString(row['Date & Time']);
                if (rowDateObj) {
                    const rowTime = rowDateObj.getTime();
                    const startTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : 0;
                    const endTime = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Infinity;
                    dateMatch = rowTime >= startTime && rowTime <= endTime;
                } else {
                    // If date filter is on, but row has invalid date, it's not a match.
                    dateMatch = false; 
                }
            }
            
            return searchMatch && dateMatch;
        });
    }, [sheetData, searchTerm, fromDate, toDate]);

    const handleEdit = (row: GatePassSheetData) => {
        setEditingRow({ ...row });
    };
    
    const handleCancel = () => {
        setEditingRow(null);
    };

    const handleUpdate = async () => {
        if (!editingRow) return;
        try {
            await updateGatePassInSheet(googleSheetUrl, editingRow);
            showNotification('Gate Pass updated successfully!', 'success');
            setEditingRow(null);
            fetchData(); // Refresh data from sheet
        } catch (error: any) {
            showNotification(`Update failed: ${error.message}`, 'error');
        }
    };

    const handleDelete = async (rowIndex: number) => {
        if (window.confirm('Are you sure you want to delete this gate pass? This action cannot be undone.')) {
            try {
                await deleteGatePassInSheet(googleSheetUrl, rowIndex);
                showNotification('Gate Pass deleted successfully!', 'success');
                fetchData(); // Refresh data
            } catch (error: any) {
                showNotification(`Deletion failed: ${error.message}`, 'error');
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof GatePassSheetData) => {
        if (!editingRow) return;
        setEditingRow({ ...editingRow, [key]: e.target.value });
    };
    
    const handleExport = () => {
        const headers = Object.keys(filteredData[0] || {}).filter(h => h !== 'rowIndex');
        const csvContent = [
            headers.join(','),
            ...filteredData.map(row => headers.map(header => `"${row[header as keyof GatePassSheetData]}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'gate_pass_details.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    const tableHeaders: (keyof GatePassSheetData)[] = [
        'SL No.', 'Gate Pass No', 'Date & Time', 'Requester', 'Department', 'Item', 'Quantity', 'Unit', 'Type', 'Status', 'Purpose', 'Vehicle Info'
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gate Pass Details (from Google Sheet)</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4 items-center flex-wrap">
                <div className="relative flex-grow w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search anything..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From:</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <button onClick={handleExport} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">Export</button>
                <button onClick={handlePrint} className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700">Print</button>
                <button onClick={fetchData} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">Refresh</button>
            </div>

            <div id="printable-area" className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400" ref={tableRef}>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            {tableHeaders.map(header => <th key={header} className="px-4 py-3">{header}</th>)}
                            <th className="px-4 py-3 print:hidden">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={tableHeaders.length + 1} className="text-center p-8">Loading data...</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan={tableHeaders.length + 1} className="text-center p-8">No data found.</td></tr>
                        ) : (
                            filteredData.map(row => (
                                <tr key={row.rowIndex} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    {tableHeaders.map(header => (
                                        <td key={`${row.rowIndex}-${header}`} className="px-4 py-2">
                                            {editingRow?.rowIndex === row.rowIndex ? (
                                                <input
                                                    type="text"
                                                    value={editingRow[header]}
                                                    onChange={(e) => handleInputChange(e, header)}
                                                    className="w-full p-1 border rounded bg-gray-50 dark:bg-gray-700"
                                                />
                                            ) : (
                                                row[header]
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-4 py-2 flex items-center space-x-2 print:hidden">
                                        {editingRow?.rowIndex === row.rowIndex ? (
                                            <>
                                                <button onClick={handleUpdate} className="text-green-500 hover:text-green-700"><SaveIcon /></button>
                                                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700"><CancelIcon /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEdit(row)} className="text-indigo-500 hover:text-indigo-700"><EditIcon /></button>
                                                <button onClick={() => handleDelete(row.rowIndex)} className="text-red-500 hover:text-red-700"><DeleteIcon /></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
             <style>{`
                @media print {
                    body > *:not(#printable-area) { display: none; }
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        box-shadow: none;
                        border: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default GatePassDetails;