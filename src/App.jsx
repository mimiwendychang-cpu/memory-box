import React, { useState, useEffect } from 'react';
import { Home, Globe, User, Leaf, Plus, BookOpen } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
// 🌟 這裡補上了 doc, updateDoc, deleteDoc 的載入
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// 引入智慧大腦
import { AppProvider, useAppContext } from './AppContext';

import HomeView from './pages/HomeView';
import LibraryView from './pages/LibraryView';
import ProfileView from './pages/ProfileView';
import AddView from './pages/AddView';
import CommunityView from './pages/CommunityView';

const firebaseConfig = {
  apiKey: "AIzaSyA-aUQMwjJBi9zlp2kj_lD9D6aImXzZPEY",
  authDomain: "memory-box-819ce.firebaseapp.com",
  projectId: "memory-box-819ce",
  storageBucket: "memory-box-819ce.firebasestorage.app",
  messagingSenderId: "483451322513",
  appId: "1:483451322513:web:f3a86d66e86027b15d3f30",
  measurementId: "G-H9RLPJBGXP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

function AppContent() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [addStep, setAddStep] = useState(1);
  const [memories, setMemories] = useState([]);

  // 🧠 從智慧大腦拿取全站設定
  const { activeTheme, highContrast } = useAppContext();
  const themeColor = activeTheme.mainColor;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "memories"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMemories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // 💾 雲端新增功能
  const handleSaveToCloud = async (newMemory) => {
    try {
      await addDoc(collection(db, "users", user.uid, "memories"), {
        ...newMemory,
        createdAt: serverTimestamp()
      });
      setActiveTab('library');
      setAddStep(1);
    } catch (error) {
      alert("儲存失敗！");
    }
  };

  // 🔄 🌟 新增：雲端修改功能
  const handleUpdateMemory = async (id, updatedData) => {
    try {
      const memoryRef = doc(db, "users", user.uid, "memories", id);
      await updateDoc(memoryRef, updatedData);
    } catch (error) {
      console.error("更新失敗:", error);
      alert("雲端更新失敗，請檢查網路狀態喔！");
    }
  };

  // 🗑️ 🌟 新增：雲端刪除功能
  const handleDeleteMemory = async (id) => {
    if (window.confirm("確定要永久刪除這段珍貴的回憶嗎？此動作將無法復原喔！")) {
      try {
        const memoryRef = doc(db, "users", user.uid, "memories", id);
        await deleteDoc(memoryRef);
      } catch (error) {
        console.error("刪除失敗:", error);
        alert("刪除失敗，請檢查網路狀態喔！");
      }
    }
  };

  if (!user) return <LoginScreen themeColor={themeColor} onLogin={() => signInWithPopup(auth, provider)} />;

  return (
    <div className={`min-h-screen bg-gray-100 flex justify-center md:items-center overflow-hidden transition-all duration-500 ${highContrast ? 'contrast-125' : ''}`}>
      <div className="w-full h-screen md:max-w-[420px] md:h-[90vh] bg-[#FDFCFB] md:rounded-[40px] shadow-2xl flex flex-col relative md:border-[8px] border-white overflow-hidden">
        
        <header className="flex-none bg-white px-6 py-5 flex items-center justify-between border-b border-gray-100 z-30">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: themeColor }} className="p-2 rounded-xl text-white shadow-lg transition-colors duration-500">
              <Leaf size={20} />
            </div>
            <div>
              <span className="font-black text-gray-800 text-xl tracking-tight block">數位防潮箱</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Memory Safe</span>
            </div>
          </div>
          <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-md" referrerPolicy="no-referrer" />
        </header>

        <main className="flex-1 overflow-y-auto pb-32">
          {/* 🌟 修正點：將 themeColor 正確傳入 HomeView */}
          {activeTab === 'home' && <HomeView setTab={setActiveTab} themeColor={themeColor} memories={memories} user={user} />}
          
          {/* 🌟 修正與升級點：傳入正確變數、對接更新與刪除函數 */}
          {activeTab === 'library' && (
            <LibraryView 
              memories={memories} 
              onAddNew={() => {
                setActiveTab('add');
                setAddStep(1);
              }} 
              onUpdate={handleUpdateMemory}
              onDelete={handleDeleteMemory}
            />
          )}
          
          {activeTab === 'add' && <AddView step={addStep} setStep={setAddStep} onFinish={handleSaveToCloud} />}
          {activeTab === 'community' && <CommunityView themeColor={themeColor} user={user} />}
          {activeTab === 'profile' && <ProfileView auth={auth} />}
        </main>

        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-3 py-3 flex justify-around items-center shadow-2xl z-40">
          <NavIcon icon={<Home size={24} />} label="首頁" active={activeTab === 'home'} onClick={() => setActiveTab('home')} themeColor={themeColor} />
          <NavIcon icon={<BookOpen size={24} />} label="記憶庫" active={activeTab === 'library'} onClick={() => setActiveTab('library')} themeColor={themeColor} />
          
          <div onClick={() => {setActiveTab('add'); setAddStep(1);}} className="flex flex-col items-center -mt-8 cursor-pointer group">
            <div style={{ backgroundColor: themeColor }} className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white group-active:scale-90 transition-all duration-500">
              <Plus size={32} />
            </div>
            <span style={{ color: themeColor }} className="text-[10px] font-black mt-1 transition-colors duration-500">新增回憶</span>
          </div>

          <NavIcon icon={<Globe size={24} />} label="廣場" active={activeTab === 'community'} onClick={() => setActiveTab('community')} themeColor={themeColor} />
          <NavIcon icon={<User size={24} />} label="帳號" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} themeColor={themeColor} />
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
// 🚨 把這段完整的貼在 App.jsx 的最底下！

function LoginScreen({ themeColor, onLogin }) {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-8 text-center">
      <div style={{ backgroundColor: themeColor }} className="p-6 rounded-[40px] mb-8 shadow-2xl text-white animate-bounce">
        <Leaf size={64} />
      </div>
      <h1 className="text-4xl font-black text-gray-800 mb-3">數位防潮箱</h1>
      <p className="text-gray-400 font-medium mb-12 max-w-[240px]">讓斷捨離不再是失去，而是將回憶轉化為力量</p>
      <button onClick={onLogin} className="w-full max-w-xs bg-white border-2 border-gray-100 py-4 rounded-3xl shadow-sm flex items-center justify-center gap-4 font-black text-gray-700 hover:bg-gray-50 active:scale-95 transition-all">
        <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="google" />
        使用 Google 登入
      </button>
    </div>
  );
}

function NavIcon({ icon, label, active, onClick, themeColor }) {
  return (
    <div onClick={onClick} style={{ color: active ? themeColor : '#9CA3AF' }} className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${active ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}>
      <div style={active ? { backgroundColor: `${themeColor}15` } : {}} className="p-2 rounded-2xl transition-colors">{icon}</div>
      <span className="text-[9px] font-black">{label}</span>
    </div>
  );
}