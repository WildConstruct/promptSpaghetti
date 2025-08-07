import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DelightfulIntegration, useDelightfulLoading } from '../delightful';
import { Epic1GraphEditor } from '../Epic1GraphEditor';
export const DelightfulExample = () => {
    return (_jsx(DelightfulIntegration, { enableEasterEggs: true, enableAnimations: true, enablePlayfulLoading: true, children: _jsxs("div", { style: { width: '100vw', height: '100vh' }, children: [_jsx(Epic1GraphEditor, {}), _jsxs("div", { style: {
                        position: 'fixed',
                        top: 20,
                        right: 20,
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: 24,
                        borderRadius: 12,
                        maxWidth: 350,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    }, children: [_jsx("h3", { style: { margin: '0 0 16px 0' }, children: "\uD83C\uDFAE Hidden Features" }), _jsxs("div", { style: { fontSize: 14, lineHeight: 1.6 }, children: [_jsx("p", { children: _jsx("strong", { children: "Easter Eggs to discover:" }) }), _jsxs("ul", { style: { paddingLeft: 20 }, children: [_jsxs("li", { children: [_jsx("strong", { children: "Konami Code:" }), " \u2191\u2191\u2193\u2193\u2190\u2192\u2190\u2192BA", _jsx("br", {}), _jsx("em", { children: "Activates weird mode with rainbow effects!" })] }), _jsxs("li", { style: { marginTop: 12 }, children: [_jsx("strong", { children: "Long Press Canvas:" }), " Hold 1 second", _jsx("br", {}), _jsx("em", { children: "Shows debug information panel" })] }), _jsxs("li", { style: { marginTop: 12 }, children: [_jsx("strong", { children: "Triple Click Canvas:" }), " Click 3 times quickly", _jsx("br", {}), _jsx("em", { children: "Enables expert mode with shortcuts" })] }), _jsxs("li", { style: { marginTop: 12 }, children: [_jsx("strong", { children: "Shake Device:" }), " (Mobile only)", _jsx("br", {}), _jsx("em", { children: "Shuffles preset templates" })] }), _jsxs("li", { style: { marginTop: 12 }, children: [_jsx("strong", { children: "Hold Shift:" }), " Precision mode", _jsx("br", {}), _jsx("em", { children: "Fine-grained control for connections" })] })] }), _jsx("p", { style: { marginTop: 16 }, children: _jsx("strong", { children: "Other surprises:" }) }), _jsxs("ul", { style: { paddingLeft: 20 }, children: [_jsx("li", { children: "Nodes wiggle when created" }), _jsx("li", { children: "Edges dance when connected" }), _jsx("li", { children: "Idle nodes start breathing" }), _jsx("li", { children: "Leave it alone 30s - nodes sleep!" }), _jsx("li", { children: "Random confetti bursts" }), _jsx("li", { children: "Floating emojis pass by" }), _jsx("li", { children: "Achievement system tracks progress" })] }), _jsxs("p", { style: { marginTop: 16, fontSize: 12, opacity: 0.7 }, children: ["\uD83D\uDCA1 ", _jsx("em", { children: "These features make the app feel alive and playful!" })] })] })] })] }) }));
};
// Example: Using delightful loading in a component
export const DelightfulLoadingExample = () => {
    const { isLoading, startLoading, stopLoading, LoadingComponent } = useDelightfulLoading();
    const handleGraphOperation = async () => {
        startLoading('graph');
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 3000));
        stopLoading();
    };
    const handlePreviewGeneration = async () => {
        startLoading('preview');
        // Simulate preview generation
        await new Promise(resolve => setTimeout(resolve, 2500));
        stopLoading();
    };
    const handleSave = async () => {
        startLoading('save');
        // Simulate save operation
        await new Promise(resolve => setTimeout(resolve, 1500));
        stopLoading();
    };
    return (_jsxs("div", { style: { padding: 40 }, children: [_jsx("h2", { children: "Delightful Loading States" }), _jsxs("div", { style: { display: 'flex', gap: 16, marginTop: 24 }, children: [_jsx("button", { onClick: handleGraphOperation, children: "Load Graph (with fun messages)" }), _jsx("button", { onClick: handlePreviewGeneration, children: "Generate Preview (mystical loading)" }), _jsx("button", { onClick: handleSave, children: "Save Graph (emotional messages)" })] }), _jsx(LoadingComponent, {}), _jsxs("div", { style: { marginTop: 40 }, children: [_jsx("h3", { children: "Loading Messages by Type:" }), _jsxs("div", { style: { fontSize: 14, lineHeight: 1.8 }, children: [_jsx("p", { children: _jsx("strong", { children: "Graph Loading:" }) }), _jsxs("ul", { children: [_jsx("li", { children: "\"Summoning nodes from the void...\"" }), _jsx("li", { children: "\"Teaching edges how to connect...\"" }), _jsx("li", { children: "\"Polishing node surfaces...\"" }), _jsx("li", { children: "\"Arranging pixels artfully...\"" }), _jsx("li", { children: "\"Convincing nodes to stay put...\"" })] }), _jsx("p", { children: _jsx("strong", { children: "Preview Generation:" }) }), _jsxs("ul", { children: [_jsx("li", { children: "\"Rolling cosmic dice...\"" }), _jsx("li", { children: "\"Consulting the oracle...\"" }), _jsx("li", { children: "\"Mixing word potions...\"" }), _jsx("li", { children: "\"Weaving narrative threads...\"" }), _jsx("li", { children: "\"Birthing possibilities...\"" })] }), _jsx("p", { children: _jsx("strong", { children: "Save Operations:" }) }), _jsxs("ul", { children: [_jsx("li", { children: "\"Preserving your masterpiece...\"" }), _jsx("li", { children: "\"Etching in digital stone...\"" }), _jsx("li", { children: "\"Tucking nodes into bed...\"" }), _jsx("li", { children: "\"Sealing with a kiss...\"" }), _jsx("li", { children: "\"Making it permanent...\"" })] })] })] })] }));
};
// Example: Achievement system
export const AchievementExample = () => {
    return (_jsx(DelightfulIntegration, { children: _jsxs("div", { style: { padding: 40 }, children: [_jsx("h2", { children: "Achievement System" }), _jsx("p", { children: "The app tracks your progress and unlocks achievements:" }), _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 16,
                        marginTop: 24,
                    }, children: [_jsxs("div", { style: {
                                background: '#f0f0f0',
                                padding: 16,
                                borderRadius: 8,
                            }, children: [_jsx("h4", { children: "\uD83C\uDFC6 Graph Master" }), _jsx("p", { children: "Create your first graph with nodes and edges" })] }), _jsxs("div", { style: {
                                background: '#f0f0f0',
                                padding: 16,
                                borderRadius: 8,
                            }, children: [_jsx("h4", { children: "\uD83C\uDFC6 Complexity Conqueror" }), _jsx("p", { children: "Build a graph with 10+ nodes" })] }), _jsxs("div", { style: {
                                background: '#f0f0f0',
                                padding: 16,
                                borderRadius: 8,
                            }, children: [_jsx("h4", { children: "\uD83C\uDFC6 Sacred Geometry" }), _jsx("p", { children: "Create a perfect triangle (3 nodes, 3 edges)" })] }), _jsxs("div", { style: {
                                background: '#f0f0f0',
                                padding: 16,
                                borderRadius: 8,
                            }, children: [_jsx("h4", { children: "\uD83C\uDFC6 Speed Demon" }), _jsx("p", { children: "Create 5 nodes in under 10 seconds" })] }), _jsxs("div", { style: {
                                background: '#f0f0f0',
                                padding: 16,
                                borderRadius: 8,
                            }, children: [_jsx("h4", { children: "\uD83C\uDFC6 Easter Egg Hunter" }), _jsx("p", { children: "Discover all 5 hidden features" })] }), _jsxs("div", { style: {
                                background: '#f0f0f0',
                                padding: 16,
                                borderRadius: 8,
                            }, children: [_jsx("h4", { children: "\uD83C\uDFC6 Night Owl" }), _jsx("p", { children: "Use the app after midnight" })] })] }), _jsx("p", { style: { marginTop: 24, fontSize: 14, opacity: 0.7 }, children: "Achievements are saved locally and shown with toast notifications!" })] }) }));
};
