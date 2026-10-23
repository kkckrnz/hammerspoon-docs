import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { ALPHABETICAL_MODULES, DocModule, DocItem } from '../data/hammerspoonData';

interface SidebarProps {
  selectedModuleId: string;
  onSelectModule: (moduleId: string, targetItemId?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedModuleId,
  onSelectModule,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hammerspoon_sidebar_width');
      return saved ? Math.max(200, Math.min(650, parseInt(saved, 10))) : 280;
    } catch {
      return 280;
    }
  });
  const [isResizing, setIsResizing] = useState(false);

  // Global keyboard shortcut: Cmd+/ (or Ctrl+/) to quickly focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === '/' || e.code === 'Slash')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Resize handler
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const maxWidth = Math.min(window.innerWidth * 0.6, 650);
      const newWidth = Math.max(200, Math.min(maxWidth, e.clientX));
      setWidth(newWidth);
      try {
        localStorage.setItem('hammerspoon_sidebar_width', newWidth.toString());
      } catch {
        // Ignore localStorage restrictions
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Search results across both modules and methods
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    const matchedModules: DocModule[] = [];
    const matchedItems: { module: DocModule; item: DocItem }[] = [];

    ALPHABETICAL_MODULES.forEach((mod) => {
      const modMatch = mod.name.toLowerCase().includes(q) || mod.summary.toLowerCase().includes(q);
      if (modMatch) {
        matchedModules.push(mod);
      }

      mod.items.forEach((item) => {
        if (
          item.name.toLowerCase().includes(q) ||
          item.fullName.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.signature.toLowerCase().includes(q)
        ) {
          matchedItems.push({ module: mod, item });
        }
      });
    });

    return { matchedModules, matchedItems };
  }, [searchQuery]);

  return (
    <aside
      style={{ width: `${width}px` }}
      className="relative h-screen bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 select-none group"
    >
      {/* Search Input Header - Perfectly aligned to h-12 with main top bar */}
      <div className="h-12 px-3 border-b border-slate-200 bg-white shrink-0 flex items-center">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search API"
            className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-12 py-1 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-slate-400 font-sans h-7.5"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd
                title="Press ⌘/ or Ctrl+/ to search"
                className="hidden sm:inline-flex items-center px-1 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded select-none pointer-events-none"
              >
                ⌘/
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Main Alphabetical Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {searchResults ? (
          <div className="space-y-4 py-1">
            {/* Matching Modules First */}
            {searchResults.matchedModules.length > 0 && (
              <div className="space-y-0.5">
                <div className="text-[11px] font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider">
                  Modules ({searchResults.matchedModules.length})
                </div>
                {searchResults.matchedModules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => onSelectModule(mod.id)}
                    title={mod.name}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-200/70 transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-xs font-bold text-slate-900 block truncate">
                      {mod.name}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {mod.summary}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Matching Methods & Functions Second */}
            {searchResults.matchedItems.length > 0 && (
              <div className="space-y-0.5">
                <div className="text-[11px] font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider">
                  Methods & Functions ({searchResults.matchedItems.length})
                </div>
                {searchResults.matchedItems.map(({ module, item }) => (
                  <button
                    key={`${module.id}-${item.id}`}
                    onClick={() => onSelectModule(module.id, item.id)}
                    title={`${module.name}.${item.name}`}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-200/70 transition-colors group/item cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-xs font-semibold text-slate-900 truncate">
                        {module.name}.{item.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {searchResults.matchedModules.length === 0 && searchResults.matchedItems.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching APIs found for "{searchQuery}".
              </div>
            )}
          </div>
        ) : (
          /* Clean Alphabetical Module List */
          ALPHABETICAL_MODULES.map((mod) => {
            const isSelected = selectedModuleId === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                title={mod.name}
                className={`w-full text-left px-3 py-1.5 rounded text-xs font-mono transition-colors block truncate ${
                  isSelected
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-800 hover:bg-slate-200/60'
                }`}
              >
                {mod.name}
              </button>
            );
          })
        )}
      </div>

      {/* Adjustable Resize Handle along the right border (clean, no visual hover distraction) */}
      <div
        onMouseDown={startResizing}
        onDoubleClick={() => setWidth(280)}
        title="Drag to resize sidebar (Double-click to reset)"
        className="absolute top-0 -right-1 w-2.5 h-full cursor-col-resize z-20"
      />
    </aside>
  );
};
