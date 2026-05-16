import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageSquare, Share2, MoreHorizontal, Loader2, Image as ImageIcon, Send } from 'lucide-react';
import { getFirestore, collectionGroup, query, where, orderBy, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAppContext } from '../AppContext';

export default function CommunityView({ user }) {
  const { activeTheme } = useAppContext();
  const themeColor = activeTheme.mainColor;
  const db = getFirestore();

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 💬 留言專用狀態：記錄每一篇貼文目前的輸入框文字 { postId: "輸入的字" }
  const [commentInputs, setCommentInputs] = useState({});
  // 💬 控制哪幾篇貼文的留言區目前是被展開的 { postId: true/false }
  const [expandedComments, setExpandedComments] = useState({});

  // 📡 1. 連線雲端：抓取全站「公開」的回憶
  useEffect(() => {
    const q = query(
      collectionGroup(db, 'memories'),
      where('isPrivate', '==', false),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const publicMemories = snapshot.docs.map(doc => ({
        id: doc.id,
        ref: doc.ref,
        ...doc.data()
      }));
      setPosts(publicMemories);
      setIsLoading(false);
    }, (error) => {
      console.error("社群資料讀取錯誤:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  // ❤️ 2. 點讚功能
  const handleToggleLike = async (post) => {
    if (!user) return alert('請先登入才能按讚喔！');
    const currentLikes = post.likes || [];
    const hasLiked = currentLikes.includes(user.uid);
    try {
      const { arrayRemove, arrayUnion } = await import('firebase/firestore');
      await updateDoc(post.ref, {
        likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      alert("操作失敗，請檢查網路！");
    }
  };

  // 💬 3. 傳送留言功能（真實寫入雲端陣列）
  const handleSendComment = async (post) => {
    const text = commentInputs[post.id]?.trim();
    if (!text) return;
    if (!user) return alert('請先登入才能留言喔！');

    try {
      // 將留言打包成一個包含個人資訊的物件，丟進雲端的 comments 陣列中
      await updateDoc(post.ref, {
        comments: arrayUnion({
          uid: user.uid,
          userName: user.displayName || '回憶收藏家',
          userAvatar: user.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.uid}`,
          text: text,
          timeString: new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }) + ' ' + new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
        })
      });

      // 清空該篇貼文的輸入框
      setCommentInputs(prev => ({ ...prev, [post.id]: '' }));
    } catch (error) {
      console.error("留言發送失敗:", error);
      alert("留言失敗，請稍後再試！");
    }
  };

  // 📁 4. 切換顯示/隱藏留言區
  const toggleCommentBox = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // 🔍 5. 本地搜尋過濾
  const filteredPosts = posts.filter(post => 
    (post.name && post.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (post.story && post.story.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTagColor = (tag) => {
    if (!tag) return 'bg-gray-100 text-gray-600';
    if (tag.includes('轉售')) return 'bg-blue-50 text-blue-600';
    if (tag.includes('捐贈')) return 'bg-pink-50 text-pink-600';
    if (tag.includes('回收')) return 'bg-green-50 text-green-600';
    return 'bg-gray-100 text-gray-600';
  };

  const formatPostDate = (timestamp) => {
    if (!timestamp) return '剛剛';
    if (typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
    return '最近'; 
  };

  return (
    <div className="animate-in fade-in duration-500 bg-[#FAF7F2] min-h-screen pb-24 font-sans">
      
      {/* 頂部 Header */}
      <div className="bg-white px-5 pt-6 pb-4 sticky top-0 z-10 border-b border-gray-100/50 shadow-sm">
        <h1 className="text-2xl font-black text-gray-800 tracking-wide mb-1">社群廣場</h1>
        <p className="text-xs text-gray-400 font-bold tracking-wider mb-4">看看大家的斷捨離故事</p>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋物品、故事或情感標籤..." 
            className="w-full bg-gray-50 border-2 border-transparent focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-sm transition-all font-bold placeholder:text-gray-300 outline-none shadow-inner" 
            style={{ focusBorderColor: themeColor }}
          />
        </div>
      </div>

      {/* 貼文列表 */}
      <div className="p-4 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20" style={{ color: themeColor }}>
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-sm font-bold">正在載入社群故事...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-bold text-sm">目前還沒有公開的故事</p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const likeCount = post.likes ? post.likes.length : 0;
            const hasLiked = post.likes && user ? post.likes.includes(user.uid) : false;
            
            // 抓取留言數量與陣列
            const commentList = post.comments || [];
            const commentCount = commentList.length;
            const isCommentOpen = !!expandedComments[post.id];

            return (
              <div key={post.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100/80">
                
                {/* 發文者資料 */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${post.id}&backgroundColor=f3f4f6`} alt="avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                    <div>
                      <p className="font-black text-gray-800 text-sm">回憶收藏家</p>
                      <p className="text-[10px] text-gray-400 font-bold">{formatPostDate(post.createdAt)}</p>
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-gray-500 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                {/* 照片 */}
                <div className="w-full aspect-square md:aspect-[4/3] bg-gray-50 rounded-2xl mb-4 overflow-hidden border border-gray-100 flex items-center justify-center relative">
                  {post.coverImageUrl ? (
                    <img src={post.coverImageUrl} alt={post.name} className="w-full h-full object-cover" />
                  ) : (
                    <Heart size={40} className="text-gray-200" />
                  )}
                  {post.decision && (
                     <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-[10px] font-black shadow-md backdrop-blur-md bg-white/90 ${getTagColor(post.decision)}`}>
                       {post.decision}
                     </div>
                  )}
                </div>
                
                <h3 className="font-black text-lg text-gray-800 leading-tight mb-2">{post.name}</h3>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.emotions?.map(emo => (
                    <span key={emo} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-500">#{emo}</span>
                  ))}
                </div>

                <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4 italic">
                  "{post.story || '尚未撰寫詳細故事'}"
                </p>
                
                {/* 互動按鈕列 */}
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-gray-400">
                  <div className="flex gap-5">
                    <button 
                      onClick={() => handleToggleLike(post)}
                      className={`flex items-center gap-1.5 transition-colors group ${hasLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                    >
                      <Heart size={20} className={`transition-transform active:scale-75 ${hasLiked ? 'fill-current' : ''}`} /> 
                      <span className="font-bold text-sm">{likeCount}</span>
                    </button>
                    
                    {/* 💬 點擊留言按鈕展開或收合留言板 */}
                    <button 
                      onClick={() => toggleCommentBox(post.id)}
                      className={`flex items-center gap-1.5 transition-colors hover:text-blue-500 ${isCommentOpen ? 'text-blue-500' : ''}`}
                    >
                      <MessageSquare size={20} /> 
                      <span className="font-bold text-sm">{commentCount > 0 ? `${commentCount} 則留言` : '留言'}</span>
                    </button>
                  </div>
                  <button className="hover:text-gray-600 transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>

                {/* 💬 🌟 展開的雲端即時留言板區區塊 */}
                {isCommentOpen && (
                  <div className="mt-4 pt-4 border-t border-gray-50/60 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    
                    {/* 留言列表展示 */}
                    {commentList.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2 font-medium">還沒有人留言，快來當第一個發言的人吧！✨</p>
                    ) : (
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {commentList.map((comment, index) => (
                          <div key={index} className="flex gap-2.5 items-start text-xs animate-in fade-in">
                            <img src={comment.userAvatar} alt="avatar" className="w-7 h-7 rounded-full bg-gray-100 flex-none" />
                            <div className="bg-gray-50 p-2.5 rounded-2xl flex-1 border border-gray-100/50">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="font-black text-gray-700">{comment.userName}</span>
                                <span className="text-[9px] text-gray-400 font-bold">{comment.timeString}</span>
                              </div>
                              <p className="text-gray-600 font-medium leading-relaxed">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 留言輸入框列 */}
                    <div className="flex gap-2 items-center mt-2">
                      <input 
                        type="text" 
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post)}
                        placeholder="寫下你的溫馨回應..."
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:bg-white transition-all shadow-inner"
                      />
                      <button 
                        onClick={() => handleSendComment(post)}
                        style={{ backgroundColor: commentInputs[post.id]?.trim() ? themeColor : '#E5E7EB' }}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="p-2.5 rounded-xl text-white shadow-md transition-all active:scale-90 flex-none disabled:shadow-none disabled:cursor-not-allowed"
                      >
                        <Send size={14} strokeWidth={2.5} />
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}