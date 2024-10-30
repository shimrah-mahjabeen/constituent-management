import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ConstituentListProps } from '../types/constituent';

const ConstituentList: React.FC<ConstituentListProps> = ({
  constituents,
  onPageChange,
}) => {
  if (!constituents.data) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {constituents.data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No constituents found.
                </td>
              </tr>
            ) : (
              constituents.data.map((constituent) => (
                <tr key={constituent.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {constituent.firstName} {constituent.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {constituent.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {constituent.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(constituent.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {constituents.total > constituents.pageSize && (
        <div className="flex items-center justify-between mt-4 px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing {constituents.data.length} of {constituents.total} entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => onPageChange?.(constituents.page - 1)}
              disabled={constituents.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700">
              Page {constituents.page} of {constituents.totalPages}
            </span>
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => onPageChange?.(constituents.page + 1)}
              disabled={constituents.page === constituents.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstituentList;
