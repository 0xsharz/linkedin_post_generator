import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const loadingTexts = [
  'Reading blog...',
  'Extracting insights...',
  'Drafting hook...',
  'Polishing hashtags...'
];

const PostGenerator = () => {
  const [blogUrl, setBlogUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [editedPost, setEditedPost] = useState('');
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    
    if (!blogUrl.trim()) {
      toast.error('Please enter a blog URL');
      return;
    }

    if (!validateUrl(blogUrl)) {
      toast.error('Invalid URL format. Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsLoading(true);
    setLoadingTextIndex(0);

    const textInterval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1500);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/generate`, {
        blog_url: blogUrl
      });

      setGeneratedPost(response.data);
      setEditedPost(response.data.full_post);
      toast.success('LinkedIn post generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      
      let errorMessage = 'Failed to generate post. Please try again.';
      
      if (error.response?.status === 422) {
        const validationError = error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail;
        errorMessage = validationError || 'Invalid blog URL format. Please check and try again.';
      } else if (error.response?.status === 502) {
        errorMessage = error.response?.data?.detail || 'The n8n webhook service is not available. Please activate the webhook in n8n.';
      } else if (error.response?.status === 408) {
        errorMessage = 'Request timed out. The blog might be too large. Please try a different URL.';
      } else if (error.response?.status === 503) {
        errorMessage = 'Unable to connect to the service. Please check your connection and try again.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      clearInterval(textInterval);
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedPost);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleReset = () => {
    setBlogUrl('');
    setGeneratedPost(null);
    setEditedPost('');
  };

  return (
    <div className="min-h-screen bg-[#02040A] relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px]"></div>
      
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-30 pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <AnimatePresence mode="wait">
          {!generatedPost ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
              {/* Header */}
              <div className="text-center space-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full backdrop-blur-sm"
                >
                  <Zap className="w-4 h-4 text-indigo-400" fill="currentColor" />
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">AI-Powered</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  <span className="text-white">Free LinkedIn Post</span>
                  <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">Generator</span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  Transform any blog URL into a professional LinkedIn post in seconds.
                </motion.p>
              </div>

              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative max-w-4xl mx-auto"
              >
                <div 
                  className={`relative bg-[#0B0C15] border-2 rounded-2xl transition-all duration-300 ${
                    isFocused ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'border-slate-800'
                  }`}
                >
                  {/* Tracing Beam Effect */}
                  {isFocused && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
                        backgroundSize: '200% 100%',
                      }}
                      animate={{
                        backgroundPosition: ['0% 0%', '200% 0%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  )}
                  
                  <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3">
                    <input
                      data-testid="blog-url-input"
                      type="url"
                      value={blogUrl}
                      onChange={(e) => setBlogUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Paste your blog URL here..."
                      disabled={isLoading}
                      className="flex-1 bg-transparent border-none px-6 py-4 text-xl md:text-2xl text-white placeholder:text-slate-600 focus:outline-none disabled:opacity-50"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    />
                    <button
                      data-testid="generate-button"
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl font-semibold text-white transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/50 overflow-hidden group"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      <div className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Sparkles className="w-5 h-5" />
                            </motion.div>
                            <span className="hidden md:inline">{loadingTexts[loadingTextIndex]}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            <span>Generate</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Loading Progress Bar */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    className="mt-4 h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-pink-500 rounded-full origin-left"
                  />
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl md:text-5xl font-bold text-white"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  Your LinkedIn Post
                </motion.h2>
                <motion.button
                  data-testid="reset-button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleReset}
                  className="px-5 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-slate-300 font-medium transition-all backdrop-blur-sm hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden md:inline">New Post</span>
                </motion.button>
              </div>

              {/* Result Card with Glassmorphism */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10"
              >
                <div className="bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Editable</span>
                  </div>
                  <button
                    data-testid="copy-button"
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
                <textarea
                  data-testid="generated-post-textarea"
                  value={editedPost}
                  onChange={(e) => setEditedPost(e.target.value)}
                  rows={15}
                  className="w-full p-6 bg-transparent text-slate-200 whitespace-pre-wrap focus:outline-none focus:bg-white/5 transition-colors resize-none border-none"
                  style={{ fontFamily: "'Manrope', sans-serif", fontSize: '16px', lineHeight: '1.7' }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PostGenerator;