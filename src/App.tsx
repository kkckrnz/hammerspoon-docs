import React, { useState } from "react";
import { ALPHABETICAL_MODULES, DocModule } from "./data/hammerspoonData";
import { Sidebar } from "./components/Sidebar";
import { DocContent } from "./components/DocContent";

export default function App() {
    const [selectedModuleId, setSelectedModuleId] = useState<string>(
        () => ALPHABETICAL_MODULES[0]?.id || "hs",
    );
    const [targetItemId, setTargetItemId] = useState<string | null>(null);

    const currentModule: DocModule =
        ALPHABETICAL_MODULES.find((m) => m.id === selectedModuleId) || ALPHABETICAL_MODULES[0];

    const handleSelectModule = (moduleId: string, itemId?: string) => {
        setSelectedModuleId(moduleId);
        setTargetItemId(itemId || null);
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-900 font-sans antialiased">
            {/* Permanent, Always-Open Alphabetical Sidebar */}
            <Sidebar selectedModuleId={selectedModuleId} onSelectModule={handleSelectModule} />

            {/* Main Documentation Scrollable Viewport */}
            <main className="flex-1 h-screen overflow-hidden flex flex-col bg-white">
                <DocContent module={currentModule} targetItemId={targetItemId} />
            </main>
        </div>
    );
}
