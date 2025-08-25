import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, onSnapshot, increment, serverTimestamp, deleteDoc, setDoc, getDocs, writeBatch } from "firebase/firestore";
import "../styles/Blog.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowLeft, Heart, MessageCircle, Share2, MoreVertical, Trash2, Edit } from "lucide-react";
import Footer from "../components/Footer";
import { useDarkMode } from "../contexts/DarkModeContext";

const BlogPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const { isDarkMode } = useDarkMode();
  
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && post) {
        checkLikeStatus(currentUser.uid, post.id);
      }
    });

    return () => unsubscribe();
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, "blog_posts", postId));
        
        if (postDoc.exists()) {
          const postData = { id: postDoc.id, ...postDoc.data() };
          
          // Get author info
          if (postData.authorId) {
            const authorDoc = await getDoc(doc(db, "users", postData.authorId));
            if (authorDoc.exists()) {
              postData.authorName = authorDoc.data().name || "Anonymous";
              postData.authorAvatar = authorDoc.data().photoURL || "";
            }
          }
          
          setPost(postData);
          setEditedTitle(postData.title || "");
          setEditedContent(postData.content || "");
          
          if (user) {
            checkLikeStatus(user.uid, postId);
          }
        } else {
          toast.error("Post not found");
          navigate("/blog");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    setupCommentsListener();
  }, [postId]);

  const setupCommentsListener = () => {
    const commentsQuery = query(
      collection(db, "blog_comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(commentsQuery, async (snapshot) => {
      const commentsData = [];
      
      for (const docSnapshot of snapshot.docs) {
        const commentData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Get author info
        if (commentData.authorId) {
          const authorDoc = await getDoc(doc(db, "users", commentData.authorId));
          if (authorDoc.exists()) {
            commentData.authorName = authorDoc.data().name || "Anonymous";
            commentData.authorAvatar = authorDoc.data().photoURL || "";
          }
        }
        
        commentsData.push(commentData);
      }
      
      setComments(commentsData);
    });

    return unsubscribe;
  };

  const checkLikeStatus = async (userId, postId) => {
    try {
      const likeDoc = await getDoc(doc(db, "blog_likes", `${userId}_${postId}`));
      setLiked(likeDoc.exists());
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like posts");
      return;
    }

    try {
      const likeId = `${user.uid}_${postId}`;
      const likeRef = doc(db, "blog_likes", likeId);
      const postRef = doc(db, "blog_posts", postId);

      if (liked) {
        // Unlike
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likes: increment(-1)
        });
        setLiked(false);
      } else {
        // Like
        await setDoc(likeRef, {
          userId: user.uid,
          postId: postId,
          createdAt: serverTimestamp()
        });
        await updateDoc(postRef, {
          likes: increment(1)
        });
        setLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to comment");
      return;
    }
    
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    try {
      const newComment = {
        postId,
        content: commentText,
        authorId: user.uid,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, "blog_comments"), newComment);
      
      // Update comment count on post
      await updateDoc(doc(db, "blog_posts", postId), {
        comments: increment(1)
      });
      
      setCommentText("");
      toast.success("Comment added");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleDeletePost = async () => {
    if (!user || (post && post.authorId !== user.uid)) {
      toast.error("You can only delete your own posts");
      return;
    }

    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        // Delete all comments
        const commentsQuery = query(
          collection(db, "blog_comments"),
          where("postId", "==", postId)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const batch = writeBatch(db);
        
        commentsSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        // Delete all likes
        const likesQuery = query(
          collection(db, "blog_likes"),
          where("postId", "==", postId)
        );
        const likesSnapshot = await getDocs(likesQuery);
        
        likesSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        // Delete the post
        batch.delete(doc(db, "blog_posts", postId));
        
        await batch.commit();
        
        toast.success("Post deleted successfully");
        navigate("/blog");
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post");
      }
    }
  };

  const handleUpdatePost = async () => {
    if (!user || (post && post.authorId !== user.uid)) {
      toast.error("You can only edit your own posts");
      return;
    }

    if (!editedTitle.trim() || !editedContent.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      await updateDoc(doc(db, "blog_posts", postId), {
        title: editedTitle,
        content: editedContent,
        updatedAt: serverTimestamp()
      });

      setPost({
        ...post,
        title: editedTitle,
        content: editedContent,
        updatedAt: new Date()
      });

      setEditMode(false);
      toast.success("Post updated successfully");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const commentDoc = await getDoc(doc(db, "blog_comments", commentId));
      
      if (!commentDoc.exists()) {
        toast.error("Comment not found");
        return;
      }
      
      const commentData = commentDoc.data();
      
      if (user.uid !== commentData.authorId) {
        toast.error("You can only delete your own comments");
        return;
      }
      
      await deleteDoc(doc(db, "blog_comments", commentId));
      
      // Update comment count on post
      await updateDoc(doc(db, "blog_posts", postId), {
        comments: increment(-1)
      });
      
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${isDarkMode ? "bg-gray-900" : "bg-beige"}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? "border-yellow-400" : "border-[#FF7F11]"}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-beige text-gray-800"}`}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <Link 
              to="/blog" 
              className={`flex items-center ${isDarkMode ? "text-gray-300 hover:text-yellow-400" : "text-gray-600 hover:text-[#FF7F11]"} transition-colors`}
            >
              <ArrowLeft size={18} />
              <span className="ml-2">Back to all posts</span>
            </Link>
          </div>
          
          <div className={`p-6 rounded-xl shadow-lg mb-8 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            {editMode ? (
              <div>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className={`w-full px-4 py-2 text-2xl font-bold mb-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"}`}
                />
                
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border mb-4 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"}`}
                  rows="10"
                ></textarea>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setEditMode(false)}
                    className={`px-4 py-2 rounded-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePost}
                    className={`px-4 py-2 rounded-lg font-semibold ${isDarkMode ? "bg-yellow-500 text-gray-900" : "bg-[#FF7F11] text-white"}`}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <h1 className={`text-3xl font-bold ${isDarkMode ? "text-yellow-400" : "text-[#FF7F11]"}`}>
                    {post?.title}
                  </h1>
                  
                  {user && post?.authorId === user.uid && (
                    <div className="relative">
                      <button 
                        onClick={() => setShowOptions(!showOptions)}
                        className={`p-2 rounded-full ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {showOptions && (
                        <div 
                          className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}
                          onBlur={() => setShowOptions(false)}
                        >
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setEditMode(true);
                                setShowOptions(false);
                              }}
                              className={`flex items-center px-4 py-2 text-sm w-full text-left ${isDarkMode ? "hover:bg-gray-600 text-white" : "hover:bg-gray-100 text-gray-700"}`}
                            >
                              <Edit size={16} className="mr-2" />
                              Edit Post
                            </button>
                            <button
                              onClick={() => {
                                handleDeletePost();
                                setShowOptions(false);
                              }}
                              className="flex items-center px-4 py-2 text-sm w-full text-left text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete Post
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-300">
                    {post?.authorAvatar ? (
                      <img src={post.authorAvatar} alt="Author" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                        {post?.authorName?.charAt(0) || "A"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{post?.authorName || "Anonymous"}</p>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {post?.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : "Recently"}
                      {post?.updatedAt?.toDate && " (edited)"}
                    </p>
                  </div>
                  <span className={`ml-4 px-3 py-1 text-xs rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                    {post?.category || "General"}
                  </span>
                </div>
                
                <div className="mb-8">
                  <p className={`whitespace-pre-line ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {post?.content}
                  </p>
                </div>
                
                <div className={`flex items-center justify-between border-t pt-4 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <div className="flex space-x-6">
                    <button 
                      onClick={handleLike}
                      className={`flex items-center space-x-2 ${liked ? (isDarkMode ? "text-yellow-400" : "text-[#FF7F11]") : ""}`}
                    >
                      <Heart size={20} className={liked ? "fill-current" : ""} />
                      <span>{post?.likes || 0} likes</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <MessageCircle size={20} />
                      <span>{comments.length} comments</span>
                    </div>
                  </div>
                  <button className="flex items-center space-x-2">
                    <Share2 size={20} />
                    <span>Share</span>
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Comments Section */}
          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? "text-yellow-400" : "text-[#FF7F11]"}`}>
              Comments ({comments.length})
            </h2>
            
            {user ? (
              <form onSubmit={handleAddComment} className="mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Your avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"} mb-2`}
                      rows="3"
                    ></textarea>
                    <div className="flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className={`px-4 py-2 rounded-lg font-semibold ${isDarkMode ? "bg-yellow-500 text-gray-900" : "bg-[#FF7F11] text-white"}`}
                      >
                        Post Comment
                      </motion.button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className={`text-center py-4 mb-6 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <p>
                  <Link to="/login" className={`font-medium ${isDarkMode ? "text-yellow-400" : "text-[#FF7F11]"}`}>Log in</Link> to join the conversation
                </p>
              </div>
            )}
            
            {comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-gray-300">
                          {comment.authorAvatar ? (
                            <img src={comment.authorAvatar} alt="Commenter" className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                              {comment.authorName?.charAt(0) || "A"}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{comment.authorName || "Anonymous"}</p>
                          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleDateString() : "Recently"}
                          </p>
                        </div>
                      </div>
                      
                      {user && comment.authorId === user.uid && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete comment"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    
                    <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                      {comment.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPost;