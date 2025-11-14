
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import { GatePass, Item } from '../../types';
import { USERS } from '../../constants';

// SVG Icons
const GatePassIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const PendingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const OverdueIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);
const ItemsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
);


const chartData = [
  { name: 'Jan', outgoing: 40, incoming: 24 },
  { name: 'Feb', outgoing: 30, incoming: 13 },
  { name: 'Mar', outgoing: 45, incoming: 30 },
  { name: 'Apr', outgoing: 27, incoming: 39 },
  { name: 'May', outgoing: 55, incoming: 48 },
  { name: 'Jun', outgoing: 34, incoming: 23 },
];

interface DashboardProps {
    gatePasses: GatePass[];
    items: Item[];
}

const Dashboard: React.FC<DashboardProps> = ({ gatePasses, items }) => {
  const today = new Date().toISOString().split('T')[0];
  const totalPassesToday = gatePasses.filter(p => p.createdAt.startsWith(today)).length;
  const pendingReturns = gatePasses.filter(p => p.status === 'Delivered' && p.type === 'Returnable').length;
  const overdueItems = gatePasses.filter(p => p.status === 'Overdue').length;
  const totalItemsInStock = items.reduce((sum, item) => sum + item.stock, 0);

  const recentActivity = gatePasses.slice(0, 5);

  const getItemName = (itemId: string) => items.find(i => i.id === itemId)?.name || 'Unknown Item';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card icon={<GatePassIcon/>} title="Gate Pass Today" value={totalPassesToday} />
        <Card icon={<PendingIcon/>} title="Pending Returns" value={pendingReturns} />
        <Card icon={<OverdueIcon/>} title="Overdue Items" value={overdueItems} className="!border-red-500/50" />
        <Card icon={<ItemsIcon/>} title="Total Items Out" value={totalItemsInStock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Movement Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Monthly Movement</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
              <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-gray-500 dark:text-gray-400 text-xs" />
              <YAxis tick={{ fill: 'currentColor' }} className="text-gray-500 dark:text-gray-400 text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '0.5rem',
                }}
                cursor={{ fill: 'rgba(128,128,128,0.1)' }}
              />
              <Legend />
              <Bar dataKey="outgoing" fill="#4f46e5" name="Outgoing" radius={[4, 4, 0, 0]} />
              <Bar dataKey="incoming" fill="#818cf8" name="Incoming" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Recent Activity</h2>
          <ul className="space-y-4">
            {recentActivity.map(pass => (
              <li key={pass.id} className="flex items-start space-x-3">
                 <div className="flex-shrink-0 mt-1 w-3 h-3 rounded-full bg-indigo-500"></div>
                 <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {getItemName(pass.items[0].itemId)}
                        <span className="text-xs text-gray-500 dark:text-gray-400"> ({pass.items[0].quantity} pcs)</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        GP: {pass.gatePassNo} by {pass.requesterName}
                    </p>
                 </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;