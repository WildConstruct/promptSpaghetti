# User Listing Wireframes

## Epic 17.3 - User & Permission Management Dashboard

**Task ID:** E17-1753114396997-21FFF5  
**Story:** 17.3.1 User Management Dashboard  
**Estimated Duration:** 6 hours

---

## Overview

This document provides comprehensive wireframes and design specifications for the User Listing interface as part of the Backstage Admin Controls system. The interface provides administrators with tools for user directory management, RBAC system implementation, activity monitoring, and compliance tools.

---

## 1. Main User Listing Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ BACKSTAGE ADMIN CONTROLS - USER MANAGEMENT                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ [🏠 Dashboard] [👥 Users] [🔒 Permissions] [📊 Analytics] [⚙️ Settings]        │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ User Directory Management                                          📈 Total: 1,247│
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Filters & Search                                                            │ │
│ │ ┌──────────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │ │
│ │ │ 🔍 Search users   │ │ All Roles ▼ │ │ All Status ▼│ │ Date Range ▼│      │ │
│ │ └──────────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │ │
│ │                                                                             │ │
│ │ [+ Add New User] [📤 Export] [🔄 Sync Directory] [⚙️ Bulk Actions]        │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ USER LIST TABLE                                                             │ │
│ │ ┌──┬─────────┬────────────────┬───────────────┬──────────────┬─────────────┐│ │
│ │ │☑ │ Avatar  │ User Details   │ Role          │ Status       │ Actions     ││ │
│ │ ├──┼─────────┼────────────────┼───────────────┼──────────────┼─────────────┤│ │
│ │ │☑ │ [👤 JS] │ John Smith     │ Administrator │ 🟢 Active    │ [⋯ Menu]    ││ │
│ │ │  │         │ j.smith@co.com │               │ Last: 2h ago │             ││ │
│ │ ├──┼─────────┼────────────────┼───────────────┼──────────────┼─────────────┤│ │
│ │ │☑ │ [👤 MD] │ Maria Davis    │ Project Mgr   │ 🟢 Active    │ [⋯ Menu]    ││ │
│ │ │  │         │ m.davis@co.com │               │ Last: 5m ago │             ││ │
│ │ ├──┼─────────┼────────────────┼───────────────┼──────────────┼─────────────┤│ │
│ │ │☑ │ [👤 RJ] │ Robert Johnson │ Developer     │ 🟡 Pending   │ [⋯ Menu]    ││ │
│ │ │  │         │ r.johnson@co.  │               │ Verification │             ││ │
│ │ ├──┼─────────┼────────────────┼───────────────┼──────────────┼─────────────┤│ │
│ │ │☑ │ [👤 LW] │ Lisa Wilson    │ Designer      │ 🔴 Suspended │ [⋯ Menu]    ││ │
│ │ │  │         │ l.wilson@co.   │               │ Violation    │             ││ │
│ │ └──┴─────────┴────────────────┴───────────────┴──────────────┴─────────────┘│ │
│ │                                                                             │ │
│ │ Showing 1-25 of 1,247 users  [◀ Previous] [1] [2] [3] ... [50] [Next ▶]   │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Actions Menu Dropdown

```
┌────────────────────────────┐
│ User Actions Menu          │
├────────────────────────────┤
│ 👁️  View Profile            │
│ ✏️  Edit User               │
│ 🔑 Manage Permissions      │
│ 📊 View Activity           │
│ ────────────────────       │
│ 🔒 Suspend Account         │
│ 🔄 Reset Password          │
│ 📧 Resend Verification     │
│ ────────────────────       │
│ 🗑️  Delete User            │
└────────────────────────────┘
```

---

## 3. Advanced Filters Panel (Expandable)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🔽 Advanced Filters                                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐        │
│ │ Department          │ │ Location            │ │ Account Status      │        │
│ │ ☑ Engineering       │ │ ☑ New York          │ │ ☑ Active            │        │
│ │ ☑ Design            │ │ ☑ San Francisco     │ │ ☑ Pending           │        │
│ │ ☐ Marketing         │ │ ☑ Remote            │ │ ☐ Suspended         │        │
│ │ ☐ Sales             │ │ ☐ London            │ │ ☐ Deactivated       │        │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘        │
│                                                                                 │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐        │
│ │ Last Activity       │ │ Permission Level    │ │ MFA Status          │        │
│ │ ( ) Last 24 hours   │ │ ☑ Full Admin        │ │ ( ) MFA Enabled     │        │
│ │ ( ) Last week       │ │ ☑ Limited Admin     │ │ ( ) MFA Required    │        │
│ │ (•) Last month      │ │ ☑ Standard User     │ │ (•) All Users       │        │
│ │ ( ) Custom range    │ │ ☐ Read Only         │ │                     │        │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘        │
│                                                                                 │
│ [Apply Filters] [Clear All] [Save Filter Set]                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. User Quick Stats Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ USER METRICS OVERVIEW                                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌─────────────┐ │
│ │ 👥 Total Users    │ │ ✅ Active Users   │ │ 🔄 Pending       │ │ ⚠️ Issues   │ │
│ │                  │ │                  │ │                  │ │             │ │
│ │     1,247        │ │     1,089        │ │       42         │ │     8       │ │
│ │ ─────────────── │ │ ─────────────── │ │ ─────────────── │ │ ───────────│ │
│ │ +23 this week    │ │ 87.3% online     │ │ Verification     │ │ Violations │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ └─────────────┘ │
│                                                                                 │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌─────────────┐ │
│ │ 🔒 Admin Users    │ │ 📊 Activity      │ │ 🏢 Departments   │ │ 🌐 Locations│ │
│ │                  │ │                  │ │                  │ │             │ │
│ │      87          │ │ 4,523 actions    │ │      12          │ │     8       │ │
│ │ ─────────────── │ │ ─────────────── │ │ ─────────────── │ │ ───────────│ │
│ │ Multiple roles   │ │ Last 24 hours    │ │ Active teams     │ │ Global      │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ └─────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Bulk Actions Panel

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🔽 BULK ACTIONS (247 users selected)                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ ⚠️ WARNING: Bulk actions affect multiple users. Please review carefully.       │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ User Management Actions                                                     │ │
│ │ [✉️ Send Email] [🔄 Update Status] [🔑 Reset Passwords] [📤 Export Data]    │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Permission Actions                                                          │ │
│ │ [🏷️ Assign Role] [➕ Add Permission] [➖ Remove Permission] [🔄 Sync LDAP]   │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Compliance Actions                                                          │ │
│ │ [📋 Audit Log] [🔒 Force MFA] [📊 Generate Report] [⚖️ Compliance Check]   │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ [✅ Execute Selected Actions] [❌ Cancel Bulk Operation]                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Mobile-Responsive Design

### Mobile View (< 768px)

```
┌───────────────────────────────────┐
│ 🍔 ADMIN CONTROLS                 │
├───────────────────────────────────┤
│                                   │
│ 👥 User Management (1,247)        │
│                                   │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Search users...              │ │
│ └─────────────────────────────────┘ │
│                                   │
│ [Filter ▼] [+ Add] [Menu ⋯]       │
│                                   │
│ ┌─────────────────────────────────┐ │
│ │ 👤 John Smith                   │ │
│ │ j.smith@company.com             │ │
│ │ Admin • Active • 2h ago         │ │
│ │                         [⋯]     │ │
│ ├─────────────────────────────────┤ │
│ │ 👤 Maria Davis                  │ │
│ │ m.davis@company.com             │ │
│ │ PM • Active • 5m ago            │ │
│ │                         [⋯]     │ │
│ ├─────────────────────────────────┤ │
│ │ 👤 Robert Johnson               │ │
│ │ r.johnson@company.com           │ │
│ │ Dev • Pending • Verification    │ │
│ │                         [⋯]     │ │
│ └─────────────────────────────────┘ │
│                                   │
│ [Load More...] (25 of 1,247)      │
│                                   │
└───────────────────────────────────┘
```

---

## 7. User Card Layout (Alternative View)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ VIEW: [📄 List] [🎯 Cards] [📊 Analytics]                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌─────────────┐ │
│ │ 👤 John Smith     │ │ 👤 Maria Davis    │ │ 👤 Robert Johnson│ │ 👤 Lisa W.  │ │
│ │ j.smith@co.com   │ │ m.davis@co.com   │ │ r.johnson@co.com │ │ l.wilson@co │ │
│ │                  │ │                  │ │                  │ │             │ │
│ │ 🔹 Administrator  │ │ 🔹 Project Mgr    │ │ 🔹 Developer      │ │ 🔹 Designer  │ │
│ │ 🟢 Active         │ │ 🟢 Active         │ │ 🟡 Pending       │ │ 🔴 Suspended│ │
│ │ Last: 2h ago     │ │ Last: 5m ago     │ │ Verification     │ │ Violation   │ │
│ │                  │ │                  │ │                  │ │             │ │
│ │ [View] [Edit]    │ │ [View] [Edit]    │ │ [View] [Approve] │ │ [View] [Fix]│ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ └─────────────┘ │
│                                                                                 │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌─────────────┐ │
│ │ 👤 Alex Chen      │ │ 👤 Sarah Johnson │ │ 👤 Mike Wilson   │ │ [+ Add User]│ │
│ │ a.chen@co.com    │ │ s.johnson@co.com │ │ m.wilson@co.com  │ │             │ │
│ │                  │ │                  │ │                  │ │ Create new  │ │
│ │ 🔹 QA Engineer    │ │ 🔹 Content Writer│ │ 🔹 Sales Rep      │ │ user account│ │
│ │ 🟢 Active         │ │ 🟢 Active         │ │ 🟢 Active         │ │ in system   │ │
│ │ Last: 1h ago     │ │ Last: 30m ago    │ │ Last: 3h ago     │ │             │ │
│ │                  │ │                  │ │                  │ │             │ │
│ │ [View] [Edit]    │ │ [View] [Edit]    │ │ [View] [Edit]    │ │ [Create]    │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ └─────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Export and Sync Options

```
┌───────────────────────────────────────────────────────────────┐
│ 📤 EXPORT USER DATA                                           │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Export Format:                                                │
│ (•) CSV Spreadsheet     ( ) JSON Data      ( ) PDF Report    │
│                                                               │
│ Include Fields:                                               │
│ ☑ Basic Info (Name, Email, ID)                               │
│ ☑ Role & Permissions                                          │
│ ☑ Activity & Login History                                    │
│ ☑ Department & Location                                       │
│ ☐ Personal Details (Privacy Protected)                        │
│                                                               │
│ Filter Options:                                               │
│ ☑ Apply current filters (247 users selected)                 │
│ ☐ Export all users (1,247 total)                             │
│ ☐ Custom date range: [From] [To]                             │
│                                                               │
│ [📁 Export to File] [📧 Email Report] [❌ Cancel]            │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ 🔄 DIRECTORY SYNC                                            │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Connected Systems:                                            │
│ 🟢 Active Directory (last sync: 2h ago)                      │
│ 🟢 LDAP Server (last sync: 5m ago)                           │
│ 🟡 Google Workspace (sync pending)                           │
│ 🔴 Azure AD (connection error)                               │
│                                                               │
│ Sync Settings:                                                │
│ ☑ Auto-sync every 4 hours                                    │
│ ☑ Email notifications on sync errors                         │
│ ☑ Create users automatically                                  │
│ ☐ Delete users automatically (manual review)                 │
│                                                               │
│ [🔄 Sync Now] [⚙️ Configure] [📊 Sync History]              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Technical Specifications

### Responsive Breakpoints

- **Desktop**: ≥ 1200px - Full table layout with all columns
- **Tablet**: 768px - 1199px - Compact table with essential columns
- **Mobile**: < 768px - Card-based layout with stacked information

### Performance Requirements

- **Load Time**: < 2 seconds for 100 users
- **Search**: Real-time results with < 300ms delay
- **Pagination**: 25 users per page (configurable: 10, 25, 50, 100)
- **Export**: Background processing for > 1000 users

### Accessibility Standards

- **WCAG 2.1 AA** compliance
- **Screen Reader** support for all interactive elements
- **Keyboard Navigation** for all actions
- **Color Contrast** minimum 4.5:1 ratio
- **Focus Indicators** visible for all focusable elements

### Data Security

- **Role-based Access**: Filter data based on user permissions
- **Audit Logging**: Track all user management actions
- **PII Protection**: Mask sensitive data for non-admin users
- **Export Controls**: Limit export permissions by role

---

## Integration Points

### Backend Requirements

- **User Management API** endpoints for CRUD operations
- **Search & Filter API** with query optimization
- **Bulk Operations API** with transaction support
- **Export API** with streaming for large datasets
- **Directory Sync API** for external system integration

### State Management

- **User List State**: Pagination, filters, search terms
- **Selection State**: Bulk selection tracking
- **UI State**: View mode, expanded panels, modal states
- **Sync State**: Loading states, error handling

### Error Handling

- **Network Errors**: Retry mechanism with user feedback
- **Permission Errors**: Clear messaging and alternative actions
- **Validation Errors**: Inline field-level error display
- **Bulk Operation Errors**: Detailed error reporting per user

---

## Future Enhancements

1. **Advanced Analytics**: User engagement metrics and trends
2. **Machine Learning**: Anomaly detection for user behavior
3. **Integration Hub**: Additional directory service connectors
4. **Mobile App**: Dedicated mobile admin application
5. **Automation Rules**: Automated user lifecycle management

---

_This wireframe specification provides comprehensive design guidance for implementing the User Listing interface as part of Epic 17.3 - User & Permission Management Dashboard._
