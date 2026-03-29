import React from 'react';
import { ApexTable } from '../src/index';
import type { ApexTableColumn } from '../src/index';

interface Product {
    id: number;
    sku: string;
    name: string;
    category: string;
    stock: number;
    price: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    lastUpdated: string;
}

const productData: Product[] = [
    { id: 1, sku: 'GA-001', name: 'Galaxy Z Fold 5', category: 'Smartphones', stock: 15, price: 1799.99, status: 'In Stock', lastUpdated: '2026-03-20' },
    { id: 2, sku: 'IP-014', name: 'iPhone 15 Pro Max', category: 'Smartphones', stock: 3, price: 1199.00, status: 'Low Stock', lastUpdated: '2026-03-21' },
    { id: 3, sku: 'MB-002', name: 'MacBook Air M2', category: 'Laptops', stock: 8, price: 999.00, status: 'In Stock', lastUpdated: '2026-03-18' },
    { id: 4, sku: 'SN-088', name: 'Sony WH-1000XM5', category: 'Audio', stock: 0, price: 349.99, status: 'Out of Stock', lastUpdated: '2026-03-15' },
    { id: 5, sku: 'AP-008', name: 'AirPods Pro 2', category: 'Audio', stock: 25, price: 249.00, status: 'In Stock', lastUpdated: '2026-03-22' },
    { id: 6, sku: 'DZ-010', name: 'DJI Mavic 3', category: 'Drones', stock: 2, price: 2049.00, status: 'Low Stock', lastUpdated: '2026-03-19' },
    { id: 7, sku: 'NS-001', name: 'Nintendo Switch OLED', category: 'Gaming', stock: 12, price: 349.00, status: 'In Stock', lastUpdated: '2026-03-23' },
    { id: 8, sku: 'PS-005', name: 'PlayStation 5', category: 'Gaming', stock: 5, price: 499.00, status: 'In Stock', lastUpdated: '2026-03-24' },
    { id: 9, sku: 'LG-100', name: 'LG C3 OLED 65"', category: 'TV', stock: 1, price: 1699.00, status: 'Low Stock', lastUpdated: '2026-03-25' },
    { id: 10, sku: 'KM-002', name: 'Keychron K2 V2', category: 'Accessories', stock: 40, price: 79.00, status: 'In Stock', lastUpdated: '2026-03-20' },
];

const productColumns: ApexTableColumn<Product>[] = [
    { name: 'SKU', selector: (row) => row.sku, sortable: true, width: '100px' },
    { name: 'Producto', selector: (row) => row.name, sortable: true, grow: 2 },
    { name: 'Categoría', selector: (row) => row.category, sortable: true },
    { 
        name: 'Precio', 
        selector: (row) => row.price, 
        sortable: true,
        cell: (row) => (
            <span style={{ fontWeight: 'bold', color: '#2d3748' }}>
                ${row.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
        )
    },
    { 
        name: 'Stock', 
        selector: (row) => row.stock, 
        sortable: true,
        center: true,
        cell: (row) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: row.stock > 10 ? '#48bb78' : row.stock > 0 ? '#f6ad55' : '#f56565' 
                }} />
                {row.stock} uds
            </div>
        )
    },
    { 
        name: 'Estado', 
        selector: (row) => row.status, 
        sortable: true,
        cell: (row) => {
            const colors = {
                'In Stock': { bg: '#c6f6d5', text: '#22543d' },
                'Low Stock': { bg: '#feebc8', text: '#744210' },
                'Out of Stock': { bg: '#fed7d7', text: '#822727' }
            };
            const style = colors[row.status];
            return (
                <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    backgroundColor: style.bg,
                    color: style.text
                }}>
                    {row.status}
                </span>
            );
        }
    },
    {
        name: 'Acciones',
        cell: () => (
            <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ padding: '6px', border: 'none', background: '#e2e8f0', borderRadius: '4px', cursor: 'pointer' }}>
                    <i className="fas fa-edit" style={{ color: '#4a5568' }}></i>
                </button>
                <button style={{ padding: '6px', border: 'none', background: '#fed7d7', borderRadius: '4px', cursor: 'pointer' }}>
                    <i className="fas fa-trash" style={{ color: '#c53030' }}></i>
                </button>
            </div>
        )
    }
];

const ExpandedComponent: React.FC<{ data: Product }> = ({ data }) => (
    <div style={{ padding: '20px', backgroundColor: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Detalles del Producto: {data.name}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <p><strong>Ultima actualización:</strong> {data.lastUpdated}</p>
            <p><strong>Ubicación Almacén:</strong> Pasillo A, Estante 4</p>
            <p><strong>Proveedor:</strong> TechGlobal Corp</p>
            <p><strong>Impuestos:</strong> 16% IVA incluido</p>
        </div>
    </div>
);

export const InventoryDemo = () => {
    return (
        <ApexTable 
            datos={productData}
            columnas={productColumns}
            storagePrefix="inventory_demo"
            expandableRows={true}
            expandableRowsComponent={ExpandedComponent}
            conditionalRowStyles={[
                {
                    when: (row: Product) => row.stock === 0,
                    style: {
                        backgroundColor: '#fff5f5',
                        color: '#c53030'
                    }
                }
            ]}
        />
    );
};
