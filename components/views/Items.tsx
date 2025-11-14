import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Item } from '../../types';
import Modal from '../common/Modal';

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ImportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

interface ItemsProps {
  items: Item[];
  onAddItem: (item: Omit<Item, 'id'>) => void;
  onUpdateItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
  onBulkAddItems: (items: Omit<Item, 'id'>[]) => void;
}

const Items: React.FC<ItemsProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem, onBulkAddItems }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemData, setItemData] = useState({ name: '', code: '', category: '', unit: 'Pcs', department: '', stock: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [items, searchTerm]);

  useEffect(() => {
    if (editingItem) {
      setItemData(editingItem);
    } else {
      setItemData({ name: '', code: '', category: '', unit: 'Pcs', department: '', stock: 0 });
    }
  }, [editingItem]);

  const handleOpenModal = (item: Item | null = null) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setItemData(prev => ({ ...prev, [name]: name === 'stock' ? parseInt(value, 10) : value }));
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemData.name || !itemData.code || !itemData.category || !itemData.unit || !itemData.department) {
        alert('Please fill all required fields.');
        return;
    }
    if (editingItem) {
      onUpdateItem({ ...editingItem, ...itemData });
    } else {
      onAddItem(itemData);
    }
    handleCloseModal();
  };
  
  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        onDeleteItem(id);
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) {
      alert('No items to export.');
      return;
    }
    const headers = ['name', 'code', 'category', 'department', 'unit', 'stock'];
    const csvContent = [
      headers.join(','),
      ...items.map(i => `"${i.name}","${i.code}","${i.category}","${i.department}","${i.unit}",${i.stock}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `items_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCSV(text);
    };
    reader.readAsText(file);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const processCSV = (csvText: string) => {
     try {
        const rows = csvText.split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) {
            alert('CSV file is empty or has no data rows.');
            return;
        }
        const headerRow = rows[0].trim().toLowerCase().split(',').map(h => h.replace(/"/g, ''));
        const requiredHeaders = ['name', 'code', 'category'];
        if (!requiredHeaders.every(h => headerRow.includes(h))) {
            alert(`CSV must contain the following headers: ${requiredHeaders.join(', ')}.`);
            return;
        }

        const newItems: Omit<Item, 'id'>[] = [];
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].trim().split(',');
            const rowData: { [key: string]: string } = {};
            headerRow.forEach((header, index) => {
                rowData[header] = values[index]?.replace(/"/g, '').trim() || '';
            });

            const newItem: Omit<Item, 'id'> = {
                name: rowData.name,
                code: rowData.code,
                category: rowData.category,
                department: rowData.department || 'Unassigned',
                unit: rowData.unit || 'Pcs',
                stock: parseInt(rowData.stock, 10) || 0,
            };

            if (newItem.name && newItem.code && newItem.category) {
                newItems.push(newItem);
            }
        }
        
        if (newItems.length > 0) {
            onBulkAddItems(newItems);
        } else {
            alert("No valid new items found in the CSV to import.");
        }
    } catch (error) {
        console.error("Failed to process CSV:", error);
        alert("An error occurred while importing the CSV file. Please check the file format and console for details.");
    }
  }


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Item Management</h1>
        <div className="flex flex-wrap gap-2">
            <button onClick={handleImportClick} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                <ImportIcon /> Import
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".csv" />
            <button onClick={handleExportCSV} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                <ExportIcon /> Export
            </button>
            <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                + Add New Item
            </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Search by Name, Code, Category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Item Name</th>
              <th scope="col" className="px-6 py-3">Code</th>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3">Department</th>
              <th scope="col" className="px-6 py-3">Unit</th>
              <th scope="col" className="px-6 py-3">Stock</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.name}</td>
                <td className="px-6 py-4">{item.code}</td>
                <td className="px-6 py-4">{item.category}</td>
                <td className="px-6 py-4">{item.department}</td>
                <td className="px-6 py-4">{item.unit}</td>
                <td className="px-6 py-4 font-bold">{item.stock}</td>
                <td className="px-6 py-4 flex items-center space-x-3">
                    <button onClick={() => handleOpenModal(item)} className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"><EditIcon /></button>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400"><DeleteIcon /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        title={editingItem ? 'Edit Item' : 'Add New Item'} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        size="2xl"
      >
          <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Item Name</label>
                    <input type="text" name="name" id="name" value={itemData.name} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
                <div>
                    <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Item Code</label>
                    <input type="text" name="code" id="code" value={itemData.code} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
                <div>
                    <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                    <input type="text" name="category" id="category" value={itemData.category} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
                 <div>
                    <label htmlFor="department" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Department</label>
                    <input type="text" name="department" id="department" value={itemData.department} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
                 <div>
                    <label htmlFor="unit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Unit</label>
                    <input type="text" name="unit" id="unit" value={itemData.unit} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                </div>
                 <div>
                    <label htmlFor="stock" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Stock Quantity</label>
                    <input type="number" name="stock" id="stock" value={itemData.stock} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required min="0"/>
                </div>
              </div>
              <div className="flex items-center justify-end pt-4 space-x-2 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={handleCloseModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600">Cancel</button>
                  <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">{editingItem ? 'Update Item' : 'Save Item'}</button>
              </div>
          </form>
      </Modal>

    </div>
  );
};

export default Items;
