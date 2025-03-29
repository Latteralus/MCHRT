import React from 'react';

interface TableColumn<T> {
  key: keyof T | string; // Allow string for custom render keys
  header: string;
  render?: (item: T) => React.ReactNode; // Optional custom render function
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  onRowClick?: (item: T) => void; // Optional click handler for rows
  renderActions?: (item: T) => React.ReactNode; // Optional actions column
}

const Table = <T extends { id: number | string }>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRowClick,
  renderActions,
}: TableProps<T>) => {
  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center p-4 text-gray-500">No data available.</div>;
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
            {renderActions && (
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr
              key={item.id}
              className={`${onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td
                  key={`${item.id}-${String(col.key)}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                >
                  {col.render
                    ? col.render(item)
                    : item[col.key as keyof T] !== undefined && item[col.key as keyof T] !== null
                    ? String(item[col.key as keyof T])
                    : ''}
                </td>
              ))}
              {renderActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {renderActions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;