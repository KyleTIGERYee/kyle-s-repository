import React, { useRef, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDown, TrendingUp } from 'lucide-react';

// 表格列定义
interface Column {
  key: string;
  title: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

// 表格数据行
interface TableRow {
  id: string;
  [key: string]: unknown;
}

interface VirtualTableProps {
  // 列定义
  columns: Column[];
  // 数据行
  data: TableRow[];
  // 行高（像素）
  rowHeight?: number;
  // 表头高度
  headerHeight?: number;
  // 表格高度
  tableHeight?: number;
  // 加载状态
  loading?: boolean;
  // 行点击回调
  onRowClick?: (row: TableRow) => void;
  // 自定义行样式
  rowClassName?: (row: TableRow) => string;
  // 粘性列数量（左侧）
  stickyColumns?: number;
  // 空数据提示
  emptyText?: string;
}

/**
 * 虚拟化表格组件
 * 用于大数据量场景，只渲染可视区域内的行
 */
export const VirtualTable: React.FC<VirtualTableProps> = ({
  columns,
  data,
  rowHeight = 56,
  headerHeight = 56,
  tableHeight = 400,
  loading = false,
  onRowClick,
  rowClassName,
  stickyColumns = 1,
  emptyText = '暂无数据',
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // 虚拟化器配置
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5, // 预渲染行数，避免滚动白屏
  });

  const virtualItems = virtualizer.getVirtualItems();

  // 计算总高度
  const totalHeight = virtualizer.getTotalSize();

  // 渲染单元格
  const renderCell = useCallback((column: Column, row: TableRow) => {
    const value = row[column.key];
    if (column.render) {
      return column.render(value, row);
    }
    return value as React.ReactNode;
  }, []);

  // 渲染表头
  const renderHeader = useMemo(() => (
    <div
      className="flex border-b border-white/10 bg-slate-900"
      style={{ height: headerHeight }}
    >
      {columns.map((column, index) => (
        <div
          key={column.key}
          className={`flex-shrink-0 px-4 py-3 text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center ${
            column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'
          } ${index < stickyColumns ? 'sticky left-0 z-20 bg-slate-900 border-r border-white/10' : ''}`}
          style={{ width: column.width || 150 }}
        >
          {column.title}
        </div>
      ))}
    </div>
  ), [columns, headerHeight, stickyColumns]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center text-slate-500 text-sm font-mono bg-slate-900/30 rounded-lg"
        style={{ height: tableHeight }}
      >
        加密数据流加载中...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-slate-500 text-sm bg-slate-900/30 rounded-lg"
        style={{ height: tableHeight }}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="overflow-auto border border-white/5 rounded-lg bg-slate-900/30"
      style={{ height: tableHeight }}
    >
      {renderHeader}
      <div style={{ height: totalHeight - headerHeight, position: 'relative' }}>
        {virtualItems.map((virtualRow) => {
          const row = data[virtualRow.index];
          const isStickyRow = rowClassName ? rowClassName(row) : '';

          return (
            <div
              key={row.id}
              className={`absolute left-0 right-0 flex border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${isStickyRow}`}
              style={{
                height: rowHeight,
                transform: `translateY(${virtualRow.start - headerHeight}px)`,
              }}
              onClick={() => onRowClick?.(row)}
              data-index={virtualRow.index}
            >
              {columns.map((column, colIndex) => (
                <div
                  key={`${row.id}-${column.key}`}
                  className={`flex-shrink-0 px-4 py-3 text-base flex items-center ${
                    column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'
                  } ${colIndex < stickyColumns ? 'sticky left-0 z-10 bg-slate-950 border-r border-white/10' : ''}`}
                  style={{ width: column.width || 150 }}
                >
                  {renderCell(column, row)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 可展开行的表格组件
interface ExpandableVirtualTableProps extends VirtualTableProps {
  // 展开状态
  expandedKeys: Set<string>;
  // 切换展开
  onToggleExpand: (key: string) => void;
  // 判断是否为父行
  isParentRow: (row: TableRow) => boolean;
  // 判断子行是否可见
  isRowVisible: (row: TableRow) => boolean;
  // 获取行的缩进级别
  getRowLevel?: (row: TableRow) => number;
}

/**
 * 可展开行的虚拟化表格
 * 支持树形结构展示
 */
export const ExpandableVirtualTable: React.FC<ExpandableVirtualTableProps> = ({
  expandedKeys,
  onToggleExpand,
  isParentRow,
  isRowVisible,
  getRowLevel = () => 0,
  columns,
  data,
  ...restProps
}) => {
  // 过滤出可见的行
  const visibleData = useMemo(() => {
    return data.filter((row) => isRowVisible(row));
  }, [data, isRowVisible]);

  // 扩展第一列以支持展开按钮
  const expandedColumns = useMemo(() => {
    const firstColumn = columns[0];
    return [
      {
        ...firstColumn,
        render: (value: unknown, row: Record<string, unknown>) => {
          const isParent = isParentRow(row as TableRow);
          const isExpanded = expandedKeys.has((row as TableRow).id);
          const level = getRowLevel(row as TableRow);

          return (
            <div className="flex items-center space-x-2" style={{ paddingLeft: `${level * 16}px` }}>
              {isParent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand((row as TableRow).id);
                  }}
                  className="p-0.5 hover:bg-white/10 rounded transition-colors"
                >
                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
              {!isParent && <span className="w-5" />}
              <span>{value as React.ReactNode}</span>
              {!isParent && <TrendingUp size={14} className="text-cyan-500 opacity-50" />}
            </div>
          );
        },
      },
      ...columns.slice(1),
    ];
  }, [columns, expandedKeys, isParentRow, getRowLevel, onToggleExpand]);

  return (
    <VirtualTable
      {...restProps}
      columns={expandedColumns}
      data={visibleData}
    />
  );
};

export default VirtualTable;
