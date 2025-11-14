import React, { useState, useEffect } from 'react';
import { User, Role, Item, GatePass, Requester, RequesterCategory } from './types';
import { USERS, ITEMS, GATE_PASSES, REQUESTERS } from './constants';
import Dashboard from './components/views/Dashboard';
import GatePasses from './components/views/GatePasses';
import GatePassDetails from './components/views/GatePassDetails';
import Items from './components/views/Items';
import ManageRequesters from './components/views/ManageRequesters';
import Settings from './components/views/Settings';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import { loginUser, signupUser } from './services/authService';


// --- ICONS ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const GatePassIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ItemsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const ReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

type View = 'dashboard' | 'gate-passes' | 'gate-pass-details' | 'items' | 'requester-management' | 'settings';

const PERMISSIONS: { [key in Role]: View[] } = {
    [Role.Admin]: ['dashboard', 'gate-passes', 'gate-pass-details', 'items', 'requester-management', 'settings'],
    [Role.Security]: ['dashboard', 'gate-passes'],
    [Role.DepartmentHead]: ['dashboard', 'gate-passes'],
    [Role.StoreOfficer]: ['dashboard', 'gate-passes', 'items'],
};


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const [gatePasses, setGatePasses] = useState<GatePass[]>(GATE_PASSES);
  const [items, setItems] = useState<Item[]>(ITEMS);
  const [requesters, setRequesters] = useState<Requester[]>(REQUESTERS);
  const [requesterCategories, setRequesterCategories] = useState<RequesterCategory[]>([...new Set(REQUESTERS.map(r => r.category))].sort());
  
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>('');
  const [isPasswordSet, setIsPasswordSet] = useState<boolean>(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedUrl = localStorage.getItem('googleSheetUrl');
    const savedPassword = localStorage.getItem('appPassword');
    if (savedUrl) setGoogleSheetUrl(savedUrl);
    if (savedPassword) setIsPasswordSet(true);
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
        setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  };

  const handleLogin = async (email: string, password: string): Promise<User | null> => {
    // Default admin login for initial setup
    if (email === 'admin@jabedagro.com' && password === 'admin123') {
        const adminUser: User = {
            id: 'temp-admin',
            name: 'Default Admin',
            email: 'admin@jabedagro.com',
            role: Role.Admin,
        };
        setCurrentUser(adminUser);
        setIsAuthenticated(true);
        setActiveView('dashboard');
        showNotification('Logged in as Default Admin. Please configure the Google Sheet URL in Settings.', 'success');
        return adminUser;
    }

    if (!googleSheetUrl) {
      showNotification('Google Sheet URL is not configured. Please use the default admin credentials or set the URL in Settings.', 'error');
      return null;
    }
    try {
      const user = await loginUser(googleSheetUrl, email, password);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setActiveView('dashboard');
        showNotification(`Welcome back, ${user.name}!`);
        return user;
      }
    } catch (error: any) {
        showNotification(error.message, 'error');
        return null;
    }
    return null;
  };

  const handleSignup = async (userData: Omit<User, 'id'>): Promise<boolean> => {
     if (!googleSheetUrl) {
      showNotification('Google Sheet URL is not configured. Please set the URL in Settings.', 'error');
      return false;
    }
    try {
        await signupUser(googleSheetUrl, userData);
        showNotification('Signup successful! Please log in.', 'success');
        setAuthView('login');
        return true;
    } catch (error: any) {
        showNotification(error.message, 'error');
        return false;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const addGatePass = (pass: GatePass) => {
    setGatePasses(prev => [pass, ...prev]);
  };

  const updateGatePass = (updatedPass: GatePass) => {
    setGatePasses(prev => prev.map(pass => pass.id === updatedPass.id ? updatedPass : pass));
  };

  const updateItemStock = (itemId: string, quantityChange: number) => {
    setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, stock: item.stock - quantityChange } : item
    ));
  };
  
  const addRequester = (requester: Omit<Requester, 'id'>) => {
      const newRequester = { ...requester, id: `r-${Date.now()}` };
      setRequesters(prev => [...prev, newRequester]);
  };

  const updateRequester = (updatedRequester: Requester) => {
      setRequesters(prev => prev.map(r => r.id === updatedRequester.id ? updatedRequester : r));
  };
  
  const deleteRequester = (requesterId: string) => {
      setRequesters(prev => prev.filter(r => r.id !== requesterId));
  };

  const addRequesterCategory = (category: RequesterCategory) => {
    if (category && !requesterCategories.includes(category)) {
      setRequesterCategories(prev => [...prev, category].sort());
    }
  };

  const deleteRequesterCategory = (category: RequesterCategory) => {
    if (requesters.some(r => r.category === category)) {
      alert(`Cannot delete category "${category}" as it is being used by one or more requesters.`);
      return;
    }
    setRequesterCategories(prev => prev.filter(c => c !== category));
  };
  
  const addItem = (item: Omit<Item, 'id'>) => {
    const newItem = { ...item, id: `i-${Date.now()}` };
    setItems(prev => [newItem, ...prev]);
  };

  const updateItem = (updatedItem: Item) => {
      setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const deleteItem = (itemId: string) => {
      if (gatePasses.some(gp => gp.items.some(i => i.itemId === itemId))) {
          alert("Cannot delete this item as it is used in one or more gate passes.");
          return;
      }
      setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const bulkAddItems = (newItems: Omit<Item, 'id'>[]) => {
      const existingCodes = new Set(items.map(i => i.code.toLowerCase()));
      const itemsToAdd = newItems.filter(newItem => !existingCodes.has(newItem.code.toLowerCase()));

      if (itemsToAdd.length === 0) {
          showNotification("No new items to import. All items in the file already exist (based on item code).", 'error');
          return;
      }

      const itemsWithIds = itemsToAdd.map((item, index) => ({
          ...item,
          id: `i-${Date.now()}-${index}`
      }));

      setItems(prev => [...prev, ...itemsWithIds]);
      showNotification(`${itemsToAdd.length} new item(s) imported successfully.`);
  };

   const handleSaveGoogleSheetUrl = (url: string) => {
        localStorage.setItem('googleSheetUrl', url);
        setGoogleSheetUrl(url);
    };

    const handleSavePassword = (password: string) => {
        localStorage.setItem('appPassword', password);
        setIsPasswordSet(true);
    };


  const renderView = () => {
    if (!currentUser || !PERMISSIONS[currentUser.role].includes(activeView)) {
        return <div className="p-8"><h1 className="text-2xl text-red-500">Access Denied</h1><p className="text-gray-600 dark:text-gray-400">You do not have permission to view this page.</p></div>;
    }
    switch (activeView) {
      case 'dashboard':
        return <Dashboard gatePasses={gatePasses} items={items} />;
      case 'gate-passes':
        return <GatePasses 
                    currentUser={currentUser}
                    gatePasses={gatePasses} 
                    items={items} 
                    requesters={requesters}
                    requesterCategories={requesterCategories}
                    addGatePass={addGatePass} 
                    updateGatePass={updateGatePass} 
                    updateItemStock={updateItemStock} 
                    googleSheetUrl={googleSheetUrl}
                    showNotification={showNotification}
                    onAddItem={addItem}
                />;
      case 'gate-pass-details':
        return <GatePassDetails 
                  googleSheetUrl={googleSheetUrl}
                  showNotification={showNotification}
                />;
      case 'items':
        return <Items 
                    items={items} 
                    onAddItem={addItem}
                    onUpdateItem={updateItem}
                    onDeleteItem={deleteItem}
                    onBulkAddItems={bulkAddItems}
                />;
      case 'requester-management':
        return <ManageRequesters 
                    requesters={requesters}
                    categories={requesterCategories}
                    onAddRequester={addRequester}
                    onUpdateRequester={updateRequester}
                    onDeleteRequester={deleteRequester}
                    onAddCategory={addRequesterCategory}
                    onDeleteCategory={deleteRequesterCategory}
                />;
      case 'settings':
        return <Settings
            googleSheetUrl={googleSheetUrl}
            onSaveGoogleSheetUrl={handleSaveGoogleSheetUrl}
            isPasswordSet={isPasswordSet}
            onSavePassword={handleSavePassword}
            showNotification={showNotification}
        />;
      default:
        return <div className="p-8"><h1 className="text-2xl text-gray-800 dark:text-white">Page not found or not yet implemented.</h1></div>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
        {notification && (
            <div className={`fixed top-5 z-50 p-4 rounded-md text-white transition-opacity duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`} role="alert">
                <span>{notification.message}</span>
                <button onClick={() => setNotification(null)} className="absolute top-1/2 right-2.5 transform -translate-y-1/2 font-bold text-lg p-1 leading-none">&times;</button>
            </div>
        )}
        {authView === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} />
        ) : (
          <Signup onSignup={handleSignup} onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  const NavLink: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => {
    if (!currentUser || !PERMISSIONS[currentUser.role].includes(view)) {
        return null;
    }
    return (
      <button 
        onClick={() => { setActiveView(view); setSidebarOpen(false); }}
        title={isSidebarCollapsed ? label : undefined}
        className={`flex items-center w-full py-3 text-sm font-medium transition-colors duration-200 rounded-md ${
          isSidebarCollapsed ? 'justify-center px-2' : 'px-4'
        } ${
          activeView === view
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        {icon}
        <span className={`ml-4 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'inline-block'}`}>{label}</span>
      </button>
    );
  };

  return (
    <div className="relative min-h-screen md:flex font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
          <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
              aria-hidden="true"
          ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 flex-shrink-0 bg-white dark:bg-gray-800 shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform md:transition-[width] duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`py-4 flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
          <h2 className={`text-2xl font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap transition-opacity ${isSidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Jabed Agro</h2>
          <button 
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} 
              className="hidden md:block p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Toggle sidebar"
          >
              <MenuIcon />
          </button>
        </div>
        <div className="flex flex-col h-[calc(100%-64px)]">
          <nav className="mt-6 px-2 space-y-1 flex-grow">
            <NavLink view="dashboard" label="Dashboard" icon={<DashboardIcon />} />
            <NavLink view="gate-passes" label="Gate Passes" icon={<GatePassIcon />} />
            <NavLink view="gate-pass-details" label="Gate Pass Details" icon={<ReportIcon />} />
            <NavLink view="items" label="Item Management" icon={<ItemsIcon />} />
            <NavLink view="requester-management" label="Requester Management" icon={<UsersIcon />} />
          </nav>
          <div className="px-2 space-y-1">
              <NavLink view="settings" label="Settings" icon={<SettingsIcon />} />
              <button 
                onClick={handleLogout} 
                title={isSidebarCollapsed ? "Logout" : undefined}
                className={`flex items-center w-full py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 rounded-md mb-2 ${
                    isSidebarCollapsed ? 'justify-center' : 'px-4'
                }`}
              >
                  <LogoutIcon />
                  <span className={`ml-4 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'inline-block'}`}>Logout</span>
              </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm z-10">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 dark:text-gray-400 focus:outline-none md:hidden">
              <MenuIcon />
            </button>
            <h1 className="text-xl font-semibold text-gray-700 dark:text-white ml-4 md:ml-0 capitalize">{activeView.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none">
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className="text-right">
                <p className="font-semibold text-gray-800 dark:text-white">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.role}</p>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 relative">
          {notification && (
            <div className={`sticky top-0 z-40 p-3 text-center text-white transition-opacity duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`} role="alert">
                <span>{notification.message}</span>
                <button onClick={() => setNotification(null)} className="absolute top-1/2 right-4 transform -translate-y-1/2 font-bold text-lg p-1 leading-none">&times;</button>
            </div>
           )}
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
