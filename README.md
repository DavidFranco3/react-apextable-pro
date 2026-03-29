# 🚀 ApexTable Pro

**ApexTable** is a high-performance, professional-grade React data table library built on top of `react-data-table-component`. It evolves the standard data table into a feature-rich "Power Grid" with native support for persistence, advanced sticky columns, multi-sorting, and high-fidelity exports.

[![npm version](https://img.shields.io/badge/npm-1.0.0-blue.svg)](https://www.npmjs.com/package/react-apextable-pro)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/DavidFranco3/react-apextable-pro)
[![License: ISC](https://img.shields.io/badge/License-ISC-brightgreen.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

---

## ✨ Features that set us apart

- 💾 **State Persistence**: Never lose your view configuration. ApexTable automatically remembers column visibility, sticky pins, active filters, and sort orders across page reloads.
- 📌 **Dynamic Sticky Columns**: Fix up to 3 columns to the left. The library automatically calculates pixel-perfect offsets to prevent overlap and maintains background integrity.
- 🔄 **Intelligent Multi-Sort**: Shift+Click to sort by multiple columns. Includes visual indicators and priority numbering (1, 2, 3...).
- 🔍 **Global Smart Filter**: Real-time, debounced search across all table fields with zero extra configuration.
- 📤 **High-Fidelity Exports**: One-click **CSV** and **PDF** generation. PDF exports include auto-calculated table layouts and professional headers.
- 🌓 **Premium Design System**: Built-in support for Dark Mode using CSS variables. Gorgeous, modern aesthetics that feel truly "premium".
- 🏗️ **TypeScript First**: Robust type definitions for `ApexTableColumn` and `ApexTableProps` to catch errors at compile-time.

---

## 📦 Installation

```bash
npm install react-apextable-pro
```

### Required Peer Dependencies
Ensure these are present in your project:
```bash
npm install react-data-table-component react-csv jspdf jspdf-autotable sweetalert2 prop-types
```

### External Assets
ApexTable uses **FontAwesome** for its interactive icons. Add this to your `index.html`:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
```

---

## 🚀 Usage Examples

### 1. Basic Implementation
Perfect for simple data listing with full search and persistence.

```tsx
import { ApexTable, ApexTableColumn } from 'react-apextable-pro';

const data = [
  { id: 1, name: 'John Doe', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', role: 'Editor', status: 'Inactive' },
];

const columns: ApexTableColumn<typeof data[0]>[] = [
  { name: 'ID', selector: row => row.id, sortable: true, width: '80px' },
  { name: 'Nombre', selector: row => row.name, sortable: true },
  { name: 'Rol', selector: row => row.role, sortable: true },
  { name: 'Estado', selector: row => row.status, sortable: true },
];

function App() {
  return (
    <div className="container">
      <ApexTable 
        datos={data}
        columnas={columns}
        storagePrefix="user_management" // Unique key for state persistence
      />
    </div>
  );
}
```

### 2. Advanced Performance (Inventory Demo)
Showcasing custom cell rendering, conditional styling, and expandable rows.

```tsx
import { ApexTable } from 'react-apextable-pro';

const columns = [
  { 
    name: 'Stock', 
    selector: row => row.stock,
    cell: row => (
      <div style={{ color: row.stock < 5 ? 'red' : 'green' }}>
        {row.stock} units
      </div>
    )
  },
  {
    name: 'Price',
    selector: row => row.price,
    cell: row => `$${row.price.toFixed(2)}`
  }
];

const ExpandDetails = ({ data }) => (
  <div style={{ padding: '20px' }}>
    <h4>Detailed view for {data.name}</h4>
    <p>Last inventory check: {data.last_check}</p>
  </div>
);

function Inventory() {
  return (
    <ApexTable 
      datos={inventoryData}
      columnas={columns}
      expandableRows={true}
      expandableRowsComponent={ExpandDetails}
      conditionalRowStyles={[
        {
          when: row => row.stock === 0,
          style: { backgroundColor: '#fff5f5' }
        }
      ]}
    />
  );
}
```

---

## 📖 API Reference

### ApexTable Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `datos` | `T[]` | `[]` | **Required**. The data array to display. |
| `columnas` | `ApexTableColumn<T>[]` | `[]` | **Required**. Column definitions. |
| `storagePrefix` | `string` | `"dt_config"` | Prefix for `localStorage` keys to persist state. |
| `hiddenOptions` | `boolean` | `false` | If true, hides the search bar and action buttons. |
| `expandableRows` | `boolean` | `false` | Enables expandable row functionality. |
| `expandableRowsComponent` | `React.FC` | `null` | Component to render when a row is expanded. |
| `...otherProps` | `TableProps` | `-` | Any prop supported by `react-data-table-component`. |

---

## 🎨 Design & Customization

### Dark Mode
ApexTable detects dark mode via the `.dark` class on the `<html>` or `<body>` element. It automatically switches colors for:
- Header background and text.
- Row background and text.
- Pagination controls.
- Modals and inputs.

### Custom CSS Variables
You can override the theme by defining these variables in your CSS:

```css
:root {
  --dt-primary: #764ba2;
  --dt-bg: #ffffff;
  --dt-header-bg: #f8fafc;
  --dt-border-color: #e2e8f0;
}

/* Dark mode overrides */
.dark {
  --dt-bg: #1e293b;
  --dt-header-bg: #0f172a;
}
```

---

## 🤝 Contributing

We welcome contributions! If you find a bug or have a feature request, please open an issue or submit a pull request on the repository.

---

## 📄 License
ApexTable is released under the **ISC License**. Created with ❤️ by the community.
