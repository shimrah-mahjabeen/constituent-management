import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ConstituentList from './ConstituentList';
import AddConstituentForm from './AddConstituentForm';
import { getConstituents, downloadConstituentsCsv } from '../services/api';
import {
  BatchUploadResult,
  Constituent,
  PaginatedResult,
} from '../types/constituent';
import { CsvUploader } from './CsvUploader';
import { NavigationHeader } from './NavigationHandler';
import { BatchUploadResults } from './BatchUploadResult';

export const ConstituentPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [paginatedData, setPaginatedData] = useState<
    PaginatedResult<Constituent>
  >({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [batchUploadResult, setBatchUploadResult] =
    useState<BatchUploadResult | null>(null);

  useEffect(() => {
    const fetchConstituents = async () => {
      try {
        setIsLoading(true);
        const result = await getConstituents(currentPage, pageSize);
        setPaginatedData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while fetching constituents',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchConstituents();
  }, [currentPage, pageSize]);

  const handleDownloadCsv = async () => {
    try {
      const startDate = user?.createdAt
        ? new Date(user.createdAt).toISOString()
        : new Date().toISOString();
      const endDate = new Date().toISOString();
      await downloadConstituentsCsv(startDate, endDate);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationHeader title="Constituent Management" />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-white shadow rounded-lg mb-6 p-4">
            <h2 className="text-lg font-semibold mb-4">Add New Constituent</h2>
            <AddConstituentForm
              setConstituents={setPaginatedData}
              currentPage={currentPage}
              pageSize={pageSize}
            />
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 border rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Download CSV
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Constituent List</h2>
            {isLoading ? (
              <div className="text-center py-4">Loading constituents...</div>
            ) : (
              <ConstituentList
                constituents={paginatedData}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          <CsvUploader
            onUploadSuccess={(result) => {
              setBatchUploadResult(result);
              getConstituents(currentPage, pageSize).then(setPaginatedData);
            }}
          />

          {batchUploadResult && (
            <BatchUploadResults result={batchUploadResult} />
          )}
        </div>
      </main>
    </div>
  );
};
