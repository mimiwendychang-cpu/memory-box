import React, { useState } from 'react';
import { 
  Edit2, BookOpen, Globe, CheckCircle2, Star, 
  User, Mail, Type, Palette, LogOut, Sun, 
  Circle, Check as CheckIcon, Lock
} from 'lucide-react';
import { useAppContext, themes } from '../AppContext'; 

export default function ProfileView({ auth }) {
  // 🧠 修正點 1：這裡把壞掉的 handleFontSizeChange 換成了正確的 setFontSize
  const { currentThemeId, setCurrentThemeId, activeTheme, fontSize, setFontSize, highContrast, setHighContrast } = useAppContext();
  const themeColor = activeTheme.mainColor;

  const currentUser = auth?.currentUser;
  const [userName, setUserName] = useState(currentUser?.displayName || '回憶收藏家');
  const [isEditingName, setIsEditingName] = useState(false);
  const [equippedBadge, setEquippedBadge] = useState({ icon: '🌱', name: '初心者' });

  const handleBadgeClick = (badge, isLocked) => {
    if (isLocked) {
      alert(`🔒 這個成就還沒解鎖喔！\n解鎖任務：${badge.desc}`);
    } else {
      setEquippedBadge({ icon: badge.icon, name: badge.name });
    }
  };

  return (
    <div className="p-4 pb-32 max-w-md mx-auto space-y-6 animate-in fade-in font-sans">
      
      {/* 👤 1. 個人資訊卡片 */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          {currentUser?.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt="avatar" 
              className="w-16 h-16 rounded-2xl border-2 object-cover shadow-sm"
              style={{ borderColor: themeColor }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl font-black text-2xl flex items-center justify-center shadow-inner" 
                 style={{ backgroundColor: activeTheme.lightBg, color: themeColor }}>
              {userName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full">
                  <input 
                    type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    className="font-bold text-gray-800 text-base border-b-2 outline-none w-full bg-transparent"
                    style={{ borderColor: themeColor }} autoFocus
                  />
                  <CheckIcon size={16} className="cursor-pointer" style={{ color: themeColor }} onClick={() => setIsEditingName(false)} />
                </div>
              ) : (
                <>
                  <h2 className="font-bold text-gray-800 text-base">{userName}</h2>
                  <Edit2 size={12} className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => setIsEditingName(true)} />
                </>
              )}
            </div>
            
            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md font-bold text-[10px] shadow-sm transition-all duration-300" 
                 style={{ backgroundColor: activeTheme.lightBg, color: themeColor }}>
              {equippedBadge.icon} {equippedBadge.name}
            </div>

            <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1.5">
              <Mail size={12} /> {currentUser?.email || 'unknown@gmail.com'}
            </div>
          </div>
        </div>
      </div>

      {/* 📊 2. 我的回憶統計 */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-700 ml-1">我的回憶統計</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <BookOpen size={18} style={{ color: themeColor }} />, count: 3, label: '記憶' },
            { icon: <Globe size={18} style={{ color: themeColor }} />, count: 0, label: '公開' },
            { icon: <CheckCircle2 size={18} style={{ color: themeColor }} />, count: 3, label: '已決策' },
            { icon: <Star size={18} style={{ color: themeColor }} />, count: 0, label: '收藏' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white py-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-1 transition-colors duration-300"
                 style={{ borderBottomWidth: '3px', borderBottomColor: activeTheme.lightBg }}>
              {stat.icon}
              <div className="font-black text-gray-800 mt-1">{stat.count}</div>
              <div className="text-[10px] text-gray-400 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 🏆 3. 積分與成就 */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-700 ml-1">積分與成就</h3>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-5">
          
          <div className="bg-gray-50/60 p-4 rounded-2xl flex justify-between items-center border border-gray-100">
            <div>
              <div className="text-xs font-bold text-gray-500">目前積分</div>
              <div className="text-2xl font-black mt-1 transition-colors duration-300" style={{ color: themeColor }}>60 <span className="text-sm text-gray-400 font-bold">分</span></div>
            </div>
            <Sun size={24} className="text-yellow-400" fill="currentColor" />
          </div>

          <div>
            <div className="text-xs font-bold text-gray-400 mb-3 tracking-wider">已解鎖成就 (點擊配戴稱號)</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'novice', icon: '🌱', name: '初心者', desc: '紀錄第一件物品', style: 'bg-green-50/60 border-green-100 text-green-700' },
                { id: 'story', icon: '📖', name: '說故事的人', desc: '累積 20 分', style: 'bg-blue-50/60 border-blue-100 text-blue-700' },
                { id: 'star', icon: '⭐', name: '尋找微光星', desc: '累積 50 分', style: 'bg-yellow-50/60 border-yellow-100 text-yellow-700' },
                { id: 'action', icon: '✅', name: '果斷行動家', desc: '第一次做出決策', style: 'bg-emerald-50/60 border-emerald-100 text-emerald-700' },
              ].map(badge => (
                <div key={badge.id} onClick={() => handleBadgeClick(badge, false)}
                     className={`border p-3 rounded-xl cursor-pointer transition-all active:scale-95 relative ${badge.style} ${equippedBadge.name === badge.name ? 'ring-2 ring-offset-1 ring-blue-400 shadow-sm' : 'hover:shadow-sm'}`}>
                  {equippedBadge.name === badge.name && <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-0.5"><CheckIcon size={10}/></div>}
                  <div className="text-base mb-0.5">{badge.icon}</div>
                  <div className="text-xs font-bold">{badge.name}</div>
                  <div className="text-[9px] opacity-70 mt-0.5 leading-tight">{badge.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-400 mb-3 tracking-wider">尚未解鎖 (點擊查看任務)</div>
            <div className="grid grid-cols-2 gap-2">
               {[
                { id: 'collector', icon: '📦', name: '回憶收藏家', desc: '紀錄 5 件物品' },
                { id: 'hall', icon: '🏛️', name: '故事殿堂', desc: '紀錄 10 件物品' },
              ].map(badge => (
                <div key={badge.id} onClick={() => handleBadgeClick(badge, true)}
                     className="bg-gray-50 border border-gray-100 p-3 rounded-xl opacity-60 cursor-pointer hover:opacity-90 active:scale-95 transition-all relative">
                  <Lock size={12} className="absolute top-2 right-2 text-gray-400"/>
                  <div className="text-base mb-0.5 grayscale">{badge.icon}</div>
                  <div className="text-xs font-bold text-gray-600">{badge.name}</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{badge.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🔠 4. 字體大小 */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1.5"><Type size={16}/> 字體大小</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'small', label: '小', px: '14' },
            { id: 'medium', label: '中', px: '16' },
            { id: 'large', label: '大', px: '19' },
            { id: 'xlarge', label: '特大', px: '22' },
          ].map(opt => (
            <button 
              key={opt.id} 
              // 🧠 修正點 2：直接呼叫大腦的 setFontSize，傳入真正的數字大小
              onClick={() => setFontSize(opt.px)}
              // 🧠 修正點 3：判斷現在是不是這個大小，加上漂亮的框線
              className={`py-3 rounded-2xl border-2 font-bold text-xs transition-all active:scale-95 bg-white ${fontSize === opt.px ? 'shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
              style={fontSize === opt.px ? { borderColor: themeColor, color: themeColor } : {}}>
              {opt.label} <span className="text-[10px] font-normal opacity-60">| {opt.px}px</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🎨 5. 主題配色 */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1.5"><Palette size={16}/> 主題配色</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {themes.map((theme, idx) => (
            <div key={theme.id} onClick={() => setCurrentThemeId(theme.id)} 
                 className={`flex items-center justify-between p-4 cursor-pointer transition-all active:bg-gray-50 ${idx !== themes.length - 1 ? 'border-b border-gray-50' : ''}`}
                 style={currentThemeId === theme.id ? { backgroundColor: theme.lightBg } : {}}>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full shadow-sm flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: theme.mainColor }}>
                  {theme.icon}
                </div>
                <span className="text-xs font-bold text-gray-700">{theme.name}</span>
              </div>
              {currentThemeId === theme.id && <CheckIcon size={16} style={{ color: themeColor }} />}
            </div>
          ))}
        </div>
      </div>

      {/* 🚪 6. 登出按鈕 */}
      <button onClick={() => auth.signOut()} 
              className="w-full py-3.5 rounded-2xl border-2 bg-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50/50 transition-all active:scale-95 mt-6 shadow-sm border-red-100 text-red-500">
        <LogOut size={16} /> 登出帳號
      </button>

    </div>
  );
}