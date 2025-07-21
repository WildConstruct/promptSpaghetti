# IMMEDIATE DEVELOPMENT PRIORITIES

**Date**: 2025-07-21  
**Status**: URGENT AGENT REDIRECTION REQUIRED

---

## 🚨 STOP WORKING ON EPIC 19 (Privacy/Compliance)

**All agents should immediately deprioritize Epic 19 tasks and focus on business-critical features.**

Epic 19 privacy features are:
- ❌ Not customer-requested  
- ❌ Not revenue-generating
- ❌ Not core to product functionality
- ❌ Overly complex for current business needs

---

## 🎯 NEW AGENT PRIORITIES (IN ORDER)

### **PRIORITY 1: Epic Integration - Expose Completed Features** ⚡ **NEW TOP PRIORITY**
**Business Value: Make months of completed development work visible to users**

**Primary Focus**: Epic 7 Advanced Nodes + Export System + Project Management
**Key Issue**: Major features are implemented but hidden from users
**Analysis**: `docs/EPIC-INTEGRATION-GAPS.md`

**Critical Integration Tasks:**
1. ~~**Expose Advanced Nodes**~~ ✅ **COMPLETE** - Advanced nodes now visible in palette!
2. **Complete Export Integration** - Connect existing GeneratorBundle exporter to UI (2-3 hours)
3. **Project Management Backend** - Create API endpoints for save/load system (3-4 hours)
4. ~~**Python Node Integration**~~ ✅ **COMPLETE** - PythonTransform now in palette!

**Existing Assets:**
- ✅ All 4 advanced nodes fully implemented with 90%+ test coverage (`packages/core/runtime/nodes/`)
- ✅ Complete GeneratorBundle exporter (`server/src/exporter.ts`)
- ✅ Project dialogs already integrated in GraphEditor.tsx
- ✅ Python node implementation exists

**Estimated Impact**: 6+ months of hidden development work made visible
**Estimated Time**: 8-12 hours total integration work

---

### **PRIORITY 2: Authentication Frontend Integration** 
**Business Value: Users can log in and access personal accounts**

**Status**: ✅ **PARTIALLY COMPLETE** - React Router and auth system integrated in App.tsx
**Primary Epic**: Authentication Frontend Integration  
**Key Story**: 20.1 User Authentication Routing Integration  
**File**: `docs/stories/20.1.user-authentication-routing.md`

**Remaining Tasks:**
1. ~~React Router Setup~~ ✅ **COMPLETE** - Implemented in App.tsx
2. ~~Login/Register Pages~~ ✅ **COMPLETE** - Routes configured
3. ~~Protected Routes~~ ✅ **COMPLETE** - PrivateRoute component working
4. **Auth State Management** - Zustand store integration needs verification
5. **JWT Token Handling** - Session management and refresh validation
6. **Email Verification** - Connect to existing backend SMTP

**Existing Assets:**
- ✅ Backend auth APIs already built (`server/src/auth/`)
- ✅ Frontend auth components exist (`client/src/components/auth/`)
- ✅ React Router integration complete (`client/src/App.tsx`)
- ✅ Authentication service infrastructure ready

**Estimated Sprint**: 3-5 days remaining work

---

### **PRIORITY 2: File Browser & Project Management**
**Business Value: Users can save/load their projects and not lose work**

**Primary Epic**: File Browser & Project Management System  
**Key Story**: Project File Format & Core Save/Load System  
**File**: `docs/epics/epic-file-browser-project-management.md`

**Critical Tasks Needed:**
1. **.psg File Format** - Project save format specification
2. **Save Dialog** - UI for saving projects to filesystem  
3. **Load/Open Dialog** - File browser for opening existing projects
4. **Recent Files** - Quick access to recently opened projects
5. **Auto-recovery** - Crash recovery and autosave functionality
6. **Project Metadata** - Version info, creation date, etc.

**Existing Assets:**
- ✅ Export system exists (`server/src/exporter.ts`) 
- ✅ Graph state management (`core/graphStore.ts`)
- ✅ JSON serialization patterns established

**Estimated Sprint**: 2-3 weeks for complete system

---

### **PRIORITY 3: Core Product Polish** 
**Business Value: Better user experience for existing features**

**Focus Areas:**
1. **Performance Optimization** - Maintain <1s prompt generation
2. **Bug Fixes** - Address any core functionality issues  
3. **UI/UX Improvements** - Better graph editor experience
4. **Testing** - Comprehensive test coverage for reliability

---

## 🚫 DEPRIORITIZED (DO NOT WORK ON)

### **Epic 19: Privacy & Compliance Framework**
- 179 approved tasks related to privacy/compliance features
- 592 unassigned privacy-related tasks  
- Not requested by customers
- No validated business case
- Overly complex for current product stage

**IF Epic 19 work is already in progress:**
- Finish current task to avoid wasted work
- Do not grab new Epic 19 tasks  
- Transition to Priority 1-2 work

---

## 📊 AGENT TASK REALLOCATION

### **For Development Agents:**
```bash
# STEP 1: Always check priorities first
node src/show-priority-tasks.js

# STEP 2: Grab priority tasks with improved filtering
# Grab authentication tasks (PRIORITY 1):
node src/grab-tasks.js <your-dev-id> 2 --story=20.1

# Grab file browser tasks (PRIORITY 2):
node src/grab-tasks.js <your-dev-id> 2 --story=20.2

# Grab any high-priority business-critical tasks:
node src/grab-tasks.js <your-dev-id> 2 --priority-only

# STEP 3: Monitor team coordination
node src/monitor-available-tasks.js

# AVOID: Epic 19 privacy tasks (automatically deprioritized)
```

### **For QA Agents:**  
- Prioritize testing authentication flows
- Validate file save/load functionality
- Regression test core prompt generation features
- Epic 19 testing only if blocking other agents

### **For Scrum Master:**
- Create tasks for authentication frontend integration
- Break down file browser epic into actionable tasks
- Monitor agent workload reallocation
- Track progress on Priority 1-2 epics

---

## 🎯 SUCCESS METRICS

### **Authentication Success:**
- [ ] Users can register new accounts
- [ ] Users can log in with existing accounts  
- [ ] Protected routes work correctly
- [ ] Session management functions properly
- [ ] Email verification system operational

### **File Browser Success:**
- [ ] Users can save projects as .psg files
- [ ] Users can load existing .psg projects  
- [ ] Recent files list shows last opened projects
- [ ] Auto-recovery works after crashes
- [ ] Project metadata displayed correctly

### **Team Efficiency:**
- [ ] 80%+ agent effort on Priority 1-2 epics
- [ ] <20% agent effort on Epic 19 privacy features
- [ ] Weekly progress demos on authentication/file browser
- [ ] User-facing features delivered over internal compliance

---

## 📞 NEXT ACTIONS

1. **Immediate**: All agents finish current tasks and grab Priority 1-2 work
2. **This Week**: Authentication routing implementation begins  
3. **Next Sprint**: File browser save/load system development
4. **Ongoing**: Epic 19 remains deprioritized until business case validated

**Focus on what users actually need: Login system and saving their work!**