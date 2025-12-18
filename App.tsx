
import React, { useState, useEffect } from 'react';
import { Plus, EyeOff, ChevronUp, ChevronDown, Sun, Moon } from 'lucide-react';
import Pet from './components/Pet';
import SearchBar from './components/SearchBar';
import DoodleCard from './components/DoodleCard';
import AddLinkModal from './components/AddLinkModal';
import SettingsModal from './components/SettingsModal';
import GameCenterModal from './components/GameCenterModal';
import JumpModal from './components/JumpModal';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MeteorBackground from './components/MeteorBackground';
import VirtualCursor from './components/VirtualCursor';
import { NavLink, PetMood, Category, PetSkinId, GameId } from './types';
import { DEFAULT_LINKS } from './constants';
import { playSfx } from './utils/audio';
import { useLanguage } from './contexts/LanguageContext';
import { usePetSystem } from './hooks/usePetSystem';

const DATA_VERSION = '3.3';

const App: React.FC = () => {
  const { t } = useLanguage();
  
  const [links, setLinks] = useState<NavLink[]>(() => {
    const savedVersion = localStorage.getItem('doodle-data-version');
    const savedLinks = localStorage.getItem('doodle-links');
    if (savedVersion !== DATA_VERSION) return DEFAULT_LINKS;
    return savedLinks ? JSON.parse(savedLinks) : DEFAULT_LINKS;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<NavLink | null>(null);
  const [jumpLink, setJumpLink] = useState<NavLink | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('doodle-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [isGridVisible, setIsGridVisible] = useState(() => {
    const saved = localStorage.getItem('doodle-grid-visible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isCursorEnabled, setIsCursorEnabled] = useState(() => {
    const saved = localStorage.getItem('doodle-cursor-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [petMood, setPetMood] = useState<PetMood>(PetMood.IDLE);
  const [activeCategory, setActiveCategory] = useState<Category>('ALL');
  const [isHeaderGlitching, setIsHeaderGlitching] = useState(false);

  const [currentPetId, setCurrentPetId] = useState<PetSkinId>(() => {
    const saved = localStorage.getItem('doodle-pet-skin');
    return (saved as PetSkinId) || 'girl-white';
  });

  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); 

  const [isPetVisible, setIsPetVisible] = useState(() => {
    const saved = localStorage.getItem('doodle-pet-visible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const { stats, feed, play, heal } = usePetSystem(setPetMood);

  const [petScale, setPetScale] = useState<number>(() => {
    const saved = localStorage.getItem('doodle-pet-scale');
    return saved ? parseFloat(saved) : 0.4;
  });

  const [meteorSpeed, setMeteorSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('doodle-meteor-speed');
    return saved ? parseFloat(saved) : 1.0;
  });

  const [isImmersive, setIsImmersive] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('doodle-data-version', DATA_VERSION);
    localStorage.setItem('doodle-links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('doodle-pet-scale', petScale.toString());
  }, [petScale]);

  useEffect(() => {
    localStorage.setItem('doodle-meteor-speed', meteorSpeed.toString());
  }, [meteorSpeed]);

  useEffect(() => {
    localStorage.setItem('doodle-pet-visible', JSON.stringify(isPetVisible));
  }, [isPetVisible]);

  useEffect(() => {
    localStorage.setItem('doodle-sidebar-collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('doodle-grid-visible', JSON.stringify(isGridVisible));
  }, [isGridVisible]);

  useEffect(() => {
    localStorage.setItem('doodle-pet-skin', currentPetId);
  }, [currentPetId]);

  useEffect(() => {
    localStorage.setItem('doodle-cursor-enabled', JSON.stringify(isCursorEnabled));
    if (isCursorEnabled) {
      document.body.classList.add('custom-cursor-active');
    } else {
      document.body.classList.remove('custom-cursor-active');
    }
  }, [isCursorEnabled]);

  useEffect(() => {
    setIsHeaderGlitching(true);
    const timer = setTimeout(() => setIsHeaderGlitching(false), 300);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  const handleSaveLink = (linkData: Omit<NavLink, 'id'>) => {
    playSfx('success');
    if (editingLink) {
        setLinks(prev => prev.map(l => l.id === editingLink.id ? { ...linkData, id: l.id } : l));
    } else {
        const link: NavLink = { ...linkData, id: Date.now().toString() };
        setLinks([...links, link]);
    }
    setPetMood(PetMood.HAPPY);
    setEditingLink(null);
  };

  const handleDeleteLink = (id: string) => {
    playSfx('delete');
    setLinks(links.filter(l => l.id !== id));
    setPetMood(PetMood.SURPRISED);
  };

  const handleEditLink = (link: NavLink) => {
      playSfx('scribble');
      setEditingLink(link);
      setIsModalOpen(true);
  };

  const handleToggleFavorite = (id: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, isFavorite: !l.isFavorite } : l));
  };

  const openNewLinkModal = () => {
      playSfx('scribble');
      setEditingLink(null);
      setIsModalOpen(true);
  };

  const handleJumpRequest = (link: NavLink) => {
      setJumpLink(link);
  };

  const handleJumpConfirm = () => {
      if (jumpLink) {
          window.open(jumpLink.url, '_blank');
          setJumpLink(null);
      }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
      setDraggedId(id);
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
      setDraggedId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
      e.preventDefault();
      const sourceId = e.dataTransfer.getData('text/plain');
      if (!sourceId || sourceId === targetId) { setDraggedId(null); return; }
      const sourceIndex = links.findIndex(l => l.id === sourceId);
      const targetIndex = links.findIndex(l => l.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) { setDraggedId(null); return; }
      const newLinks = [...links];
      const [movedItem] = newLinks.splice(sourceIndex, 1);
      newLinks.splice(targetIndex, 0, movedItem);
      setLinks(newLinks);
      playSfx('pop');
      setDraggedId(null);
      setHoveredId(null);
  };

  const filteredLinks = links.filter(link => {
    const matchesCategory = 
      activeCategory === 'ALL' || 
      (activeCategory === 'COLLECTION' ? link.isFavorite : link.category === activeCategory);
    
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-screen w-screen flex flex-col font-anime text-gray-800 bg-transparent overflow-hidden relative">
      {isCursorEnabled && <VirtualCursor petSkin={currentPetId} />}

      <MeteorBackground darkMode={isNightMode} speedMultiplier={meteorSpeed} />

      <div className={`flex flex-col h-full w-full z-10 transition-all duration-500 ease-in-out ${isImmersive ? 'opacity-0 scale-105 pointer-events-none blur-sm' : 'opacity-100 scale-100'}`}>
        <Header 
          onOpenSettings={() => { setIsSettingsOpen(true); playSfx('open'); }} 
          onToggleMenu={() => { setIsMobileMenuOpen(true); playSfx('scribble'); }}
          onToggleImmersive={() => { setIsImmersive(true); setIsNightMode(false); playSfx('pop'); }}
        />

        <div className="flex flex-1 overflow-hidden relative w-full">
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-[45] md:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          <div className={`
              fixed inset-y-0 left-0 z-50 h-full bg-white transition-all duration-300 ease-out border-r-2 border-black
              md:relative md:translate-x-0 md:z-30 md:border-none
              ${isSidebarCollapsed ? 'md:w-16 lg:w-20' : 'md:w-48 lg:w-60'}
              ${isMobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'}
          `}>
            <Sidebar 
              activeCategory={activeCategory} 
              onSelectCategory={(c) => { setActiveCategory(c); playSfx('click'); setIsMobileMenuOpen(false); }}
              currentPetId={currentPetId}
              onSelectPet={(id) => { setCurrentPetId(id); playSfx('pop'); }}
              onOpenGame={(id) => { setActiveGameId(id); playSfx('open'); setIsMobileMenuOpen(false); }}
              onClose={() => setIsMobileMenuOpen(false)}
              isPetVisible={isPetVisible}
              onTogglePetVisibility={() => { setIsPetVisible(!isPetVisible); playSfx('click'); }}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => { setIsSidebarCollapsed(!isSidebarCollapsed); playSfx('click'); }}
            />
          </div>

          <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth w-full scrollbar-hide">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-20 pb-40">
              <div className="mt-8 md:mt-12 mb-8 md:mb-12 flex justify-center w-full">
                  <SearchBar onSearchChange={setSearchQuery} />
              </div>

              <div className="mb-8 flex flex-col items-center justify-center w-full relative">
                  <div 
                    className="relative mb-3 group cursor-pointer select-none"
                    onClick={() => {
                        setIsHeaderGlitching(true);
                        playSfx('delete');
                        setTimeout(() => setIsHeaderGlitching(false), 300);
                    }}
                  >
                      <h2 
                        className={`
                          text-4xl md:text-6xl font-pixel font-bold text-black tracking-widest leading-relaxed relative z-10 transform -skew-x-6 px-4
                          transition-all duration-75
                          ${isHeaderGlitching ? 'animate-cyber-glitch-text' : ''}
                        `} 
                        style={{ textShadow: isHeaderGlitching ? 'none' : '4px 4px 0 #CCFF00' }}
                      >
                        {activeCategory === 'ALL' ? t('app.dashboard') : t(`category.${activeCategory}`)}
                      </h2>
                      <span className={`
                          absolute -bottom-4 -right-8 bg-black text-white text-xs md:text-sm px-2 py-0.5 font-bold font-pixel transform -rotate-3 z-20 shadow-[2px_2px_0_#CCFF00]
                          transition-opacity duration-100
                          ${isHeaderGlitching ? 'opacity-0' : 'opacity-100'}
                      `}>
                          {activeCategory === 'ALL' ? 'ダッシュボード' : activeCategory === 'COLLECTION' ? 'お気に入り' : 'カテゴリー'}
                      </span>
                      {/* 背景透明化 */}
                      <div className={`
                          absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-4 bg-transparent -z-0 -rotate-2
                          transition-opacity duration-100
                          ${isHeaderGlitching ? 'opacity-0' : 'opacity-100'}
                      `}></div>
                  </div>
                  
                  <div className={`flex items-center gap-3 mt-4 transition-opacity duration-100 ${isHeaderGlitching ? 'opacity-0' : 'opacity-100'}`}>
                      {/* // SYSTEM 标签背景透明化 */}
                      <span className="text-xs md:text-sm font-pixel font-bold text-black uppercase bg-transparent px-3 py-1 border-2 border-black shadow-[3px_3px_0_#000]">
                        // SYSTEM: {activeCategory}
                      </span>
                      <div className="w-8 h-[2px] bg-black"></div>
                      {/* DATA 标签背景透明化 */}
                      <span className="text-xs md:text-sm font-pixel font-bold text-black bg-transparent px-3 py-1 border-2 border-black shadow-[3px_3px_0_#000] transform skew-x-12">
                          DATA: {filteredLinks.length}
                      </span>
                  </div>
              </div>

              <div className="w-full flex items-center justify-center mb-8 relative z-20">
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black opacity-10 pointer-events-none"></div>
                  <button
                      onClick={() => { setIsGridVisible(!isGridVisible); playSfx(isGridVisible ? 'pop' : 'success'); }}
                      className="
                          relative z-10
                          bg-transparent border-[3px] border-black px-6 py-2 rounded-full
                          flex items-center gap-2
                          hover:bg-black hover:text-white
                          shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000] hover:-translate-y-0.5
                          transition-all active:scale-95 active:shadow-none
                          group
                      "
                  >
                      {isGridVisible ? (
                           <>
                              <span className="font-anime font-black tracking-widest text-sm group-hover:tracking-[0.2em] transition-all">COLLAPSE</span>
                              <ChevronUp size={20} strokeWidth={4} />
                           </>
                      ) : (
                           <>
                              <span className="font-anime font-black tracking-widest text-sm group-hover:tracking-[0.2em] transition-all">EXPAND</span>
                              <ChevronDown size={20} strokeWidth={4} />
                           </>
                      )}
                  </button>
              </div>

              {/* Enhanced Link Grid Container with Unfold Animation */}
              <div className={`
                 grid transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden
                 ${isGridVisible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
              `}>
                  <div className={`
                    min-h-0 transition-all duration-500 origin-top
                    ${isGridVisible ? 'animate-cloth-unfold' : 'animate-cloth-fold pointer-events-none'}
                  `}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 pt-2">
                          {filteredLinks.map((link, index) => (
                            <DoodleCard 
                              key={link.id} 
                              link={link} 
                              onDelete={handleDeleteLink}
                              onEdit={handleEditLink}
                              onToggleFavorite={handleToggleFavorite}
                              index={index}
                              isHovered={hoveredId === link.id}
                              isDimmed={hoveredId !== null && hoveredId !== link.id}
                              onMouseEnter={() => !draggedId && setHoveredId(link.id)}
                              onMouseLeave={() => !draggedId && setHoveredId(null)}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, link.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, link.id)}
                              onDragEnd={handleDragEnd}
                              isDragging={draggedId === link.id}
                              onJump={handleJumpRequest}
                            />
                          ))}
                          <button 
                            onClick={openNewLinkModal}
                            onMouseEnter={() => setHoveredId('add-btn')}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`
                              min-h-[200px] h-full rough-border border-dashed border-4 border-gray-300 
                              bg-transparent hover:bg-white/10 hover:border-black hover:border-solid
                              flex flex-col items-center justify-center 
                              text-gray-400 hover:text-jinx-pink transition-all duration-300 transform
                              group shadow-none hover:shadow-sketch active:scale-95
                              ${hoveredId === 'add-btn' ? 'scale-105 z-20 shadow-sketch opacity-100 rotate-1' : ''}
                              ${hoveredId !== null && hoveredId !== 'add-btn' ? 'scale-90 opacity-50 blur-[1px]' : ''}
                            `}
                          >
                            <div className="bg-white/10 p-4 rounded-full group-hover:bg-neon-green group-hover:text-black transition-colors mb-3 border-2 border-transparent group-hover:border-black group-hover:rotate-12 group-hover:shadow-[3px_3px_0_#000]">
                                <Plus size={32} strokeWidth={4} className="group-hover:rotate-90 transition-transform duration-300" />
                            </div>
                            <span className="text-2xl font-black group-hover:tracking-widest transition-all">NEW ENTRY</span>
                          </button>
                        </div>
                    </div>
                </div>
            </div>
          </main>
        </div>
      </div>

      {isImmersive && (
        <div className="fixed bottom-12 right-12 z-[100] flex flex-col gap-4 items-end animate-pop">
           <button 
             onClick={() => { setIsNightMode(!isNightMode); playSfx('click'); }}
             className={`
               group flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)]
               ${isNightMode 
                  ? 'bg-gray-800 border-gray-600 text-yellow-400 hover:bg-black hover:border-yellow-400' 
                  : 'bg-white border-black text-orange-500 hover:bg-orange-100 hover:border-orange-500'
               }
             `}
             title={isNightMode ? "Switch to Day" : "Switch to Night"}
           >
              {isNightMode ? <Moon size={24} /> : <Sun size={24} />}
           </button>
           <button 
             onClick={() => { setIsImmersive(false); setIsNightMode(false); playSfx('pop'); }}
             className="group flex items-center gap-2 bg-black/80 backdrop-blur text-white px-6 py-4 rounded-full border-2 border-white/20 hover:bg-black hover:scale-105 hover:border-neon-green transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer"
           >
              <EyeOff size={24} className="group-hover:text-neon-green transition-colors" />
              <span className="font-anime text-lg font-bold tracking-widest group-hover:text-neon-green">EXIT VIEW</span>
           </button>
        </div>
      )}

      {isPetVisible && !isImmersive && (
        <Pet 
          mood={petMood} 
          setMood={setPetMood} 
          skinId={currentPetId} 
          scale={petScale} 
          stats={stats}
          onFeed={feed}
          onPlay={play}
          onHeal={heal}
        />
      )}

      <AddLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveLink} linkToEdit={editingLink} />
      <JumpModal link={jumpLink} onClose={() => setJumpLink(null)} onConfirm={handleJumpConfirm} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        links={links} 
        onImport={(l) => { setLinks(l); playSfx('success'); }}
        onReset={() => { setLinks(DEFAULT_LINKS); playSfx('delete'); }}
        petScale={petScale}
        onScaleChange={setPetScale}
        meteorSpeed={meteorSpeed}
        onMeteorSpeedChange={setMeteorSpeed}
        isCursorEnabled={isCursorEnabled}
        onToggleCursor={() => setIsCursorEnabled(!isCursorEnabled)}
      />
      <GameCenterModal gameId={activeGameId} onClose={() => setActiveGameId(null)} />
    </div>
  );
};

export default App;
