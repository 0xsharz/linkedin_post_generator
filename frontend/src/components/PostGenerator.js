import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Copy, RefreshCw, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const loadingTexts = [
  'Parsing HTML...',
  'Extracting Insights...',
  'Drafting LinkedIn Post...',
  'Polishing Magic...'
];

const PostGenerator = () => {
  const [blogUrl, setBlogUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [editedPost, setEditedPost] = useState('');
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const { theme, setTheme } = useTheme();

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleGenerate = async () => {
    if (!blogUrl.trim()) {
      toast.error('Please enter a blog URL');
      return;
    }

    if (!validateUrl(blogUrl)) {
      toast.error('Please enter a valid URL starting with http:// or https://');
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
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1758637612226-97ceebff95a4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMG1pbmltYWwlMjBzaGFwZXMlMjBncmFkaWVudHxlbnwwfHx8fDE3NjY1MTQzOTF8MA&ixlib=rb-4.1.0&q=85')] bg-cover bg-center opacity-5 dark:opacity-[0.02]"></div>
      
      {/* Noise overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="relative z-10">
        {/* Header with theme toggle */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-6 md:p-12 flex justify-end"
        >
          <button
            data-testid="theme-toggle-button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-full bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </motion.header>

        <div className="container mx-auto px-6 md:px-12 lg:px-24 pb-24">
          <AnimatePresence mode="wait">
            {!generatedPost ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-4xl mx-auto space-y-12"
              >
                {/* Hero Title */}
                <div className="text-center space-y-6">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
                    style={{ fontFamily: "'Clash Display', sans-serif" }}
                  >
                    Blog to LinkedIn
                    <br />
                    <span className="text-blue-600 dark:text-blue-400">Magic</span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                    style={{ fontFamily: "'Satoshi', sans-serif" }}
                  >
                    Transform any blog URL into a professional LinkedIn post in seconds.
                  </motion.p>
                </div>

                {/* Input Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="relative group">
                    <input
                      data-testid="blog-url-input"
                      type="url"
                      value={blogUrl}
                      onChange={(e) => setBlogUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      placeholder="Paste your blog URL here..."
                      disabled={isLoading}
                      className="w-full h-20 px-8 text-lg rounded-2xl bg-white/70 dark:bg-black/40 border-2 border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-50 disabled:opacity-50"
                      style={{ fontFamily: "'Satoshi', sans-serif" }}
                    />
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                  </div>

                  <button
                    data-testid="generate-button"
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    style={{ fontFamily: "'Satoshi', sans-serif" }}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <RefreshCw className="w-5 h-5" />
                        </motion.div>
                        <span>{loadingTexts[loadingTextIndex]}</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        <span>Generate Post</span>
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Loading Progress */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full origin-left"
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-5xl mx-auto space-y-8"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50"
                    style={{ fontFamily: "'Clash Display', sans-serif" }}
                  >
                    Your LinkedIn Post
                  </motion.h2>
                  <motion.button
                    data-testid="reset-button"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors active:scale-95"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Result Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-8 rounded-3xl bg-white/70 dark:bg-black/40 border border-white/40 dark:border-white/10 backdrop-blur-xl shadow-2xl space-y-6"
                >
                  <textarea
                    data-testid="generated-post-textarea"
                    value={editedPost}
                    onChange={(e) => setEditedPost(e.target.value)}
                    rows={15}
                    className="w-full p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-slate-50 resize-none"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', lineHeight: '1.7' }}
                  />

                  <div className="flex gap-4">
                    <button
                      data-testid="copy-button"
                      onClick={handleCopy}
                      className="flex-1 h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Copy className="w-5 h-5" />
                      <span>Copy to Clipboard</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PostGenerator;