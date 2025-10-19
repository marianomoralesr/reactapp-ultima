import React, { useState, useEffect } from 'react';
import { Play, Trash2, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface EndpointConfig {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST';
  headers: { key: string; value: string }[];
  body?: string;
  enabled: boolean;
}

interface TestResult {
  success: boolean;
  status?: number;
  statusText?: string;
  data?: any;
  error?: string;
  responseTime?: number;
  timestamp: string;
}

const AdminEndpointConfigPage: React.FC = () => {
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: TestResult }>({});
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<string>('');

  // Load saved endpoints from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('trefa_endpoint_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEndpoints(parsed);
      } catch (err) {
        console.error('Failed to load saved endpoints:', err);
      }
    }

    // Load active endpoint
    const active = localStorage.getItem('trefa_active_endpoint');
    if (active) {
      setActiveEndpoint(active);
    }
  }, []);

  // Save endpoints to localStorage
  const saveEndpoints = (newEndpoints: EndpointConfig[]) => {
    setEndpoints(newEndpoints);
    localStorage.setItem('trefa_endpoint_configs', JSON.stringify(newEndpoints));
  };

  // Create new endpoint
  const createNewEndpoint = () => {
    const newEndpoint: EndpointConfig = {
      id: Date.now().toString(),
      name: 'New Endpoint',
      url: '',
      method: 'GET',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      body: '',
      enabled: true,
    };
    const updated = [...endpoints, newEndpoint];
    saveEndpoints(updated);
    setSelectedEndpoint(newEndpoint);
  };

  // Update endpoint
  const updateEndpoint = (updated: EndpointConfig) => {
    const newEndpoints = endpoints.map(e => e.id === updated.id ? updated : e);
    saveEndpoints(newEndpoints);
    setSelectedEndpoint(updated);
  };

  // Delete endpoint
  const deleteEndpoint = (id: string) => {
    const newEndpoints = endpoints.filter(e => e.id !== id);
    saveEndpoints(newEndpoints);
    if (selectedEndpoint?.id === id) {
      setSelectedEndpoint(null);
    }
  };

  // Test endpoint
  const testEndpoint = async (endpoint: EndpointConfig) => {
    setIsTesting(endpoint.id);
    const startTime = Date.now();

    try {
      const headers: Record<string, string> = {};
      endpoint.headers.forEach(h => {
        if (h.key && h.value) {
          headers[h.key] = h.value;
        }
      });

      const options: RequestInit = {
        method: endpoint.method,
        headers,
      };

      if (endpoint.method === 'POST' && endpoint.body) {
        options.body = endpoint.body;
      }

      const response = await fetch(endpoint.url, options);
      const responseTime = Date.now() - startTime;

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      const result: TestResult = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data,
        responseTime,
        timestamp: new Date().toISOString(),
      };

      setTestResults(prev => ({ ...prev, [endpoint.id]: result }));
    } catch (error) {
      const result: TestResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      };

      setTestResults(prev => ({ ...prev, [endpoint.id]: result }));
    } finally {
      setIsTesting(null);
    }
  };

  // Set as active endpoint
  const setAsActive = (endpointId: string) => {
    setActiveEndpoint(endpointId);
    localStorage.setItem('trefa_active_endpoint', endpointId);
  };

  // Add header
  const addHeader = () => {
    if (!selectedEndpoint) return;
    const updated = {
      ...selectedEndpoint,
      headers: [...selectedEndpoint.headers, { key: '', value: '' }],
    };
    updateEndpoint(updated);
  };

  // Remove header
  const removeHeader = (index: number) => {
    if (!selectedEndpoint) return;
    const updated = {
      ...selectedEndpoint,
      headers: selectedEndpoint.headers.filter((_, i) => i !== index),
    };
    updateEndpoint(updated);
  };

  // Update header
  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    if (!selectedEndpoint) return;
    const updated = {
      ...selectedEndpoint,
      headers: selectedEndpoint.headers.map((h, i) =>
        i === index ? { ...h, [field]: value } : h
      ),
    };
    updateEndpoint(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Endpoint Configuration</h1>
          <p className="mt-2 text-gray-600">Configure and test API endpoints for vehicle data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Endpoint List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Endpoints</h2>
                <button
                  onClick={createNewEndpoint}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  + New
                </button>
              </div>

              <div className="space-y-2">
                {endpoints.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No endpoints configured</p>
                ) : (
                  endpoints.map(endpoint => (
                    <div
                      key={endpoint.id}
                      onClick={() => setSelectedEndpoint(endpoint)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedEndpoint?.id === endpoint.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900 truncate">
                              {endpoint.name}
                            </span>
                            {activeEndpoint === endpoint.id && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-1">{endpoint.url}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {endpoint.method}
                            </span>
                            {testResults[endpoint.id] && (
                              testResults[endpoint.id].success ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Endpoint Editor & Test */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedEndpoint ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select an endpoint or create a new one to get started</p>
              </div>
            ) : (
              <>
                {/* Endpoint Configuration */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAsActive(selectedEndpoint.id)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          activeEndpoint === selectedEndpoint.id
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {activeEndpoint === selectedEndpoint.id ? 'Active' : 'Set as Active'}
                      </button>
                      <button
                        onClick={() => deleteEndpoint(selectedEndpoint.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={selectedEndpoint.name}
                        onChange={(e) => updateEndpoint({ ...selectedEndpoint, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="My API Endpoint"
                      />
                    </div>

                    {/* URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL
                      </label>
                      <input
                        type="text"
                        value={selectedEndpoint.url}
                        onChange={(e) => updateEndpoint({ ...selectedEndpoint, url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="https://api.example.com/vehicles"
                      />
                    </div>

                    {/* Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Method
                      </label>
                      <select
                        value={selectedEndpoint.method}
                        onChange={(e) => updateEndpoint({ ...selectedEndpoint, method: e.target.value as 'GET' | 'POST' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                    </div>

                    {/* Headers */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Headers
                        </label>
                        <button
                          onClick={addHeader}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Add Header
                        </button>
                      </div>
                      <div className="space-y-2">
                        {selectedEndpoint.headers.map((header, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={header.key}
                              onChange={(e) => updateHeader(index, 'key', e.target.value)}
                              placeholder="Header name"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              value={header.value}
                              onChange={(e) => updateHeader(index, 'value', e.target.value)}
                              placeholder="Header value"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => removeHeader(index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Body (for POST) */}
                    {selectedEndpoint.method === 'POST' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Request Body (JSON)
                        </label>
                        <textarea
                          value={selectedEndpoint.body || ''}
                          onChange={(e) => updateEndpoint({ ...selectedEndpoint, body: e.target.value })}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder='{"key": "value"}'
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Test Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Test Endpoint</h2>
                    <button
                      onClick={() => testEndpoint(selectedEndpoint)}
                      disabled={isTesting === selectedEndpoint.id || !selectedEndpoint.url}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {isTesting === selectedEndpoint.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Test
                        </>
                      )}
                    </button>
                  </div>

                  {testResults[selectedEndpoint.id] && (
                    <div className="space-y-4">
                      {/* Status */}
                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        {testResults[selectedEndpoint.id].success ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {testResults[selectedEndpoint.id].status && (
                              <span className={`font-semibold ${
                                testResults[selectedEndpoint.id].success ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {testResults[selectedEndpoint.id].status} {testResults[selectedEndpoint.id].statusText}
                              </span>
                            )}
                            {testResults[selectedEndpoint.id].responseTime && (
                              <span className="text-sm text-gray-600">
                                {testResults[selectedEndpoint.id].responseTime}ms
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(testResults[selectedEndpoint.id].timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Error */}
                      {testResults[selectedEndpoint.id].error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-medium text-red-800 mb-1">Error</p>
                          <p className="text-sm text-red-700">{testResults[selectedEndpoint.id].error}</p>
                        </div>
                      )}

                      {/* Response Data */}
                      {testResults[selectedEndpoint.id].data && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Response</p>
                          <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-xs">
                            {typeof testResults[selectedEndpoint.id].data === 'string'
                              ? testResults[selectedEndpoint.id].data
                              : JSON.stringify(testResults[selectedEndpoint.id].data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEndpointConfigPage;
