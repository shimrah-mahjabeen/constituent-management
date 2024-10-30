export const BatchUploadResults: React.FC<any> = ({ result }) => (
  <div className="mt-4 bg-white shadow rounded-lg p-4">
    <h2 className="text-lg font-semibold mb-4">Batch Upload Results</h2>
    <p>Successful: {result.successful}</p>
    <p>Failed: {result.failed}</p>
    {result.errors.length > 0 && (
      <div className="mt-4">
        <h3 className="font-medium mb-2">Errors:</h3>
        <ul className="list-disc pl-5">
          {result.errors.map((error: any, index: any) => (
            <li key={index} className="text-red-600">
              Row {error.row}: {error.error}
              <pre className="mt-1 text-sm bg-gray-50 p-2 rounded">
                {JSON.stringify(error.data, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
