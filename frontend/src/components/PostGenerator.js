import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, RefreshCw, Zap, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const [isEditMode, setIsEditMode] = useState(false);

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
      }, {
        timeout: 180000 // 3 minutes timeout to match backend
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
        errorMessage = error.response?.data?.detail || 'Service configuration issue. Please contact support.';
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

  const handleCopyForLinkedIn = async () => {
    try {
      // Copy the exact text as-is (Unicode formatted, ready for LinkedIn)
      await navigator.clipboard.writeText(editedPost);
      toast.success('✓ Copied! Ready to paste in LinkedIn', { duration: 3000 });
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-24">
        <AnimatePresence mode="wait">
          {!generatedPost ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 sm:space-y-12"
            >
              {/* Header */}
              <div className="text-center space-y-4 sm:space-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full backdrop-blur-sm"
                >
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" fill="currentColor" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-300">AI-Powered</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-none px-2"
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
                  className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto px-4"
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
                  className={`relative bg-[#0B0C15] border-2 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                    isFocused ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'border-slate-800'
                  }`}
                >
                  {/* Tracing Beam Effect */}
                  {isFocused && (
                    <motion.div
                      className="absolute inset-0 rounded-xl sm:rounded-2xl"
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
                  
                  <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-3 p-2 sm:p-3">
                    <input
                      data-testid="blog-url-input"
                      type="url"
                      value={blogUrl}
                      onChange={(e) => setBlogUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleGenerate(e)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Paste your blog URL here..."
                      disabled={isLoading}
                      className="flex-1 bg-transparent border-none px-4 py-3 sm:px-6 sm:py-4 text-lg sm:text-xl md:text-2xl text-white placeholder:text-slate-600 focus:outline-none disabled:opacity-50"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    />
                    <button
                      data-testid="generate-button"
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="relative px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-lg sm:rounded-xl font-semibold text-white text-sm sm:text-base transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/50 overflow-hidden group"
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
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.div>
                            <span className="hidden sm:inline">{loadingTexts[loadingTextIndex]}</span>
                            <span className="sm:hidden">Processing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-pink-500 rounded-full origin-left"
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
              className="space-y-6 sm:space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  Your LinkedIn Post
                </motion.h2>
                <motion.button
                  data-testid="reset-button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleReset}
                  className="px-4 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-slate-300 font-medium text-sm sm:text-base transition-all backdrop-blur-sm hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">New Post</span>
                  <span className="sm:hidden">New</span>
                </motion.button>
              </div>

              {/* Result Card with Glassmorphism */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10"
              >
                <div className="bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {isEditMode ? 'Editing' : 'Preview'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditMode(!isEditMode)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-medium text-xs sm:text-sm shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{isEditMode ? 'Preview' : 'Edit'}</span>
                    </button>
                    <button
                      data-testid="copy-button"
                      onClick={handleCopyForLinkedIn}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium text-xs sm:text-sm shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      title="Copy plain text for LinkedIn. You'll need to format and add images manually."
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Copy for LinkedIn</span>
                    </button>
                  </div>
                </div>
                
                {/* LinkedIn Instructions */}
                {!isEditMode && (
                  <div className="px-4 py-3 sm:px-6 sm:py-4 bg-indigo-500/5 border-t border-white/10 text-xs sm:text-sm text-slate-400">
                    <p className="font-semibold text-slate-300 mb-1">📋 How to post on LinkedIn:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Click "Copy for LinkedIn" button above</li>
                      <li>Paste into LinkedIn post editor</li>
                      <li>Use LinkedIn's formatting buttons to add <strong>bold</strong> and <em>italic</em></li>
                      <li>Click LinkedIn's "Add media" button to upload images</li>
                      <li>Add emojis using your keyboard emoji picker</li>
                    </ol>
                  </div>
                )}
                
                {isEditMode ? (
                  <textarea
                    data-testid="generated-post-textarea"
                    value={editedPost}
                    onChange={(e) => setEditedPost(e.target.value)}
                    rows={15}
                    className="w-full p-4 sm:p-6 bg-transparent text-slate-200 whitespace-pre-wrap focus:outline-none focus:bg-white/5 transition-colors resize-none border-none text-sm sm:text-base"
                    style={{ fontFamily: "'Manrope', sans-serif", lineHeight: '1.7' }}
                  />
                ) : (
                  <div 
                    data-testid="generated-post-preview"
                    className="w-full p-4 sm:p-6 bg-transparent text-slate-200 markdown-preview"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    {editedPost ? (
                      <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            img: ({node, ...props}) => (
                              <img 
                                {...props} 
                                className="rounded-lg shadow-lg max-w-full h-auto my-4"
                                loading="lazy"
                                alt={props.alt || 'LinkedIn post image'}
                              />
                            ),
                            a: ({node, ...props}) => {
                              // Check if the link is an image URL
                              const url = props.href || '';
                              
                              // Check for file extension
                              const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
                              
                              // Check for image CDN patterns
                              const isImageCDN = /media\.linkedin\.com\/dms\/image/i.test(url) ||
                                                /cloudinary\.com\/.*\/image/i.test(url) ||
                                                /imgur\.com/i.test(url) ||
                                                /googleusercontent\.com/i.test(url) ||
                                                /githubusercontent\.com/i.test(url) ||
                                                /unsplash\.com/i.test(url) ||
                                                /pexels\.com/i.test(url);
                              
                              // Check for image keywords in path
                              const hasImageKeyword = /\/image|\/img|\/photo|\/picture|\/screenshot|article-inline_image/i.test(url);
                              
                              const isImage = hasImageExtension || isImageCDN || hasImageKeyword;
                              
                              if (isImage) {
                                return (
                                  <img 
                                    src={url}
                                    className="rounded-lg shadow-lg max-w-full h-auto my-4 block"
                                    loading="lazy"
                                    alt={props.children?.[0] || 'Image'}
                                    onError={(e) => {
                                      console.error('Image failed to load:', url);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                );
                              }
                              return (
                                <a 
                                  {...props} 
                                  className="text-cyan-400 hover:text-cyan-300 underline transition-colors break-words"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              );
                            },
                            strong: ({node, ...props}) => (
                              <strong {...props} className="text-white font-semibold" />
                            ),
                            em: ({node, ...props}) => (
                              <em {...props} className="text-slate-300 italic" />
                            ),
                            code: ({node, inline, ...props}) => 
                              inline ? (
                                <code {...props} className="bg-slate-800/80 text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono" style={{ display: 'inline' }} />
                              ) : (
                                <code {...props} className="block bg-slate-800 text-cyan-400 p-4 rounded-lg overflow-x-auto text-sm font-mono" />
                              ),
                          }}
                        >
                          {editedPost}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-slate-400">No content to display</p>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PostGenerator;