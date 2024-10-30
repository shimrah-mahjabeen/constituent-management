import React, { useState } from 'react';
import { api } from '../services/api';
import { BatchUploadResult } from '../types/constituent';

interface CsvUploaderProps {
  onUploadSuccess: (result: BatchUploadResult) => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  onUploadSuccess,
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleBatchUpload = async () => {
    if (csvFile) {
      try {
        const formData = new FormData();
        formData.append('file', csvFile);
        const response = await api.post<BatchUploadResult>(
          '/constituents/batch-upload',
          formData,
        );
        onUploadSuccess(response.data);
      } catch (error) {
        console.error('Error processing CSV:', error);
      }
    }
  };

  return (
    <div className="mt-6 bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Upload CSV</h2>
      <div className="flex items-center gap-4">
        <input
          type="file"
          onChange={(e) => e.target.files && setCsvFile(e.target.files[0])}
          className="border p-2 rounded"
          accept=".csv"
        />
        <button
          onClick={handleBatchUpload}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={!csvFile}
        >
          Process CSV
        </button>
      </div>
    </div>
  );
};
