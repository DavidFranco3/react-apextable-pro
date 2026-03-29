import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ApexTable } from '../src/index';
import type { ApexTableColumn } from '../src/index';
import { InventoryDemo } from './InventoryDemo';

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2026-03-28' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Inactive', lastLogin: '2026-03-27' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'Active', lastLogin: '2026-03-26' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Admin', status: 'Active', lastLogin: '2026-03-25' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Editor', status: 'Active', lastLogin: '2026-03-24' },
];

const columns: ApexTableColumn<typeof data[0]>[] = [
  { name: 'ID', selector: (row: any) => row.id, sortable: true, width: '80px' },
  { name: 'Nombre', selector: (row: any) => row.name, sortable: true },
  { name: 'Email', selector: (row: any) => row.email, sortable: true },
  { name: 'Rol', selector: (row: any) => row.role, sortable: true },
  { 
    name: 'Estado', 
    selector: (row: any) => row.status, 
    sortable: true,
    cell: (row: any) => (
      <span style={{ 
        padding: '4px 10px', 
        borderRadius: '12px', 
        fontSize: '11px', 
        fontWeight: 'bold',
        backgroundColor: row.status === 'Active' ? '#e6fffa' : '#fff5f5',
        color: row.status === 'Active' ? '#2c7a7b' : '#c53030'
      }}>
        {row.status}
      </span>
    )
  },
];

const App = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'users' | 'inventory'>('inventory');

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div style={{ 
      padding: '40px', 
      minHeight: '100vh', 
      backgroundColor: isDark ? '#0f172a' : '#f8f9fa',
      transition: 'background-color 0.2s ease',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px' 
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              color: isDark ? '#f1f5f9' : '#1e293b',
              fontSize: '28px'
            }}>
              ApexTable Showcase
            </h1>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button 
                    onClick={() => setActiveDemo('users')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: activeDemo === 'users' ? '#764ba2' : '#e2e8f0',
                        color: activeDemo === 'users' ? 'white' : '#4a5568',
                        cursor: 'pointer',
                        fontSize: '13px'
                    }}
                >
                    Demo Usuarios
                </button>
                <button 
                    onClick={() => setActiveDemo('inventory')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: activeDemo === 'inventory' ? '#764ba2' : '#e2e8f0',
                        color: activeDemo === 'inventory' ? 'white' : '#4a5568',
                        cursor: 'pointer',
                        fontSize: '13px'
                    }}
                >
                    Demo Inventario (Premium)
                </button>
            </div>
          </div>
          
          <button 
            onClick={toggleDarkMode}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#f1f5f9' : '#1e293b',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            <i className={isDark ? "fas fa-sun" : "fas fa-moon"}></i>
            {isDark ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
        </header>

        {activeDemo === 'users' ? (
            <ApexTable 
                datos={data}
                columnas={columns}
                storagePrefix="demo_users"
            />
        ) : (
            <InventoryDemo />
        )}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
