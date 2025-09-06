import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, where, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowUp, MessageCircle, Heart, Share2 } from "lucide-react";
import Footer from "../components/Footer";
import { useDarkMode } from "../contexts/DarkModeContext";
import "../styles/Blog.css";

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortBy, setSortBy] = useState("newest"); // newest, popular, trending
  const [category, setCategory] = useState("all"); // all, advice, success, question
  const { isDarkMode } = useDarkMode();
  
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [sortBy, category]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let postsQuery = collection(db, "blog_posts");
      
      // Apply filters
      if (category !== "all") {
        postsQuery = query(postsQuery, where("category", "==", category));
      }
      
      // Apply sorting
      if (sortBy === "newest") {
        postsQuery = query(postsQuery, orderBy("createdAt", "desc"));
      } else if (sortBy === "popular") {
        postsQuery = query(postsQuery, orderBy("likes", "desc"));
      } else if (sortBy === "trending") {
        postsQuery = query(postsQuery, orderBy("comments", "desc"));
      }
      
      // Limit to 50 posts for performance
      postsQuery = query(postsQuery, limit(50));
      
      const querySnapshot = await getDocs(postsQuery);
      
      const postsData = [];
      for (const docSnapshot of querySnapshot.docs) {
        const postData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Get author info
        if (postData.authorId) {
          const authorDoc = await getDoc(doc(db, "users", postData.authorId));
          if (authorDoc.exists()) {
            postData.authorName = authorDoc.data().name || "Anonymous";
            postData.authorAvatar = authorDoc.data().photoURL || "";
          }
        }
        
        postsData.push(postData);
      }
      
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create a post");
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    
    try {
      const newPost = {
        title,
        content,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0,
        category: document.getElementById("category").value,
      };
      
      await addDoc(collection(db, "blog_posts"), newPost);
      toast.success("Post created successfully!");
      setTitle("");
      setContent("");
      setShowCreateForm(false);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  return (
    <div>
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-beige text-gray-800"}`}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-4xl font-bold text-center mb-8 ${isDarkMode ? "text-yellow-400" : "text-[#FF7F11]"}`}>
            Pawthway Community
          </h1>
          
          {/* Filters and Create Post Button */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex flex-wrap gap-3">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"} border`}
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Liked</option>
                <option value="trending">Most Discussed</option>
              </select>
              
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"} border`}
              >
                <option value="all">All Categories</option>
                <option value="advice">Advice</option>
                <option value="success">Success Stories</option>
                <option value="question">Questions</option>
                <option value="general">General</option>
              </select>
            </div>
            
            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateForm(!showCreateForm)}
                className={`px-6 py-2 rounded-lg font-semibold ${isDarkMode 
                  ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400" 
                  : "bg-[#FF7F11] text-white hover:bg-[#FF1B1C]"} transition-colors`}
              >
                {showCreateForm ? "Cancel" : "Create Post"}
              </motion.button>
            )}
          </div>
          
          {/* Create Post Form */}
          {showCreateForm && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-8 p-6 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-yellow-400" : "text-[#FF7F11]"}`}>
                Create a New Post
              </h2>
              <form onSubmit={handleCreatePost}>
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                    placeholder="Give your post a title"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Category</label>
                  <select
                    id="category"
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                    required
                  >
                    <option value="general">General</option>
                    <option value="advice">Advice</option>
                    <option value="success">Success Story</option>
                    <option value="question">Question</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                    rows="6"
                    placeholder="Share your thoughts, questions, or stories..."
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className={`px-6 py-2 rounded-lg font-semibold ${isDarkMode 
                      ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400" 
                      : "bg-[#FF7F11] text-white hover:bg-[#FF1B1C]"} transition-colors`}
                  >
                    Post
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
          
          {/* Posts List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? "border-yellow-400" : "border-[#FF7F11]"}`}></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-6 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
                >
                  <Link to={`/blog/${post.id}`} className="block">
                    <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-yellow-400 hover:text-yellow-300" : "text-[#FF7F11] hover:text-[#FF1B1C]"} transition-colors`}>
                      {post.title}
                    </h2>
                  </Link>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-gray-300">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt="Author" className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                          {post.authorName?.charAt(0) || "A"}
                        </div>
                      )}
                    </div>
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {post.authorName || "Anonymous"} • {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : "Recently"}
                    </span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                      {post.category || "General"}
                    </span>
                  </div>
                  
                  <p className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {post.content.length > 300 ? post.content.substring(0, 300) + "..." : post.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                      <button className="flex items-center space-x-1 text-sm">
                        <Heart size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                        <span>{post.likes || 0}</span>
                      </button>
                      <Link to={`/blog/${post.id}`} className="flex items-center space-x-1 text-sm">
                        <MessageCircle size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                        <span>{post.comments || 0}</span>
                      </Link>
                    </div>
                    <button className="flex items-center space-x-1 text-sm">
                      <Share2 size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              <p className="text-xl mb-4">No posts found</p>
              {user ? (
                <p>Be the first to create a post!</p>
              ) : (
                <p>
                  <Link to="/login" className={`font-medium ${isDarkMode ? "text-yellow-400" : "text-[#FF7F11]"}`}>Log in</Link> to create a post
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
     
    </div>
    <Footer />
    </div>
  );
};

export default Blog;