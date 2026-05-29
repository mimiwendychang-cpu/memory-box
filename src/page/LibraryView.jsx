import React, { useState } from 'react';
import { Search, Plus, Lock, Image as ImageIcon, Inbox, Heart, X, Edit2, Trash2, Save, Unlock, ShoppingBag, Store } from 'lucide-react';
import { useAppContext } from '../AppContext'; 

export default function LibraryView({ memories, onAddNew, onUpdate, onDelete }) {
  const { activeTheme } = useAppContext();
  const themeColor = activeTheme.mainColor;
  const themeLightBg = activeTheme.lightBg;

  const tabs = ['全部', '轉售', '捐贈', '回收', '保留', '未決定'];
  const [filter, setFilter] = useState('全部');
  const [searchQuery, setSearchQuery] = useState(''); 

  // 彈窗與編輯狀態
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', story: '', decision: '', isPrivate: false });

  const formatDate = (timestamp) => {
    if (!timestamp) return '剛剛';
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('zh-TW', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      });
    }
    return String(timestamp); 
  };

  const filteredMemories = memories.filter(m => {
    const status = m.decision || '未決定';
    const matchTab = filter === '全部' || status.includes(filter);
    const matchSearch = (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                        (m.story && m.story.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTab && matchSearch;
  });

  const getStatusStyle = (status) => {
    if (!status) return 'bg-gray-100 text-gray-500';
    if (status.includes('轉售')) return 'bg-red-50 text-red-500';
    if (status.includes('捐贈')) return 'bg-pink-50 text-pink-500';
    if (status.includes('回收')) return 'bg-green-50 text-green-600';
    if (status.includes('保留')) return 'bg-orange-50 text-orange-500';
    return 'bg-gray-100 text-gray-500';
  };

  const handleCardClick = (memory) => {
    setSelectedMemory(memory);
    setEditForm({
      name: memory.name || '',
      story: memory.story || '',
      decision: memory.decision || '還沒決定',
      isPrivate: memory.isPrivate || false
    });
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) return alert('物品名稱不能留空喔！');
    await onUpdate(selectedMemory.id, editForm);
    setSelectedMemory(prev => ({ ...prev, ...editForm }));
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(selectedMemory.id);
    setSelectedMemory(null);
  };

  return (
    <div className="animate-in fade-in duration-300 min-h-screen pb-24 bg-gray-50/50">
      
      {/* 頂部控制區 */}
      <div className="p-5 sticky top-0 z-10 bg-gray-50/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black text-gray-800 tracking-wide">我的記憶庫</h1>
          <button 
            onClick={onAddNew}
            style={{ color: themeColor, backgroundColor: themeLightBg }} 
            className="px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus size={16}/> 新增
          </button>
        </div>

        {/* 搜尋框 */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18}/>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋物品名稱或回憶故事..." 
            className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all font-bold placeholder:text-gray-300" 
            style={{ focusRingColor: themeColor }}
          />
        </div>

        {/* 分類標籤滑動列 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map(t => (
            <button 
              key={t} 
              onClick={() => setFilter(t)} 
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 border ${filter === t ? 'shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
              style={filter === t ? { backgroundColor: themeColor, color: 'white', borderColor: themeColor } : {}} 
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 回憶卡片列表 */}
      <div className="p-5 space-y-3">
        {filteredMemories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Inbox size={48} className="mb-4 opacity-50" />
            <p className="font-bold text-sm">找不到相關的回憶</p>
          </div>
        )}

        {filteredMemories.map(m => (
          <div 
            key={m.id} 
            onClick={() => handleCardClick(m)}
            className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
          >
            <div className="w-[88px] h-[88px] bg-gray-50 rounded-2xl flex items-center justify-center flex-none text-gray-300 overflow-hidden border border-gray-100 relative">
              {m.coverImageUrl ? (
                <img src={m.coverImageUrl} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <Heart size={28} className="text-gray-300" strokeWidth={2.5} />
              )}
            </div>

            <div className="flex-1 py-1 pr-1 flex flex-col justify-between relative overflow-hidden">
              {m.isPrivate && <Lock size={14} className="absolute right-1 top-1 text-gray-300" />}
              <div>
                <h3 className="font-black text-gray-800 text-lg mb-1 pr-6 truncate">{m.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide ${getStatusStyle(m.decision)}`}>
                    {m.decision || '未決定'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">{formatDate(m.createdAt)}</span>
                </div>
              </div>
              {m.story && <p className="text-xs text-gray-500 font-medium line-clamp-1 italic">"{m.story}"</p>}
            </div>
          </div>
        ))}
      </div>

      {/* 🌟 史詩級美化彈窗 */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in duration-200">
          <div className="bg-[#FAF9F6] w-full max-w-md rounded-t-[40px] p-6 space-y-6 max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 shadow-2xl flex flex-col">
            
            {/* 彈窗頂部 */}
            <div className="flex justify-between items-center flex-none">
              <h2 className="text-xl font-black text-gray-800">{isEditing ? '編輯回憶資料' : '回憶詳細內容'}</h2>
              <button onClick={() => setSelectedMemory(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"><X size={16}/></button>
            </div>

            {/* 彈窗身體 */}
            <div className="flex-1 space-y-5 overflow-y-auto pr-1 pb-4">
              
              {/* 瀏覽模式 */}
              {!isEditing && (
                <>
                  {selectedMemory.coverImageUrl && (
                    <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-sm bg-gray-50 border border-gray-100">
                      <img src={selectedMemory.coverImageUrl} className="w-full h-full object-cover" alt="cover" />
                    </div>
                  )}

                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        {selectedMemory.name}
                        {selectedMemory.isPrivate && <Lock size={16} className="text-gray-400" />}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-wider">記錄日期：{formatDate(selectedMemory.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black shadow-sm ${getStatusStyle(selectedMemory.decision)}`}>
                        {selectedMemory.decision || '未決定'}
                      </span>
                      {selectedMemory.emotions?.map(emo => (
                        <span key={emo} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-500">#{emo}</span>
                      ))}
                    </div>

                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 shadow-inner">
                      <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
                        "{selectedMemory.story || '尚未撰寫這段回憶故事喔。'}"
                      </p>
                    </div>
                  </div>

                  {/* 🛒 🌟 震撼加分功能：轉售快捷傳送門 🛒 */}
                  {selectedMemory.decision?.includes('轉售') && (
                    <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-3xl space-y-3 animate-in zoom-in-95">
                      <div className="text-center">
                        <p className="text-xs font-black text-orange-800">🚀 為舊物開啟下一段旅程</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">點擊下方按鈕，一鍵前往二手拍賣平台架設賣場</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <a 
                          href="https://shopee.tw" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-[#EE4D2D] text-white py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
                        >
                          <ShoppingBag size={14} /> 傳送至 蝦皮購物
                        </a>
                        <a 
                          href="https://www.ruten.com.tw" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-[#005CAF] text-white py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
                        >
                          <Store size={14} /> 傳送至 露天拍賣
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 🌟 完美的 AddView 規格化編輯表單 */}
              {isEditing && (
                <div className="space-y-5 animate-in fade-in">
                  
                  {/* 輸入框美化 */}
                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wide">物件名稱 *</label>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})} 
                      className="w-full p-3.5 bg-gray-50 focus:bg-white border-2 border-transparent rounded-xl text-sm font-bold outline-none transition-all shadow-inner" 
                      style={{ focusBorderColor: themeColor }}
                    />
                  </div>

                  {/* 故事編輯美化 */}
                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wide">回憶描述故事</label>
                    <textarea 
                      rows="4" 
                      value={editForm.story} 
                      onChange={e => setEditForm({...editForm, story: e.target.value})} 
                      className="w-full p-3.5 bg-gray-50 focus:bg-white border-2 border-transparent rounded-xl text-sm font-medium outline-none resize-none transition-all shadow-inner leading-relaxed"
                      style={{ focusBorderColor: themeColor }}
                    ></textarea>
                  </div>

                  {/* 🌟 拋棄死板下拉選單！完美還原 AddView 的大字卡選擇機制 */}
                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wide">更新處理決策</label>
                    <div className="space-y-2">
                      {['繼續保留', '二手轉售', '公益捐贈', '環保回收', '還沒決定'].map(opt => (
                        <div 
                          key={opt} 
                          onClick={() => setEditForm({...editForm, decision: opt})} 
                          className={`p-3.5 rounded-xl flex justify-between items-center cursor-pointer transition-all border-2 ${editForm.decision === opt ? 'bg-white shadow-sm' : 'border-transparent bg-gray-50 hover:bg-white'}`} 
                          style={editForm.decision === opt ? { borderColor: themeColor } : {}}
                        >
                          <span className="font-black text-xs" style={{ color: editForm.decision === opt ? themeColor : '#4B5563' }}>{opt}</span>
                          {editForm.decision === opt && <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: themeColor }}></div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 智慧隱私 Switch 按鈕美化 */}
                  <div 
                    onClick={() => setEditForm({...editForm, isPrivate: !editForm.isPrivate})}
                    className="flex items-center justify-between p-4 bg-white shadow-sm rounded-2xl border-2 cursor-pointer transition-all"
                    style={editForm.isPrivate ? { borderColor: themeColor } : { borderColor: 'transparent' }}
                  >
                    <div className="flex items-center gap-2 text-gray-700 font-bold text-xs">
                      <Lock size={14} style={{ color: editForm.isPrivate ? themeColor : '#9CA3AF' }} />
                      私人保存設定
                      <span className="text-[10px] font-normal text-gray-400">（開啟後僅自己可見）</span>
                    </div>
                    <div 
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors ${editForm.isPrivate ? '' : 'bg-gray-200'}`}
                      style={{ backgroundColor: editForm.isPrivate ? themeColor : '' }}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${editForm.isPrivate ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* 彈窗底部的控制按鈕 */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 flex-none bg-white">
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-3.5 rounded-2xl bg-gray-100 font-bold text-sm text-gray-500 active:scale-95 transition-transform">取消</button>
                  <button onClick={handleSaveEdit} style={{ backgroundColor: themeColor }} className="flex-[2] py-3.5 rounded-2xl font-black text-sm text-white flex justify-center items-center gap-1.5 shadow-lg active:scale-95 transition-transform"><Save size={16}/>儲存修改</button>
                </>
              ) : (
                <>
                  <button onClick={handleDelete} className="flex-1 py-3.5 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 font-bold text-sm flex justify-center items-center gap-1.5 transition-colors active:scale-95 transform"><Trash2 size={16}/>刪除</button>
                  <button onClick={() => setIsEditing(true)} style={{ color: themeColor, backgroundColor: `${themeColor}15` }} className="flex-[2] py-3.5 rounded-2xl font-black text-sm flex justify-center items-center gap-1.5 transition-colors active:scale-95 transform"><Edit2 size={16}/>編輯回憶</button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}