import officialDocsData from './officialDocs.json';

export type ItemType = 'Variable' | 'Function' | 'Constructor' | 'Method';

export interface DocParameter {
  name: string;
  type?: string;
  description: string;
  optional?: boolean;
}

export interface DocItem {
  id: string;
  name: string;
  fullName: string;
  type: ItemType;
  signature: string;
  description: string;
  parameters?: string | string[] | DocParameter[];
  returns?: string;
  notes?: string[];
  source?: string;
}

export interface DocModule {
  id: string;
  name: string;
  summary: string;
  description: string;
  items: DocItem[];
}

export const TYPE_ORDER: Record<ItemType, number> = {
  Variable: 1,
  Function: 2,
  Constructor: 3,
  Method: 4,
};

export const TYPE_SECTION_HEADERS: Record<ItemType, { title: string; subtitle: string }> = {
  Variable: {
    title: 'Variables',
    subtitle: 'Configurable values',
  },
  Function: {
    title: 'Functions',
    subtitle: 'API calls offered directly by the extension',
  },
  Constructor: {
    title: 'Constructors',
    subtitle: 'API calls which return an object, typically one that offers API methods',
  },
  Method: {
    title: 'Methods',
    subtitle: 'API calls which can only be made on an object returned by a constructor',
  },
};

// Assemble full list of all official modules with 100% complete items
export const MODULES: DocModule[] = (officialDocsData as DocModule[]).map((mod) => ({
  id: mod.id || mod.name,
  name: mod.name,
  summary: mod.summary || '',
  description: mod.description || '',
  items: mod.items || [],
}));

// Helper to sort items according to official Hammerspoon order:
// 1. Variables
// 2. Functions
// 3. Constructors
// 4. Methods
// Within each group, sorted alphabetically by name.
export function sortModuleItems(items: DocItem[]): DocItem[] {
  return [...items].sort((a, b) => {
    const orderA = TYPE_ORDER[a.type] || 99;
    const orderB = TYPE_ORDER[b.type] || 99;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.name.localeCompare(b.name);
  });
}

// Group module items into { Variables, Functions, Constructors, Methods }
export function groupModuleItemsByType(items: DocItem[]): {
  type: ItemType;
  title: string;
  subtitle: string;
  items: DocItem[];
}[] {
  const sorted = sortModuleItems(items);
  const types: ItemType[] = ['Variable', 'Function', 'Constructor', 'Method'];
  const groups = [];

  for (const t of types) {
    const matched = sorted.filter((it) => it.type === t);
    if (matched.length > 0) {
      groups.push({
        type: t,
        title: TYPE_SECTION_HEADERS[t].title,
        subtitle: TYPE_SECTION_HEADERS[t].subtitle,
        items: matched,
      });
    }
  }

  return groups;
}

export const ALPHABETICAL_MODULES = [...MODULES].sort((a, b) => a.name.localeCompare(b.name));
