import React, { useState, useEffect, useMemo, useRef } from "react";
import DataTable from "react-data-table-component";
import type { TableProps, ConditionalStyles } from "react-data-table-component";
import { CSVLink } from "react-csv";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from 'sweetalert2';
import DebouncedInput from "./DebouncedInput";

// Extend TableColumn to include our custom properties
export interface ApexTableColumn<T> {
    name: string;
    selector?: (row: T) => any;
    sortable?: boolean;
    sortFunction?: (a: T, b: T) => number;
    right?: boolean;
    center?: boolean;
    compact?: boolean;
    wrap?: boolean;
    grow?: number;
    maxWidth?: string;
    minWidth?: string;
    width?: string;
    cell?: (row: T) => React.ReactNode;
    [key: string]: any;
}

export interface ApexTableProps<T> extends Omit<TableProps<T>, 'columns' | 'data' | 'expandableRowExpanded'> {
    datos: T[];
    columnas: ApexTableColumn<T>[];
    hiddenOptions?: boolean;
    expandableRows?: boolean;
    expandableRowsComponent?: React.FC<{ data: T }>;
    expandableRowExpanded?: (row: T) => boolean;
    conditionalRowStyles?: ConditionalStyles<T>[];
    storagePrefix?: string;
}

interface SortConfig {
    columnName: string;
    selector?: any;
    sortFunction?: any;
    direction: 'asc' | 'desc';
}

const ApexTable = <T extends Record<string, any>>({
    datos = [],
    columnas = [],
    hiddenOptions = false,
    expandableRows = false,
    expandableRowsComponent,
    expandableRowExpanded,
    conditionalRowStyles = [],
    storagePrefix = "dt_config",
    ...otherProps
}: ApexTableProps<T>) => {
    
    // ✅ unique key for this table instance on this page
    const storageKey = useMemo(() => {
        if (typeof window === 'undefined') return '';
        const path = window.location.pathname;
        const colNames = columnas.map(c => c.name).join(',');
        let hash = 0;
        for (let i = 0; i < colNames.length; i++) {
            const char = colNames.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return `${storagePrefix}_${path}_${hash}`;
    }, [columnas, storagePrefix]);

    const [filterValue, setFilterValue] = useState<string>(() => {
        if (typeof window === 'undefined') return "";
        const saved = localStorage.getItem(`${storageKey}_filter`);
        return saved || "";
    });
    
    const [filteredData, setFilteredData] = useState<T[]>(datos);

    const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
        const allNames = columnas.map((col) => col.name);
        if (typeof window === 'undefined') return allNames;
        const saved = localStorage.getItem(`${storageKey}_visible`);
        if (!saved) return allNames;

        try {
            const parsed = JSON.parse(saved);
            const newColumns = allNames.filter(name => !parsed.includes(name));
            return [...parsed, ...newColumns];
        } catch (e) {
            return allNames;
        }
    });

    const [showModal, setShowModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [stickyColumns, setStickyColumns] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem(`${storageKey}_sticky`);
        return saved ? JSON.parse(saved) : [];
    });

    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [sortConfig, setSortConfig] = useState<SortConfig[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem(`${storageKey}_sort`);
        return saved ? JSON.parse(saved) : [];
    });
    
    const tableRef = useRef<HTMLDivElement>(null);

    // ✅ Sync state to localStorage
    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(`${storageKey}_visible`, JSON.stringify(visibleColumns));
        }
    }, [visibleColumns, storageKey]);

    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(`${storageKey}_sticky`, JSON.stringify(stickyColumns));
        }
    }, [stickyColumns, storageKey]);

    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(`${storageKey}_filter`, filterValue);
        }
    }, [filterValue, storageKey]);

    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(`${storageKey}_sort`, JSON.stringify(sortConfig));
        }
    }, [sortConfig, storageKey]);

    // ✅ Sync states if columns/hash change without remounting
    useEffect(() => {
        if (!storageKey) return;

        const savedVisible = localStorage.getItem(`${storageKey}_visible`);
        const allNames = columnas.map(col => col.name);
        if (savedVisible) {
            try {
                const parsed = JSON.parse(savedVisible);
                const newColumns = allNames.filter(name => !parsed.includes(name));
                setVisibleColumns([...parsed, ...newColumns]);
            } catch (e) {
                setVisibleColumns(allNames);
            }
        }
        else setVisibleColumns(allNames);

        const savedSticky = localStorage.getItem(`${storageKey}_sticky`);
        if (savedSticky) setStickyColumns(JSON.parse(savedSticky));
        else setStickyColumns([]);

        const savedSort = localStorage.getItem(`${storageKey}_sort`);
        if (savedSort) setSortConfig(JSON.parse(savedSort));
        else setSortConfig([]);

        const savedFilter = localStorage.getItem(`${storageKey}_filter`);
        setFilterValue(savedFilter || "");
    }, [storageKey]);

    const handleFilterChange = (searchValue: string | number) => {
        const val = String(searchValue);
        setFilterValue(val);

        if (!val || val.length === 0) {
            setFilteredData(datos);
            return;
        }

        const searchLower = val.toLowerCase();

        const filtered = datos.filter((row) =>
            Object.values(row).some((value) => {
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(searchLower);
            })
        );

        setFilteredData(filtered);
    };

    const handleDoubleClick = (row: T) => {
        Swal.fire({
            title: 'Detalle de la Fila',
            html: `<pre style="text-align: left; font-size: 12px; background: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto;">${JSON.stringify(row, null, 2)}</pre>`,
            width: '600px',
            confirmButtonColor: '#764ba2'
        });
    };

    useEffect(() => {
        setFilteredData(datos);
    }, [datos]);

    const downloadPDF = () => {
        setIsExporting(true);
        setTimeout(() => {
            const doc = new jsPDF() as any;
            const tableColumn = columnas
                .filter((col) => visibleColumns.includes(col.name))
                .map((col) => col.name);

            const tableRows = datos.map((row) => {
                return columnas
                    .filter((col) => visibleColumns.includes(col.name))
                    .map((col) => {
                        let value;
                        if (typeof col.selector === "function") {
                            value = col.selector(row);
                        } else {
                            // Basic mapping if selector was a string property name (though we typed it as function)
                            value = (row as any)[col.selector as any];
                        }
                        const formattedValue =
                            value !== undefined &&
                                value !== null &&
                                typeof value === "object"
                                ? JSON.stringify(value)
                                : value || "";
                        return formattedValue;
                    });
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 20,
                theme: "grid",
                styles: {
                    halign: "justify",
                },
            });
            doc.save("data.pdf");
            setIsExporting(false);
        }, 100);
    };

    const handleColumnVisibilityChange = (columnName: string) => {
        setVisibleColumns((prevVisibleColumns) =>
            prevVisibleColumns.includes(columnName)
                ? prevVisibleColumns.filter((name) => name !== columnName)
                : [...prevVisibleColumns, columnName]
        );
    };

    const selectAllColumns = () => {
        setVisibleColumns(columnas.map((col) => col.name));
    };

    const deselectAllColumns = () => {
        setVisibleColumns([]);
    };

    const filteredColumns = useMemo(
        () => columnas.filter((col) => visibleColumns.includes(col.name)),
        [columnas, visibleColumns]
    );

    const orderedStickyColumns = useMemo(
        () => filteredColumns.filter((col) => stickyColumns.includes(col.name)),
        [filteredColumns, stickyColumns]
    );

    const toggleStickyColumn = (name: string) => {
        setStickyColumns((prev) => {
            const isSticky = prev.includes(name);
            if (isSticky) {
                return prev.filter((colName) => colName !== name);
            } else {
                if (prev.length < 3) {
                    return [...prev, name];
                }
                return prev;
            }
        });
    };

    useEffect(() => {
        if (!tableRef.current) return;

        const firstRow = tableRef.current.querySelector(".rdt_TableRow");
        if (!firstRow) return;

        const rowCells = firstRow.querySelectorAll(".rdt_TableCell");
        if (!rowCells.length) return;

        const newWidths: Record<string, number> = {};

        filteredColumns.forEach((col, index) => {
            if (rowCells[index]) {
                const width = rowCells[index].getBoundingClientRect().width;
                newWidths[col.name] = width;
            }
        });

        const oldKeys = Object.keys(columnWidths);
        const newKeys = Object.keys(newWidths);

        const sameLength = oldKeys.length === newKeys.length;
        const sameValues =
            sameLength &&
            newKeys.every((key) => columnWidths[key] === newWidths[key]);

        if (!sameValues) {
            setColumnWidths(newWidths);
        }
    }, [filteredColumns, columnWidths, filteredData.length]);

    const stickyOffsets = useMemo(() => {
        const offsets: Record<string, number> = {};
        let currentOffset = 0;

        orderedStickyColumns.forEach((col) => {
            offsets[col.name] = currentOffset;
            currentOffset += columnWidths[col.name] || 0;
        });

        return offsets;
    }, [orderedStickyColumns, columnWidths]);

    const dynamicStyles = useMemo(() => {
        return orderedStickyColumns
            .map((col, orderIndex) => {
                const index = filteredColumns.findIndex((c) => c.name === col.name);
                const offset = stickyOffsets[col.name];

                if (index === -1 || offset === undefined) return "";

                const zBase = 20 + orderIndex;

                return `
                    .rdt_TableCol:nth-child(${index + 1}),
                    .rdt_TableCell:nth-child(${index + 1}) {
                        position: sticky !important;
                        left: ${offset}px;
                        z-index: ${zBase};
                        background-color: var(--dt-row-hover-bg);
                        background-clip: padding-box;
                    }
                    .rdt_TableCol:nth-child(${index + 1}) {
                        z-index: ${zBase + 1};
                    }
                `;
            })
            .join("");
    }, [orderedStickyColumns, stickyOffsets, filteredColumns]);

    const handleColumnSort = (col: ApexTableColumn<T>, e: React.MouseEvent) => {
        if (col.sortable === false) return;
        if (!col.selector && !col.sortFunction && !col.name) return;

        const isShift = e.shiftKey;
        setSortConfig(prev => {
            const index = prev.findIndex(s => s.columnName === col.name);
            let updated = [...prev];

            if (!isShift) {
                if (index >= 0) {
                    const existing = prev[index];
                    if (existing) {
                      updated = [{ ...existing, direction: existing.direction === 'asc' ? 'desc' : 'asc' }];
                    }
                } else {
                    updated = [{ columnName: col.name, selector: col.selector, sortFunction: col.sortFunction, direction: 'asc' }];
                }
            } else {
                if (index >= 0) {
                    const existing = prev[index];
                    if (existing) {
                      if (existing.direction === 'asc') {
                          updated[index] = { ...existing, direction: 'desc' };
                      } else {
                          updated.splice(index, 1);
                      }
                    }
                } else {
                    updated.push({ columnName: col.name, selector: col.selector, sortFunction: col.sortFunction, direction: 'asc' });
                }
            }
            return updated;
        });
    };

    const renderSortIcon = (col: ApexTableColumn<T>) => {
        if (col.sortable === false) return null;
        if (!col.selector && !col.sortFunction) return null;

        const sortIndex = sortConfig.findIndex(s => s.columnName === col.name);

        if (sortIndex === -1) {
            return (
                <span className="ms-1" style={{ opacity: 0.3, fontSize: '11px', color: 'var(--dt-header-text)' }}>
                    <i className="fas fa-sort"></i>
                </span>
            );
        }

        const config = sortConfig[sortIndex];
        const isAsc = config ? config.direction === 'asc' : true;
        return (
            <span className="ms-1 d-flex align-items-center" style={{ fontSize: '12px', color: '#0d6efd', fontWeight: 'bold' }}>
                <i className={isAsc ? "fas fa-sort-up" : "fas fa-sort-down"}></i>
                {sortConfig.length > 1 && (
                    <small className="ms-1" style={{ fontSize: '10px' }}>
                        {sortIndex + 1}
                    </small>
                )}
            </span>
        );
    };

    const processedColumns = filteredColumns.map((col) => {
        const {
            right,
            center: colCenter,
            compact,
            wrap,
            grow,
            maxWidth,
            minWidth,
            width,
            reorder,
            ...safeProps
        } = col;

        const isSticky = stickyColumns.includes(col.name);
        const canBeMadeSticky = isSticky || stickyColumns.length < 3;
        const center = right ? false : (colCenter !== false);
        const isSortableColumn = col.sortable !== false && (col.selector || col.sortFunction);

        return {
            ...safeProps,
            right,
            center,
            compact,
            wrap: wrap !== undefined ? wrap : true,
            grow,
            maxWidth,
            minWidth,
            width,
            reorder,
            sortable: false, 
            name: (
                <div
                    className="custom-header-wrapper"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isSortableColumn) handleColumnSort(col, e);
                    }}
                    style={{
                        cursor: isSortableColumn ? "pointer" : "default",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        justifyContent: center ? 'center' : right ? 'flex-end' : 'flex-start',
                        userSelect: "none"
                    }}
                    title={isSortableColumn ? "Clic para ordenar. Shift+clic para ordenar por múltiples columnas" : ""}
                >
                    <label className="custom-checkbox-label" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            className="custom-checkbox-input"
                            checked={isSticky}
                            disabled={!canBeMadeSticky}
                            onChange={() => toggleStickyColumn(col.name)}
                        />
                        <span className="custom-checkbox-checkmark">
                            <i className="fas fa-thumbtack"></i>
                        </span>
                    </label>
                    <span className="custom-header-name" style={{ marginLeft: '8px' }}>{col.name}</span>
                    {isSortableColumn && renderSortIcon(col)}
                </div>
            ),
        };
    });

    const sortedData = useMemo(() => {
        if (sortConfig.length === 0) return filteredData;

        return [...filteredData].sort((a, b) => {
            for (let i = 0; i < sortConfig.length; i++) {
                const config = sortConfig[i];
                if (!config) continue;
                
                const { selector, sortFunction, direction } = config;
                const dirMultiplier = direction === 'asc' ? 1 : -1;

                if (sortFunction) {
                    const res = sortFunction(a, b);
                    if (res !== 0) return res * dirMultiplier;
                    continue;
                }

                if (!selector) continue;

                let valA = typeof selector === 'function' ? selector(a) : (a as any)[selector];
                let valB = typeof selector === 'function' ? selector(b) : (b as any)[selector];

                valA = valA ?? "";
                valB = valB ?? "";

                if (typeof valA === "string" && typeof valB === "string") {
                    const comp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
                    if (comp !== 0) return comp * dirMultiplier;
                } else if (typeof valA === "number" && typeof valB === "number") {
                    if (valA !== valB) return (valA - valB) * dirMultiplier;
                } else {
                    if (valA < valB) return -1 * dirMultiplier;
                    if (valA > valB) return 1 * dirMultiplier;
                }
            }
            return 0;
        });
    }, [filteredData, sortConfig]);

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: "var(--dt-header-bg)",
                borderBottom: "2px solid var(--dt-border-color)",
                fontWeight: "600",
                fontSize: "14px",
                color: "var(--dt-header-text)",
                minHeight: "52px",
            },
        },
        headCells: {
            style: {
                paddingLeft: "10px",
                paddingRight: "10px",
                justifyContent: "center",
                textAlign: "center" as const,
            },
        },
        rows: {
            style: {
                fontSize: "13px",
                color: "var(--dt-row-text)",
                backgroundColor: "var(--dt-bg)",
                minHeight: "44px",
                "&:hover": {
                    backgroundColor: "var(--dt-row-hover-bg)",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    color: "var(--dt-row-text)",
                },
            },
            stripedStyle: {
                backgroundColor: "var(--dt-row-stripe-bg)",
                color: "var(--dt-row-text)",
            },
        },
        cells: {
            style: {
                paddingLeft: "10px",
                paddingRight: "10px",
                justifyContent: "center",
                textAlign: "center" as const,
            },
        },
        pagination: {
            style: {
                borderTop: "1px solid var(--dt-border-color)",
                fontSize: "13px",
                minHeight: "56px",
                backgroundColor: "var(--dt-bg)",
                color: "var(--dt-row-text)",
            },
            pageButtonsStyle: {
                color: "var(--dt-row-text)",
                fill: "var(--dt-row-text)",
                "&:disabled": {
                    color: "var(--dt-disabled-text)",
                    fill: "var(--dt-disabled-text)",
                },
                "&:hover:not(:disabled)": {
                    backgroundColor: "var(--dt-row-hover-bg)",
                },
                "&:focus": {
                    outline: "none",
                    backgroundColor: "var(--dt-row-hover-bg)",
                },
            },
        },
    };

    const csvData = useMemo(() => {
        if (!datos || datos.length === 0 || !datos[0]) return [];

        const originalKeys = Object.keys(datos[0]);
        const validKeys: string[] = [];

        originalKeys.forEach(key => {
            if (['created_at', 'updated_at', 'deleted_at'].includes(key)) return;

            const firstValid = datos.find(row => row[key] !== null && row[key] !== undefined);
            if (firstValid) {
                const val = firstValid[key];
                if (typeof val === 'object' && !(val instanceof Date)) {
                    return;
                }
                validKeys.push(key);
            } else {
                validKeys.push(key);
            }
        });

        const blankRow = validKeys.map(() => "");
        const headerRow = validKeys;
        const processed = datos.map(row => {
            return validKeys.map(key => {
                const val = row[key];
                return val !== null && val !== undefined ? val : "";
            });
        });

        return [blankRow, headerRow, ...processed];
    }, [datos]);

    return (
        <section className="apextable-wrapper">
            <style>{dynamicStyles}</style>

            <div className="datatable-container" ref={tableRef}>
                <div className="search-bar-container" hidden={hiddenOptions}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                            <div className="search-input-wrapper">
                                <i className="fas fa-search search-icon"></i>
                                <DebouncedInput
                                    value={filterValue}
                                    onChange={handleFilterChange}
                                    placeholder="Buscar en todos los campos..."
                                    className="search-input"
                                />
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                <span className="stats-badge">
                                    {filteredData.length} de {datos.length} registros
                                </span>

                                <div className="action-buttons">
                                    <CSVLink
                                        data={csvData}
                                        filename={`export_${new Date().toISOString().split('T')[0]}.csv`}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <button className="btn-action btn-csv">
                                            <i className="fas fa-file-csv" />
                                            <span>CSV</span>
                                        </button>
                                    </CSVLink>

                                    <button
                                        onClick={downloadPDF}
                                        className="btn-action btn-pdf"
                                        disabled={isExporting}
                                    >
                                        <i className="fas fa-file-pdf" />
                                        <span>
                                            {isExporting ? "Exportando..." : "PDF"}
                                        </span>
                                    </button>

                                    <button
                                        className="btn-action btn-columns"
                                        onClick={() => setShowModal(true)}
                                    >
                                        <i className="fas fa-columns" />
                                        <span>Columnas</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sticky-info-label">
                    <i className="fas fa-info-circle"></i>
                    <span>
                        Use la chincheta (<i className="fas fa-thumbtack"></i>) para fijar hasta 3 columnas.
                    </span>
                </div>

                <DataTable
                    columns={processedColumns as any}
                    data={sortedData}
                    pagination
                    paginationPerPage={15}
                    paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                    striped
                    highlightOnHover
                    pointerOnHover
                    responsive
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 320px)"
                    onRowDoubleClicked={handleDoubleClick}
                    customStyles={customStyles}
                    expandableRows={expandableRows}
                    expandableRowsComponent={expandableRowsComponent as any}
                    expandableRowExpanded={expandableRowExpanded as any}
                    conditionalRowStyles={conditionalRowStyles}
                    {...otherProps}
                    noDataComponent={
                        <div style={{ padding: "40px", textAlign: "center" as const, color: "#6c757d" }}>
                            <i className="fas fa-inbox" style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: "14px" }}>No se encontraron registros</p>
                        </div>
                    }
                />
            </div>

            {/* Modal de Columnas */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h5 className="modal-title-custom">
                                <i className="fas fa-columns" />
                                Gestionar Columnas
                            </h5>
                            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                                <i className="fas fa-times" />
                            </button>
                        </div>

                        <div className="modal-body-custom">
                            <div className="column-actions">
                                <button className="btn-column-action" onClick={selectAllColumns}>
                                    <i className="fas fa-check-double" />
                                    Seleccionar Todo
                                </button>
                                <button className="btn-column-action" onClick={deselectAllColumns}>
                                    <i className="fas fa-times" />
                                    Deseleccionar Todo
                                </button>
                            </div>

                            {columnas.map((col) => (
                                <div key={col.name} className="column-checkbox-wrapper">
                                    <label className="column-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns.includes(col.name)}
                                            onChange={() => handleColumnVisibilityChange(col.name)}
                                        />
                                        <span style={{ marginLeft: '8px' }}>{col.name}</span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="modal-footer-custom">
                            <button className="btn-modal btn-modal-light" onClick={() => setShowModal(false)}>
                                Cerrar
                            </button>
                            <button className="btn-modal btn-modal-primary" onClick={() => setShowModal(false)}>
                                <i className="fas fa-check" />
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ApexTable;
