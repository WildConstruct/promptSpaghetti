import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AdvancedPromptingCollaborationPanel } from './AdvancedPromptingCollaborationPanel';
 >
    { /* Header */}
    < div;
style = {};
{
    marginBottom: 32;
}
 >
    (_jsx("h2", { style: {
            margin: '0 0 8px 0',
            fontSize: 24,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        }, children: "\uD83C\uDFAC Advanced Prompting Collaboration Demo" })
        ,
            _jsx("div", { style: {
                    fontSize: 16,
                    color: '#94a3b8',
                    marginBottom: 16,
                }, children: "Wild Construct $2.3B Film Industry Ecosystem - Epic 8.7 Task 7" }));
{ /* Progress Indicator */ }
_jsxs("div", { style: {
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        padding: 16,
        border: '1px solid rgba(255, 255, 255, 0.1)',
    }, children: [_jsxs("div", { style: {
                fontSize: 14,
                color: '#e2e8f0',
                marginBottom: 8,
                fontWeight: 500,
            }, children: ["Demo Progress: Step ", demoStep + 1, " of ", demoSteps.length] }), _jsx("div", { style: {
                fontSize: 13,
                color: '#94a3b8',
                lineHeight: 1.4,
            }, children: demoSteps[demoStep] }), _jsxs("div", { style: {
                marginTop: 12,
                height: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                overflow: 'hidden',
            }, children: [_jsx("div", { style: {
                        height: '100%',
                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                        width: `${((demoStep + 1) / demoSteps.length) * 100}%`
                    } }), ", transition: 'width 0.5s ease'; }} />"] })] });
div >
    {};
showPanel ? ()
    /* Role Selection */
    < div >
    (_jsx("h3", { style: {
            fontSize: 18,
            fontWeight: 600,
            color: '#e2e8f0',
            marginBottom: 16,
        }, children: "Choose Your Film Industry Role" })
        ,
            _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 16,
                }, children: [demoUsers.map(user => ()
                        < div, key = { user, : .id }, onClick = {}()), " => handleUserSelect(user)} style=", {
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        padding: 20,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden',
                    }, "onMouseEnter=", (e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.borderColor = getRoleColor(user.role);
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }, "onMouseLeave=", (e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }, ">", _jsx("div", { style: {
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: getRoleColor(user.role),
                            color: 'white',
                            padding: '4px 12px',
                            fontSize: 11,
                            fontWeight: 600,
                            borderRadius: '0 12px 0 12px',
                            textTransform: 'uppercase',
                        }, children: user.role.replace('_', ' ') }), _jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 12,
                        }, children: [_jsx("div", { style: {
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}CC)`
                                } }), ", display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20; }}>", user.role === 'director' ? '🎬' :
                                user.role === 'vfx_supervisor' ? '✨' :
                                    user.role === 'pipeline_td' ? '⚙️' :
                                        user.role === 'cinematographer' ? '📹' : '👤'] }), _jsxs("div", { children: [_jsx("div", { style: {
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: '#e2e8f0',
                                    marginBottom: 2,
                                }, children: user.name }), _jsxs("div", { style: {
                                    fontSize: 13,
                                    color: '#94a3b8',
                                }, children: [user.department, " Department"] })] })] })
                ,
                    _jsx("div", { style: {
                            fontSize: 13,
                            color: '#cbd5e1',
                            lineHeight: 1.4,
                            marginBottom: 12,
                        }, children: getRoleDescription(user.role) })
                        ,
                            _jsxs("div", { style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 4,
                                }, children: [user.permissions.slice(0, 2).map(permission => ()
                                        < span, key = { permission }, style = {}, {
                                        background: `${getRoleColor(user.role)}20`
                                    }), ", color: getRoleColor(user.role), fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 500, textTransform: 'capitalize'; }} >", permission.replace('_', ' ')] }))
    :
;
{
    user.permissions.length > 2 && ()
        < span;
    style = {};
    {
        fontSize: 10,
            color;
        '#94a3b8',
        ;
    }
}
 >
    +{ user, : .permissions.length - 2 };
more;
span >
;
div >
;
div >
;
div >
;
div >
;
()
    /* Collaboration Panel */
    < div >
    (_jsxs("div", { style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        }, children: [_jsxs("div", { children: [_jsx("h3", { style: {
                            fontSize: 18,
                            fontWeight: 600,
                            color: '#e2e8f0',
                            margin: 0,
                        }, children: "Collaboration Dashboard" }), selectedUser && ()
                        < div, " style=", {
                        fontSize: 14,
                        color: '#94a3b8',
                        marginTop: 4,
                    }, "> Logged in as ", selectedUser.name, " (", selectedUser.role.replace('_', ' '), ")"] }), ")}"] })
        ,
            _jsx("button", { onClick: () => {
                    setShowPanel(false);
                    setSelectedUser(null);
                    setDemoStep(0);
                    setExportData(null);
                }, style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#e2e8f0',
                    padding: '8px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                }, children: "\u2190 Back to Role Selection" }));
div >
    { selectedUser } && collaboration.collaborationService && ()
    < AdvancedPromptingCollaborationPanel;
collaborationService = { collaboration, : .collaborationService };
currentUser = { selectedUser };
onMARSRegionCreate = { handleMARSRegionCreate };
onZadaPatternCreate = { handleZadaPatternCreate };
onVFXExport = { handleVFXExport }
    /  >
;
{ /* Export Data Display */ }
{
    exportData && ()
        < div;
    style = {};
    {
        marginTop: 20,
            background;
        'rgba(16, 185, 129, 0.1)',
            border;
        '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius;
        8,
            padding;
        16,
        ;
    }
}
 >
    (_jsx("h4", { style: {
            fontSize: 16,
            fontWeight: 600,
            color: '#10b981',
            margin: '0 0 12px 0',
        }, children: "\uD83D\uDE80 VFX Pipeline Export Generated" })
        ,
            _jsx("div", { style: {
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 6,
                    padding: 12,
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: '#e2e8f0',
                    maxHeight: 200,
                    overflow: 'auto',
                }, children: _jsx("pre", { children: JSON.stringify(exportData, null, 2) }) }));
div >
;
div >
;
{ /* Demo Information */ }
_jsxs("div", { style: {
        marginTop: 32,
        padding: 16,
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        border: '1px solid rgba(255, 255, 255, 0.1)',
    }, children: [_jsx("h4", { style: {
                fontSize: 14,
                fontWeight: 600,
                color: '#e2e8f0',
                margin: '0 0 8px 0',
            }, children: "\uD83D\uDCA1 Demo Features" }), _jsxs("div", { style: {
                fontSize: 12,
                color: '#94a3b8',
                lineHeight: 1.5,
            }, children: ["\u2022 ", _jsx("strong", { children: "MARS Framework:" }), " Structured technical regions for VFX professionals () [CAM], [SUBJ], [FX], !FOCAL )", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "Zada Patterns:" }), " Natural language templates for directors and creative teams", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "Hybrid Methodology:" }), " Combines technical precision with creative accessibility", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "VFX Pipeline Export:" }), " Industry-standard formats for production handoff", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "Role-Based UI:" }), " Customized interface based on film industry role", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "Real-Time Collaboration:" }), " Multi-user sessions with live sync capabilities"] })] });
div >
;
;
;
