import React, { useRef, useEffect, useState } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { marked } from 'marked';
import { 
  DocModule, 
  DocItem, 
  groupModuleItemsByType 
} from '../data/hammerspoonData';

// Configure marked for clean GFM parsing
marked.setOptions({
  gfm: true,
  breaks: false,
});

interface DocContentProps {
  module: DocModule;
  targetItemId?: string | null;
}

function getGitHubSourceUrl(source: string): string {
  const match = source.match(/^(.*?)\s+line\s+(\d+)$/i);
  if (match) {
    const file = match[1].trim();
    const line = match[2].trim();
    return `https://github.com/Hammerspoon/hammerspoon/blob/master/${file}#L${line}`;
  }
  return `https://github.com/Hammerspoon/hammerspoon/blob/master/${source}`;
}

function renderMarkdownHtml(content: string, moduleId?: string): string {
  if (!content) return '';
  let html = marked.parse(content) as string;
  // If there are relative anchor links like href="#fileListForPath", map them to href="#hs.fs-fileListForPath"
  if (moduleId) {
    html = html.replace(/href="#([a-zA-Z0-9_]+)"/g, `href="#${moduleId}-$1"`);
  }
  return html;
}

function formatParametersHtml(parameters: DocItem['parameters'], moduleId: string): string | null {
  if (!parameters) return null;

  if (typeof parameters === 'string') {
    const trimmed = parameters.trim();
    if (!trimmed || trimmed.toLowerCase() === 'none' || trimmed === '* None') {
      return null;
    }
    return renderMarkdownHtml(parameters, moduleId);
  }

  if (Array.isArray(parameters)) {
    if (parameters.length === 0) return null;
    if (parameters.length === 1 && typeof parameters[0] === 'string') {
      const trimmed = parameters[0].trim().replace(/^\s*[\*\-]\s*/, '');
      if (!trimmed || trimmed.toLowerCase() === 'none') {
        return null;
      }
    }

    const mdString = parameters.map((p) => {
      if (typeof p === 'string') {
        return p.replace(/^\s*[\*\-]\s*`?([a-zA-Z0-9_\[\]]+)`?\s*-\s*/, '* `$1` - ');
      }
      return `* \`${p.name}\`${p.type ? ` *(${p.type}${p.optional ? ', optional' : ''})*` : ''} - ${p.description}`;
    }).join('\n');

    return renderMarkdownHtml(mdString, moduleId);
  }

  return null;
}

function formatReturnsHtml(returns: string | undefined, moduleId: string): string | null {
  if (!returns) return null;
  const trimmed = returns.trim();
  if (!trimmed || trimmed.toLowerCase() === 'none') return null;
  return renderMarkdownHtml(returns, moduleId);
}

function formatNotesHtml(notes: string[] | undefined, moduleId: string): string | null {
  if (!notes || notes.length === 0) return null;
  const mdString = notes.join('\n');
  return renderMarkdownHtml(mdString, moduleId);
}

export const DocContent: React.FC<DocContentProps> = ({
  module,
  targetItemId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Group items by official order: Variables -> Functions -> Constructors -> Methods
  const groupedSections = groupModuleItemsByType(module.items);

  // Scroll to targeted method if passed
  useEffect(() => {
    if (targetItemId) {
      const el = document.getElementById(targetItemId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      containerRef.current?.scrollTo({ top: 0 });
    }
  }, [targetItemId, module.id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsNavOpen(false);
      }
    };
    if (isNavOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNavOpen]);

  const scrollToItem = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsNavOpen(false);
  };

  // Intercept anchor clicks within rendered markdown
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('a');
    if (!target) return;
    const href = target.getAttribute('href');
    if (href && href.startsWith('#')) {
      const targetId = href.slice(1);
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContentClick}
      className="flex-1 h-screen overflow-y-auto bg-white text-slate-900 scroll-smooth relative"
    >
      {/* Sticky Single Navigation Box (Pinned at top as user scrolls, strictly aligned h-12) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 sm:px-12 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 truncate">
          <span className="font-mono font-bold text-sm text-slate-900 truncate">{module.name}</span>
        </div>

        {/* The Clickable Navigation Box */}
        {module.items.length > 0 && (
          <div ref={dropdownRef} className="relative shrink-0">
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="px-3 py-1.5 text-xs font-mono font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <span>Jump to...</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isNavOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu ordered by: Variables -> Functions -> Constructors -> Methods */}
            {isNavOpen && (
              <div className="absolute right-0 mt-1.5 w-72 sm:w-88 max-h-[min(800px,calc(100vh-4rem))] overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg py-2 z-40 divide-y divide-slate-100">
                {groupedSections.map((group) => (
                  <div key={group.type} className="py-1">
                    <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      {group.title}
                    </div>
                    {group.items.map((it) => (
                      <button
                        key={it.id}
                        onClick={() => scrollToItem(it.id)}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-mono hover:bg-slate-100 flex items-center justify-between text-slate-800 transition-colors cursor-pointer group"
                      >
                        <span className="font-semibold group-hover:text-blue-700 truncate mr-2">
                          {it.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">
                          {it.type}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-8 space-y-10">
        {/* Module Header */}
        <header className="space-y-4 pb-6 border-b border-slate-200">
          <h1 className="text-3xl sm:text-[32px] font-mono font-bold text-slate-900 tracking-tight">
            {module.name}
          </h1>

          <div
            className="markdown-body text-[15px] sm:text-base text-slate-700 leading-relaxed font-normal break-words [overflow-wrap:anywhere] min-w-0"
            dangerouslySetInnerHTML={{
              __html: renderMarkdownHtml(module.description || module.summary, module.id),
            }}
          />

          {/* Official API Overview Section */}
          {groupedSections.length > 0 && (
            <div className="pt-4 space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                API Overview
              </h2>

              <div className="space-y-4 font-sans text-xs">
                {groupedSections.map((group) => (
                  <div key={group.type} className="space-y-1.5">
                    <div className="text-[13px] sm:text-sm font-bold text-slate-900">
                      <span>{group.title}</span>
                      <span className="text-slate-500 font-normal ml-1.5">— {group.subtitle}</span>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] font-mono pl-1">
                      {group.items.map((it) => (
                        <a
                          key={it.id}
                          href={`#${it.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToItem(it.id);
                          }}
                          className="text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          {it.name}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* List of Module Items in Official Order: Variables -> Functions -> Constructors -> Methods */}
        <div className="space-y-14 pb-20">
          {groupedSections.map((group) => (
            <div key={group.type} className="space-y-6">
              {/* Group Section Header */}
              <div className="border-b border-slate-300 pb-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {group.title}
                </h2>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  {group.subtitle}
                </p>
              </div>

              {/* Items within this section */}
              <div className="space-y-8">
                {group.items.map((item) => {
                  const paramsHtml = formatParametersHtml(item.parameters, module.id);
                  const returnsHtml = formatReturnsHtml(item.returns, module.id);
                  const notesHtml = formatNotesHtml(item.notes, module.id);

                  return (
                    <article
                      key={item.id}
                      id={item.id}
                      className="scroll-mt-16 border border-slate-200 rounded overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
                    >
                      {/* Method Title Bar */}
                      <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2">
                        <h3 className="font-mono text-[15px] font-bold text-slate-900 break-words min-w-0">
                          {item.name}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider shrink-0">
                          {item.type}
                        </span>
                      </div>

                      {/* Specification Table with table-fixed and horizontal scroll wrapper */}
                      <div className="w-full overflow-x-auto">
                        <table className="w-full table-fixed text-[13.5px] sm:text-sm text-left border-collapse">
                          <tbody className="divide-y divide-slate-200">
                            {/* Signature */}
                            <tr>
                              <th className="w-24 sm:w-28 px-4 py-2.5 font-medium text-slate-500 bg-slate-50/70 align-top whitespace-nowrap text-xs sm:text-[13px] shrink-0">
                                Signature
                              </th>
                              <td className="px-4 py-2.5 font-mono text-slate-900 font-semibold break-words [overflow-wrap:anywhere] min-w-0 text-[13.5px] sm:text-sm">
                                {item.signature}
                              </td>
                            </tr>

                            {/* Type */}
                            <tr>
                              <th className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/70 align-top whitespace-nowrap text-xs sm:text-[13px] shrink-0">
                                Type
                              </th>
                              <td className="px-4 py-2.5 font-mono text-slate-800 text-[13px] sm:text-[13.5px] break-words [overflow-wrap:anywhere] min-w-0">
                                {item.type}
                              </td>
                            </tr>

                            {/* Description */}
                            <tr>
                              <th className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/70 align-top whitespace-nowrap text-xs sm:text-[13px] shrink-0">
                                Description
                              </th>
                              <td className="px-4 py-2.5 text-slate-800 font-sans text-[13.5px] sm:text-sm break-words [overflow-wrap:anywhere] min-w-0">
                                <div
                                  className="markdown-body leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: renderMarkdownHtml(item.description, module.id),
                                  }}
                                />
                              </td>
                            </tr>

                            {/* Parameters */}
                            <tr>
                              <th className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/70 align-top whitespace-nowrap text-xs sm:text-[13px] shrink-0">
                                Parameters
                              </th>
                              <td className="px-4 py-2.5 text-slate-800 font-sans text-[13.5px] sm:text-sm break-words [overflow-wrap:anywhere] min-w-0">
                                {paramsHtml ? (
                                  <div
                                    className="markdown-body leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: paramsHtml }}
                                  />
                                ) : (
                                  <span className="text-slate-500">None</span>
                                )}
                              </td>
                            </tr>

                            {/* Returns */}
                            {returnsHtml && (
                              <tr>
                                <th className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/70 align-top whitespace-nowrap text-xs sm:text-[13px] shrink-0">
                                  Returns
                                </th>
                                <td className="px-4 py-2.5 text-slate-800 font-sans text-[13.5px] sm:text-sm break-words [overflow-wrap:anywhere] min-w-0">
                                  <div
                                    className="markdown-body leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: returnsHtml }}
                                  />
                                </td>
                              </tr>
                            )}

                            {/* Notes */}
                            {notesHtml && (
                              <tr>
                                <th className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/70 align-top whitespace-nowrap text-xs sm:text-[13px] shrink-0">
                                  Notes
                                </th>
                                <td className="px-4 py-2.5 text-slate-800 font-sans text-[13.5px] sm:text-sm break-words [overflow-wrap:anywhere] min-w-0">
                                  <div
                                    className="markdown-body leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: notesHtml }}
                                  />
                                </td>
                              </tr>
                            )}

                            {/* Source (Opens GitHub source in new tab) */}
                            {item.source && (
                              <tr>
                                <th className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50/70 align-top whitespace-nowrap text-xs sm:text-[13px] shrink-0">
                                  Source
                                </th>
                                <td className="px-4 py-2.5 font-mono text-xs sm:text-[13px] break-words [overflow-wrap:anywhere] min-w-0">
                                  <a
                                    href={getGitHubSourceUrl(item.source)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1.5"
                                    title="Open source code on GitHub"
                                  >
                                    <span>{item.source}</span>
                                    <ExternalLink className="w-3 h-3 text-blue-500 shrink-0" />
                                  </a>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
