import React from 'react';
import { BookOpen, Globe, Recycle, PlusCircle, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function HomeView({ setTab, themeColor, memories, user }) {
  return (
    <div className="p-6 animate-in fade-in duration-500">
      
      {/* 歡迎語 */}
      <div className="mb-8 px-2">
        <h2 className="text-gray-400 font-bold text-sm mb-1">歡迎回來,</h2>
        <h1 className="text-3xl font-black text-gray-800 truncate">{user?.displayName || '回憶收藏家'}</h1>
      </div>

      {/* 數據統計面板 */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard label="回憶總數" num={memories.length} icon={<BookOpen/>} color={themeColor} />
        <StatCard label="公開分享" num="0" icon={<Globe/>} color="#3B82F6" />
        <StatCard label="已決策" num={memories.filter(m => m.decision && m.decision !== '還沒決定').length} icon={<Recycle/>} color="#10B981" />
      </div>

      {/* 大按鈕 */}
      <button 
        onClick={() => setTab('add')} 
        style={{ backgroundColor: themeColor }} 
        className="w-full py-5 rounded-[28px] text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all mb-8"
      >
        <PlusCircle size={24} /> 記錄一件舊物的故事
      </button>

      {/* 最近回憶標題 */}
      <div className="flex justify-between items-center mb-5 px-2">
        <h3 className="font-black text-xl text-gray-800">最近的回憶</h3>
        <button onClick={() => setTab('library')} style={{ color: themeColor }} className="text-xs font-black">查看全部</button>
      </div>

      {/* 🌟 核心優化：最近回憶列表 (加入真實封面渲染) */}
      <div className="space-y-4 mb-10">
        {memories.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 text-xs font-bold text-gray-400 shadow-sm">
            目前還沒有新增任何舊物記憶喔！
          </div>
        ) : (
          memories.slice(0, 2).map(m => (
            <div 
              key={m.id} 
              onClick={() => setTab('library')}
              className="bg-white p-4 rounded-[28px] border border-gray-50 shadow-sm flex items-center gap-4 group cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
            >
              {/* 🖼️ 優化：左側相片區，如果有雲端封面網址就渲染出來，沒有則保持預設圖示 */}
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 group-hover:bg-gray-100 transition-colors overflow-hidden flex-none border border-gray-100">
                {m.coverImageUrl ? (
                  <img src={m.coverImageUrl} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={28} className="opacity-60" />
                )}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <h4 className="font-black text-base text-gray-800 truncate">{m.name}</h4>
                <p className="text-xs text-gray-400 mt-1 font-bold">
                  {m.date} • <span style={{ color: themeColor }} className="font-black">{m.decision || '還沒決定'}</span>
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-300 flex-none transform group-hover:translate-x-1 transition-transform" />
            </div>
          ))
        )}
      </div>
      
    </div>
  );
}

function StatCard({ label, num, icon, color }) {
  return (
    <div className="bg-white p-4 rounded-3xl border border-gray-50 shadow-sm flex flex-col items-center text-center">
      <div style={{ color: color, backgroundColor: `${color}15` }} className="p-2 rounded-xl mb-2">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className="text-2xl font-black text-gray-800 leading-none">{num}</span>
      <span className="text-[10px] font-bold text-gray-400 mt-2.5 uppercase tracking-tighter">{label}</span>
    </div>
  );
}