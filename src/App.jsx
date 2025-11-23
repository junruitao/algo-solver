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
  Globe
} from 'lucide-react';

const App = () => {
  const [slug, setSlug] = useState('');
  const [platform, setPlatform] = useState('leetcode');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    apiUrl: 'https://your-cloud-run-url.run.app/solve', // Placeholder
    method: 'POST', // common for passing payloads
    useMock: true   // Default to mock so user sees UI works immediately
  });
  const [showConfig, setShowConfig] = useState(false);

  // Mock response generator for demonstration
  const getMockResponse = (slug, platform) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let mockCode = '';
        let mockLang = 'python';
        let mockComplexity = 'O(n)';

        if (platform === 'codeforces') {
          mockLang = 'cpp';
          mockCode = `#include <bits/stdc++.h>
using namespace std;

// Mock solution for Codeforces problem: ${slug}
void solve() {
    int n;
    cin >> n;
    vector<int> a(n);
    for(int i=0; i<n; i++) cin >> a[i];
    
    sort(a.begin(), a.end());
    cout << a[n-1] - a[0] << endl;
}

int main() {
    ios::sync_with_stdio(0);
    cin.tie(0);
    int t;
    cin >> t;
    while(t--) {
        solve();
    }
    return 0;
}`;
          mockComplexity = "O(N log N) time";
        } else if (platform === 'hackerrank') {
          mockLang = 'java';
          mockCode = `import java.io.*;
import java.util.*;

// Mock solution for HackerRank: ${slug}
public class Solution {

    public static void main(String[] args) {
        Scanner scan = new Scanner(System.in);
        int n = scan.nextInt();
        
        // Standard HackerRank boilerplate
        int sum = 0;
        for(int i=0; i<n; i++) {
             sum += scan.nextInt();
        }
        System.out.println(sum);
    }
}`;
          mockComplexity = "O(N) time";
        } else {
          // Default LeetCode
          mockCode = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Mock solution for LeetCode: ${slug}
        prevMap = {}  # val : index
        
        for i, n in enumerate(nums):
            diff = target - n
            if diff in prevMap:
                return [prevMap[diff], i]
            prevMap[n] = i
        return []`;
          mockComplexity = "O(n) time | O(n) space";
        }

        resolve({
          slug: slug,
          platform: platform,
          language: mockLang,
          code: mockCode,
          complexity: mockComplexity
        });
      }, 1500);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slug.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data;

      if (config.useMock) {
        data = await getMockResponse(slug, platform);
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
          options.body = JSON.stringify({ slug: slug, platform: platform });
        } else {
          // Assume GET /endpoint?slug=value&platform=value
          url = `${config.apiUrl}?slug=${encodeURIComponent(slug)}&platform=${encodeURIComponent(platform)}`;
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }
        
        data = await response.json();
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to fetch solution. Check CORS settings on your Cloud Run instance.");
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
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

              <div className="grid grid-cols-2 gap-4">
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
                
                <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-md px-4 mt-6">
                  <span className="text-sm text-slate-400">Demo Mode</span>
                  <button 
                    onClick={() => setConfig({...config, useMock: !config.useMock})}
                    className={`w-10 h-5 rounded-full relative transition-colors ${config.useMock ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.useMock ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              * Ensure your Cloud Run service allows CORS requests from this origin if running in browser.
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
            Enter the problem ID or slug from your favorite platform to fetch the optimal solution.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-xl relative group z-10">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative flex items-center bg-slate-900 rounded-lg border border-slate-700 shadow-2xl p-1">
            
            {/* Platform Selector Dropdown */}
            <div className="relative border-r border-slate-700 pr-2">
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="bg-transparent text-slate-300 text-sm font-medium py-3 pl-3 pr-1 outline-none appearance-none cursor-pointer hover:text-emerald-400 transition-colors text-center w-28"
                  style={{ textAlignLast: 'center' }}
                >
                  <option value="leetcode">LeetCode</option>
                  <option value="codeforces">Codeforces</option>
                  <option value="hackerrank">HackerRank</option>
                  <option value="atcoder">AtCoder</option>
                </select>
            </div>

            <input 
              type="text" 
              placeholder={platform === 'codeforces' ? "1234/A" : "two-sum"}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-transparent border-none py-3 px-4 text-lg outline-none text-slate-200 placeholder:text-slate-600"
            />
            
            <button 
              type="submit" 
              disabled={loading || !slug}
              className="mr-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white px-5 py-2.5 rounded-md font-medium transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>Solve</span>
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

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Meta Info Bar */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-2 py-1 bg-slate-800 rounded border border-slate-700">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-mono text-slate-300 capitalize">{result.platform}</span>
                  </div>
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs font-mono text-slate-400 border border-slate-700">
                    {result.language || 'python'}
                  </span>
                  {result.complexity && (
                    <span className="text-xs text-emerald-400 font-medium">
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
                    solution.{result.language === 'cpp' ? 'cpp' : result.language === 'java' ? 'java' : 'py'}
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
                    Preview Mode: Using simulated data for {platform}
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
    navigator.clipboard.writeText(text);
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