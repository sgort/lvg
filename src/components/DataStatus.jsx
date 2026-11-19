// Loading or error message for one data source, styled like the existing
// calculation messages.
const DataStatus = ({ state }) => {
  if (state.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p className="text-red-800 font-semibold">Gegevens konden niet worden geladen</p>
        <p className="text-red-600 text-sm">{state.error}</p>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Gegevens laden...</span>
    </div>
  );
};

export default DataStatus;
