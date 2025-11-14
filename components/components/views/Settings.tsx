import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

interface SettingsProps {
    googleSheetUrl: string;
    onSaveGoogleSheetUrl: (url: string) => void;
    isPasswordSet: boolean;
    onSavePassword: (password: string) => void;
    showNotification: (message: string, type?: 'success' | 'error') => void;
}

const CopyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);

const Settings: React.FC<SettingsProps> = ({ googleSheetUrl, onSaveGoogleSheetUrl, isPasswordSet, onSavePassword, showNotification }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'setup' | 'change'>('setup');
    
    // State for form fields
    const [newUrl, setNewUrl] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    
    // State for feedback
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        setNewUrl(googleSheetUrl);
    }, [googleSheetUrl]);

    const handleOpenModal = (mode: 'setup' | 'change') => {
        setError('');
        setModalMode(mode);
        if (mode === 'change') {
            setNewUrl(googleSheetUrl);
        } else {
            setNewUrl('');
        }
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
        setIsModalOpen(true);
    };

    const handleSave = () => {
        setError(''); // Reset error on new attempt
        if (modalMode === 'setup') {
            if (!newUrl || !newPassword || !confirmPassword) {
                setError('Please fill all fields.');
                return;
            }
            if (newPassword !== confirmPassword) {
                setError('Passwords do not match. Please try again.');
                return;
            }
            onSavePassword(newPassword);
            onSaveGoogleSheetUrl(newUrl);
            showNotification('Password and URL have been set successfully!', 'success');
        } else { // 'change' mode
            const storedPassword = localStorage.getItem('appPassword');
            if (currentPassword !== storedPassword) {
                setError('Incorrect password. Please try again.');
                return;
            }
            if (!newUrl) {
                setError('The new URL field cannot be empty.');
                return;
            }
            onSaveGoogleSheetUrl(newUrl);
            showNotification('Google Sheet URL has been updated successfully!', 'success');
        }
        
        setIsModalOpen(false);
    };

    const combinedCodeString = `
const USER_SHEET_NAME = "Users";
const GATE_PASS_SHEET_NAME = "GatePasses";
const LOCK = LockService.getScriptLock();

function getOrCreateSheet(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    if (headers && headers.length > 0) sheet.appendRow(headers);
  } else if (sheet.getLastRow() === 0 && headers && headers.length > 0) {
    sheet.appendRow(headers);
  }
  return sheet;
}

function getGatePassesLogic(spreadSheet) {
    const sheet = getOrCreateSheet(spreadSheet, GATE_PASS_SHEET_NAME, []);
    if (sheet.getLastRow() < 2) {
        return { status: "success", data: [] };
    }
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const jsonData = [];
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
        }
        obj['rowIndex'] = i + 1;
        jsonData.push(obj);
    }
    return { status: "success", data: jsonData };
}

function handleLoginLogic(postData, spreadSheet) {
    const sheet = getOrCreateSheet(spreadSheet, USER_SHEET_NAME, []);
    const email = postData.email ? postData.email.trim().toLowerCase() : null;
    const password = postData.password ? postData.password.trim() : null;

    if (!email || !password) throw new Error("Email and password are required.");

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) throw new Error("User not found.");
      
    const originalHeaders = data[0];
    const headers = originalHeaders.map(h => String(h).toLowerCase());
    const emailIndex = headers.indexOf("email");
    const passwordIndex = headers.indexOf("password");

    if (emailIndex === -1 || passwordIndex === -1) throw new Error("Sheet must contain 'email' and 'password' columns.");

    for (let i = 1; i < data.length; i++) {
      const sheetEmail = data[i][emailIndex] ? String(data[i][emailIndex]).trim().toLowerCase() : '';
      const sheetPassword = data[i][passwordIndex] ? String(data[i][passwordIndex]).trim() : '';
      
      if (sheetEmail === email && sheetPassword === password) {
        const user = {};
        originalHeaders.forEach((header, index) => {
          if (String(header).toLowerCase() !== 'password') user[header] = data[i][index];
        });
        return { status: "success", user: user };
      }
    }
    throw new Error("Invalid credentials.");
}

function handleSignup(postData, spreadSheet) {
    const userHeaders = ["id", "email", "name", "password", "role"];
    const sheet = getOrCreateSheet(spreadSheet, USER_SHEET_NAME, userHeaders);
    const newRow = [\`u-\${new Date().getTime()}\`, postData.email, postData.name, postData.password, postData.role];
    sheet.appendRow(newRow);
    return { status: "success", message: "User created successfully." };
}

function handleCreateGatePass(postData, spreadSheet) {
    const gatePassHeaders = ["SL No.", "Gate Pass No", "Date & Time", "Requester", "Department", "Item", "Quantity", "Unit", "Type", "Status", "Purpose", "Vehicle Info"];
    const sheet = getOrCreateSheet(spreadSheet, GATE_PASS_SHEET_NAME, gatePassHeaders);
    
    LOCK.waitLock(30000);
    try {
      const lastRow = sheet.getLastRow();
      const lastSl = lastRow > 1 ? sheet.getRange(2, 1).getValue() : 0;
      const newSl = (typeof lastSl === 'number' ? lastSl : 0) + 1;

      const newRowData = [newSl, postData.gatePassNo || '', postData.createdAt || '', postData.requesterName || '', postData.department || '', postData.itemName || '', postData.quantity || '', postData.unit || '', postData.type || '', postData.status || '', postData.purpose || '', postData.vehicleInfo || ''];
      
      sheet.insertRowBefore(2);
      sheet.getRange(2, 1, 1, newRowData.length).setValues([newRowData]);
    } finally {
      LOCK.releaseLock();
    }
    return { status: "success", message: "Gate Pass data received." };
}

function handleUpdateGatePass(postData, spreadSheet) {
    const sheet = spreadSheet.getSheetByName(GATE_PASS_SHEET_NAME);
    if (!sheet) throw new Error("GatePasses sheet not found.");
    
    const rowIndex = postData.data.rowIndex;
    if (!rowIndex) throw new Error("Row index is required for update.");

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRowValues = headers.map(header => postData.data[header] !== undefined ? postData.data[header] : '');
    
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRowValues]);
    return { status: "success", data: "Row updated successfully." };
}

function handleDeleteGatePass(postData, spreadSheet) {
    const sheet = spreadSheet.getSheetByName(GATE_PASS_SHEET_NAME);
    if (!sheet) throw new Error("GatePasses sheet not found.");

    const rowIndex = postData.rowIndex;
    if (!rowIndex || rowIndex <= 1) throw new Error("Valid row index is required for delete.");
    
    sheet.deleteRow(rowIndex);
    return { status: "success", data: "Row deleted successfully." };
}

function doGet(e) {
  return ContentService.createTextOutput("Google Apps Script is running. Please use POST requests for actions.").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    let postData;
    let action;

    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
      action = postData.action;
      if (!action && postData.email && postData.password) {
        action = 'signup';
      }
    } else if (e.parameter && e.parameter.data) {
      postData = JSON.parse(e.parameter.data);
      if (postData.gatePassNo) action = 'createGatePass';
    }

    if (!action) throw new Error("Could not determine action.");
    
    const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
    let response;
    
    switch (action) {
        case 'login':
            response = handleLoginLogic(postData, spreadSheet);
            break;
        case 'signup':
            response = handleSignup(postData, spreadSheet);
            break;
        case 'createGatePass':
            response = handleCreateGatePass(postData, spreadSheet);
            break;
        case 'getGatePasses':
            response = getGatePassesLogic(spreadSheet);
            break;
        case 'updateGatePass':
            response = handleUpdateGatePass(postData, spreadSheet);
            break;
        case 'deleteGatePass':
            response = handleDeleteGatePass(postData, spreadSheet);
            break;
        default:
            throw new Error("Invalid action specified.");
    }
    
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
`.trim();

    const handleCopyCode = () => {
        navigator.clipboard.writeText(combinedCodeString).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Google Sheet Integration</h2>
                
                {!isPasswordSet ? (
                     <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400">
                        <p className="text-yellow-800 dark:text-yellow-300">
                            No Google Sheet URL and password have been set. Please complete the setup to enable all application features.
                        </p>
                        <button onClick={() => handleOpenModal('setup')} className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700">
                           সেট পাসওয়ার্ড
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                Current Google Apps Script URL
                            </label>
                            <input
                                type="text"
                                value={googleSheetUrl}
                                readOnly
                                className="mt-1 block w-full px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button onClick={() => handleOpenModal('change')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
                                Change URL & Password
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-2">Setup Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                        <li>Create a <strong className="font-semibold">new Google Sheet</strong>. This sheet will hold both user and gate pass data in separate tabs.</li>
                        <li>Go to Extensions &gt; Apps Script. Paste the code below and save the project.</li>
                        <li>Click "Deploy" &gt; "New deployment". Select "Web app" as the type.</li>
                        <li>Configure: Execute as "Me", Who has access: "Anyone". Click "Deploy".</li>
                        <li>Authorize access when prompted. Copy the generated Web app URL and paste it into the setup form.</li>
                        <li>The script will automatically create "Users" and "GatePasses" tabs in your sheet when data is first sent.</li>
                    </ol>
                </div>

                 <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                         <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Unified Apps Script Code</h3>
                         <button onClick={handleCopyCode} className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                            <CopyIcon />
                            {copySuccess ? 'Copied!' : 'Copy Code'}
                         </button>
                    </div>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm text-gray-800 dark:text-gray-200">
                        <code>{combinedCodeString}</code>
                    </pre>
                </div>
            </div>

            <Modal
                title={modalMode === 'setup' ? 'Set Password and URL' : 'Change URL & Password'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                size="lg"
            >
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                     {modalMode === 'change' && (
                        <div>
                            <label
                                htmlFor="currentPassword"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                Current Password
                            </label>
                            <input
                                type="password"
                                id="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                    )}
                    {modalMode === 'setup' && (
                        <>
                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>
                        </>
                    )}
                     <div>
                        <label
                            htmlFor="newUrl"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                           Google Apps Script URL
                        </label>
                        <input
                            type="url"
                            id="newUrl"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Enter your deployed Web App URL"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
                    <div className="flex items-center justify-end pt-4 space-x-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            Save Settings
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Settings;
