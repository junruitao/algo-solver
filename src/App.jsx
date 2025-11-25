import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Code2, 
  Settings, 
  Terminal, 
  Copy, 
  Check, 
  AlertCircle, 
  Server,
  Loader2,
  Play,
  Globe,
  Languages
} from 'lucide-react';

const App = () => {
  const [slug, setSlug] = useState('');
  const [platform, setPlatform] = useState('leetcode');
  const [language, setLanguage] = useState('python'); // State for selected language, now controlled by Config panel
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    apiUrl: 'https://algo-solver-485537320160.australia-southeast1.run.app/api/solve', 
    method: 'POST', // common for passing payloads
    useMock: false   // --- CHANGED: Default to false ---
  });
  const [showConfig, setShowConfig] = useState(false);

  // Helper function to get the correct file extension
  const getFileExtension = (lang) => {
    switch (lang) {
      case 'python':
        return 'py';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      case 'javascript':
        return 'js';
      default:
        return 'txt';
    }
  };


  // Mock response generator for demonstration
  const getMockResponse = (slug, platform, lang) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let mockCode = '';
        let mockComplexity = 'O(n)';

        // Generate specific syntax based on requested language
        if (lang === 'cpp') {
            mockCode = `// Solution for ${slug} on ${platform}
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Mock C++ Implementation
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.count(complement)) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`;
        } else if (lang === 'java') {
            mockCode = `// Solution for ${slug} on ${platform}
import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Mock Java Implementation
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        throw new IllegalArgumentException("No two sum solution");
    }
}`;
        } else if (lang === 'javascript') {
            mockCode = `/**
 * Solution for ${slug} on ${platform}
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Mock JavaScript Implementation
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
};`;
        } else {
            // Default Python
            mockCode = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Mock Python Implementation
        prevMap = {}  # val : index
        
        for i, n in enumerate(nums):
            diff = target - n
            if diff in prevMap:
                return [prevMap[diff], i]
            prevMap[n] = i
        return []`;
        }

        resolve({
          slug: slug,
          platform: platform,
          language: lang,
          code: mockCode,
          complexity: "O(n) time | O(n) space"
        });
      }, 1200);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slug.trim()) return;

    // Show a warning if not using mock data and URL is default placeholder
    if (!config.useMock && config.apiUrl.includes('your-cloud-run-url')) {
        setError("Please update the 'Cloud Run Endpoint URL' in the configuration panel (gear icon) before attempting a real API call.");
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data;

      if (config.useMock) {
        data = await getMockResponse(slug, platform, language);
      } else {
        // Real API Call logic
        const options = {
          method: config.method,
          headers: {
            'Content-Type': 'application/json',
          },
        };

        // Adjust body/url based on method preference
        let url = config.apiUrl;
        if (config.method === 'POST') {
          options.body = JSON.stringify({ 
            slug: slug, 
            platform: platform, 
            language: language 
          });
        } else {
          // Assume GET /endpoint?slug=...&platform=...&lang=...
          url = `${config.apiUrl}?slug=${encodeURIComponent(slug)}&platform=${encodeURIComponent(platform)}&language=${encodeURIComponent(language)}`;
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
          // Attempt to read error message from body if available
          let errorText = await response.text();
          try {
            const errorJson = JSON.parse(errorText);
            errorText = errorJson.message || errorText;
          } catch {
            // Ignore if not JSON
          }
          throw new Error(`API returned status ${response.status}. Possible CORS issue or check server logs. Response: ${errorText.substring(0, 100)}...`);
        }
        
        data = await response.json();
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to fetch solution. Check server logs and Cloud Run CORS configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Terminal className="w-6 h-6" />
            <h1 className="font-bold text-lg tracking-tight text-slate-100">AlgoSolver<span className="text-slate-500 font-normal">.io</span></h1>
          </div>
          
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded-full transition-colors ${showConfig ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-2">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">API Configuration</h3>
            <div className="grid gap-6 md:grid-cols-4">
              
              {/* API URL */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-slate-500">Cloud Run Endpoint URL</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-md px-3 py-2 focus-within:border-emerald-500/50 transition-colors">
                  <Server className="w-4 h-4 text-slate-600" />
                  <input 
                    type="text" 
                    value={config.apiUrl}
                    onChange={(e) => setConfig({...config, apiUrl: e.target.value})}
                    className="bg-transparent border-none outline-none text-sm flex-1 text-slate-300 placeholder:text-slate-700"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* HTTP Method */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500">HTTP Method</label>
                <select 
                  value={config.method}
                  onChange={(e) => setConfig({...config, method: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
                >
                  <option value="GET">GET (Query Param)</option>
                  <option value="POST">POST (JSON Body)</option>
                </select>
              </div>

              {/* SOLUTION LANGUAGE (NEW) */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Solution Language</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
                >
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
            </div>
            
            {/* Demo Mode Toggle */}
            <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-md px-4 py-3 mt-6">
                <span className="text-sm text-slate-400">Enable Demo Mode (Uses local mock data instead of API call)</span>
                <button 
                  onClick={() => setConfig({...config, useMock: !config.useMock})}
                  className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${config.useMock ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.useMock ? 'left-6' : 'left-1'}`} />
                </button>
            </div>
            
            <p className="text-xs text-slate-500 mt-4">
              * Payload sent: <code className="text-emerald-400">{"{ slug, platform, language }"}</code>
            </p>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center min-h-[80vh]">
        
        {/* Hero / Search */}
        <div className="text-center mb-10 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Get solutions instantly.
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Choose your platform and problem ID. Solution language is set in the 
            <span className="text-emerald-400 font-semibold cursor-pointer" onClick={() => setShowConfig(true)}> configuration panel</span>.
          </p>
          {!config.useMock && config.apiUrl.includes('your-cloud-run-url') && (
            <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 p-2 rounded-lg mt-4">
                ⚠️ API URL is currently set to a placeholder. Open settings (gear icon) to update it for live calls.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group z-10">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative flex flex-col md:flex-row items-center bg-slate-900 rounded-lg border border-slate-700 shadow-2xl p-1">
            
            {/* Selector and Input Container */}
            <div className="flex w-full md:w-auto border-b md:border-b-0 md:border-r border-slate-700">
                
                {/* Platform Selector */}
                <div className="relative flex-1 md:flex-none">
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full md:w-32 bg-transparent text-slate-300 text-sm font-medium py-3 px-2 outline-none appearance-none cursor-pointer hover:text-emerald-400 transition-colors text-center"
                      style={{ textAlignLast: 'center' }}
                    >
                      <option value="leetcode">LeetCode</option>
                      <option value="codeforces">Codeforces</option>
                      <option value="hackerrank">HackerRank</option>
                      <option value="atcoder">AtCoder</option>
                    </select>
                </div>
            </div>

            {/* Input Field */}
            <input 
              type="text" 
              placeholder={platform === 'codeforces' ? "1234/A" : "two-sum"}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-transparent border-none py-3 px-4 text-lg outline-none text-slate-200 placeholder:text-slate-600"
            />
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || !slug}
              className="w-full md:w-auto mt-2 md:mt-0 mr-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white px-6 py-2.5 rounded-md font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Solve</span>}
            </button>
          </div>
        </form>

        {/* Results Area */}
        <div className="w-full mt-12 space-y-6">
          
          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3 text-red-400 animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-300">Request Failed</h4>
                <p className="text-sm mt-1 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* --- ADDED: Central Loading Indicator --- */}
          {loading && (
            <div className="w-full h-48 flex flex-col items-center justify-center bg-slate-900/50 border border-slate-800 rounded-xl mt-6 animate-in fade-in duration-300">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                <p className="text-slate-400">Fetching solution for {slug}...</p>
                {config.useMock && <p className="text-xs text-slate-500 mt-1">Simulating API delay...</p>}
            </div>
          )}
          {/* ------------------------------------- */}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Meta Info Bar */}
              <div className="flex flex-wrap items-center justify-between mb-3 px-1 gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-2 py-1 bg-slate-800 rounded border border-slate-700">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-mono text-slate-300 capitalize">{result.platform}</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-slate-800 rounded border border-slate-700">
                    <Languages className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-mono text-slate-300 capitalize">{result.language}</span>
                  </div>
                  {result.complexity && (
                    <span className="text-xs text-emerald-400 font-medium hidden sm:inline-block">
                      {result.complexity}
                    </span>
                  )}
                </div>
                <CopyButton text={result.code} />
              </div>

              {/* Code Window */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border-b border-slate-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  </div>
                  <div className="ml-4 text-xs text-slate-500 font-mono flex items-center gap-2">
                    <Code2 className="w-3 h-3" />
                    solution.{getFileExtension(language)}
                  </div>
                </div>
                
                <div className="p-4 overflow-x-auto">
                  <pre className="font-mono text-sm leading-relaxed text-slate-300">
                    <code>{result.code}</code>
                  </pre>
                </div>
              </div>
              
              {config.useMock && (
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full border border-amber-500/20">
                    Preview Mode: Using simulated data for {language}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Utility Component for Copy to Clipboard
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Fallback for secure contexts where clipboard API might not be available
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-200 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-500">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Code</span>
        </>
      )}
    </button>
  );
};

export default App;