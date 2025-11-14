
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Requester, RequesterCategory } from '../../types';
import Modal from '../common/Modal';

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ImportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;


interface ManageRequestersProps {
  requesters: Requester[];
  categories: RequesterCategory[];
  onAddRequester: (requester: Omit<Requester, 'id'>) => void;
  onUpdateRequester: (requester: Requester) => void;
  onDeleteRequester: (id: string) => void;
  onAddCategory: (category: RequesterCategory) => void;
  onDeleteCategory: (category: RequesterCategory) => void;
}

const ManageRequesters: React.FC<ManageRequestersProps> = ({ 
  requesters, categories, onAddRequester, onUpdateRequester, onDeleteRequester, onAddCategory, onDeleteCategory 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRequesterModalOpen, setRequesterModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingRequester, setEditingRequester] = useState<Requester | null>(null);
  const [requesterData, setRequesterData] = useState({ name: '', category: '', department: '' });
  const [newCategory, setNewCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRequesters = useMemo(() => {
    return requesters.filter(r =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [requesters, searchTerm]);

  useEffect(() => {
    if (editingRequester) {
      setRequesterData({
        name: editingRequester.name,
        category: editingRequester.category,
        department: editingRequester.department || ''
      });
    } else {
      setRequesterData({ name: '', category: '', department: '' });
    }
  }, [editingRequester]);

  const handleOpenRequesterModal = (requester: Requester | null = null) => {
    setEditingRequester(requester);
    setRequesterModalOpen(true);
  };

  const handleCloseRequesterModal = () => {
    setRequesterModalOpen(false);
    setEditingRequester(null);
  };

  const handleSaveRequester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterData.name || !requesterData.category) {
        alert('Please provide a name and category.');
        return;
    }
    if (editingRequester) {
      onUpdateRequester({ ...editingRequester, ...requesterData });
    } else {
      onAddRequester(requesterData);
    }
    handleCloseRequesterModal();
  };

  const handleDeleteRequester = (id: string) => {
    if (window.confirm('Are you sure you want to delete this requester?')) {
      onDeleteRequester(id);
    }
  }
  
  const handleAddCategory = () => {
    if(newCategory.trim()){
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  }

  const handleDeleteCategory = (category: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${category}"? This cannot be undone.`)) {
        onDeleteCategory(category);
    }
  }

  const handleExportCSV = () => {
    if (requesters.length === 0) {
      alert('No requesters to export.');
      return;
    }
    const headers = ['name', 'category', 'department'];
    const csvContent = [
      headers.join(','),
      ...requesters.map(r => `"${r.name}","${r.category}","${r.department || ''}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `requesters_export_${new Date().toISOString().split('T')[0]}.csv`);
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
        const nameIndex = headerRow.indexOf('name');
        const categoryIndex = headerRow.indexOf('category');
        const departmentIndex = headerRow.indexOf('department');

        if (nameIndex === -1 || categoryIndex === -1) {
            alert('CSV must contain "name" and "category" columns.');
            return;
        }
        
        let importedCount = 0;
        const newCategories = new Set<string>();

        for (let i = 1; i < rows.length; i++) {
            const columns = rows[i].trim().split(',').map(c => c.replace(/"/g, ''));
            const name = columns[nameIndex];
            const category = columns[categoryIndex];
            const department = departmentIndex > -1 ? columns[departmentIndex] : '';

            if (name && category) {
                if (!requesters.some(r => r.name.toLowerCase() === name.toLowerCase())) {
                    onAddRequester({ name, category, department });
                    if (!categories.includes(category)) {
                        newCategories.add(category);
                    }
                    importedCount++;
                }
            }
        }

        newCategories.forEach(cat => onAddCategory(cat));
        
        alert(`${importedCount} new requester(s) imported successfully.`);
    } catch (error) {
        console.error("Failed to process CSV:", error);
        alert("An error occurred while importing the CSV file. Please check the file format and console for details.");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Requester Management</h1>
        <div className="flex flex-wrap gap-2">
            <button onClick={handleImportClick} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                <ImportIcon /> Import
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".csv" />
            <button onClick={handleExportCSV} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                <ExportIcon /> Export
            </button>
            <button onClick={() => setCategoryModalOpen(true)} className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                Manage Categories
            </button>
            <button onClick={() => handleOpenRequesterModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                + Add Requester
            </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Search by Name, Category, Department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3">Department</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequesters.map((requester) => (
              <tr key={requester.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{requester.name}</td>
                <td className="px-6 py-4">{requester.category}</td>
                <td className="px-6 py-4">{requester.department || 'N/A'}</td>
                <td className="px-6 py-4 flex items-center space-x-3">
                    <button onClick={() => handleOpenRequesterModal(requester)} className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"><EditIcon /></button>
                    <button onClick={() => handleDeleteRequester(requester.id)} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400"><DeleteIcon /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Requester Modal */}
      <Modal 
        title={editingRequester ? 'Edit Requester' : 'Add New Requester'} 
        isOpen={isRequesterModalOpen} 
        onClose={handleCloseRequesterModal}
        size="lg"
      >
          <form onSubmit={handleSaveRequester} className="space-y-4">
              <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                  <input type="text" name="name" id="name" value={requesterData.name} onChange={e => setRequesterData({...requesterData, name: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                  <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                  <select name="category" id="category" value={requesterData.category} onChange={e => setRequesterData({...requesterData, category: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                      <option value="">Select a Category</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
              </div>
              <div>
                  <label htmlFor="department" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Department (Optional)</label>
                  <input type="text" name="department" id="department" value={requesterData.department} onChange={e => setRequesterData({...requesterData, department: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="flex items-center justify-end pt-4 space-x-2 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={handleCloseRequesterModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600">Cancel</button>
                  <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">{editingRequester ? 'Update' : 'Save'}</button>
              </div>
          </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        title="Manage Categories"
        isOpen={isCategoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        size="md"
      >
          <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Existing Categories</label>
                <ul className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-lg dark:border-gray-600">
                    {categories.map(cat => (
                        <li key={cat} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-gray-800 dark:text-gray-200">{cat}</span>
                            <button onClick={() => handleDeleteCategory(cat)} className="text-gray-400 hover:text-red-500">
                                <DeleteIcon />
                            </button>
                        </li>
                    ))}
                </ul>
              </div>
              <div className="pt-4 border-t dark:border-gray-600">
                <label htmlFor="newCategory" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Add New Category</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        id="newCategory"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="e.g., Supplier"
                    />
                    <button onClick={handleAddCategory} className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Add</button>
                </div>
              </div>
          </div>
      </Modal>

    </div>
  );
};

export default ManageRequesters;
