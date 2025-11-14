import { GatePassSheetData } from '../types';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        throw new Error('Network response was not ok.');
    }
    const result = await response.json();
    if (result.status === 'success') {
        return result.data;
    } else {
        throw new Error(result.message || 'An error occurred with the Google Sheet operation.');
    }
};

export const getGatePassesFromSheet = async (sheetUrl: string): Promise<GatePassSheetData[]> => {
    const response = await fetch(sheetUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'getGatePasses' }),
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
    });

    return handleResponse(response);
};

export const updateGatePassInSheet = async (sheetUrl: string, rowData: GatePassSheetData): Promise<any> => {
    const response = await fetch(sheetUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'updateGatePass', data: rowData }),
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
    });
    return handleResponse(response);
};


export const deleteGatePassInSheet = async (sheetUrl: string, rowIndex: number): Promise<any> => {
     const response = await fetch(sheetUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'deleteGatePass', rowIndex: rowIndex }),
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
    });
    return handleResponse(response);
};