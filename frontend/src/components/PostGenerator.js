import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, RefreshCw, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FAFAFA] relative">
      {/* Background texture */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-40 mix-blend-multiply"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1761854149912-54ced79870ec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxtaW5pbWFsaXN0JTIwYWJzdHJhY3QlMjB3aGl0ZSUyMHBhcGVyJTIwdGV4dHVyZXxlbnwwfHx8fDE3NjY1MTUyNTB8MA&ixlib=rb-4.1.0&q=85')" }}
      />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-24 md:py-32">
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
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">AI-Powered</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 leading-[1.1]"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  Free LinkedIn Post<br />Generator
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
                  style={{ fontFamily: "'Satoshi', sans-serif" }}
                >
                  Transform any blog URL into a professional LinkedIn post in seconds.
                </motion.p>
              </div>

              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.01)] rounded-2xl p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2 border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all"
              >
                <input
                  data-testid="blog-url-input"
                  type="url"
                  value={blogUrl}
                  onChange={(e) => setBlogUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Paste your blog URL here..."
                  disabled={isLoading}
                  className="flex-1 border-none bg-transparent px-6 py-4 text-xl md:text-2xl font-medium placeholder:text-slate-300 focus:outline-none disabled:opacity-50 text-slate-900"
                  style={{ fontFamily: "'Satoshi', sans-serif" }}
                />
                <button
                  data-testid="generate-button"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="bg-[#4338CA] hover:bg-[#3730A3] text-white px-8 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  style={{ fontFamily: "'Satoshi', sans-serif" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="hidden md:inline">{loadingTexts[loadingTextIndex]}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </motion.div>

              {/* Loading Progress */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full origin-left"
                />
              )}
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
                  className="text-3xl md:text-4xl font-medium text-slate-800"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  Your LinkedIn Post
                </motion.h2>
                <motion.button
                  data-testid="reset-button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors active:scale-95 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden md:inline">New Post</span>
                </motion.button>
              </div>

              {/* Result Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
              >
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Editable</span>
                  <button
                    data-testid="copy-button"
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-medium shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-2"
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
                  className="w-full p-6 min-h-[300px] font-sans text-slate-700 whitespace-pre-wrap focus:outline-none focus:bg-slate-50/50 transition-colors resize-none"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontSize: '16px', lineHeight: '1.7' }}
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