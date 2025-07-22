# Security Incident Response Quick Reference Guide

**🚨 Emergency Use Document - Keep Accessible 24/7**

## Emergency Contacts (Speed Dial)

| Contact | Primary | Backup | When to Call |
|---------|---------|---------|--------------|
| **CISO** | [Phone] | [Phone] | CRITICAL alerts immediately |
| **Security Manager** | [Phone] | [Phone] | HIGH alerts within 30 min |
| **Incident Response Lead** | [Phone] | [Phone] | All security incidents |
| **SOC Team Lead** | [Phone] | [Phone] | Escalation issues |
| **Compliance Officer** | [Phone] | [Phone] | Regulatory violations |

## Critical Alert Response Checklists

### 🔥 CRITICAL Severity (0-15 minutes)

#### Data Breach Suspected
```bash
□ IMMEDIATE: Block suspected source IP
□ IMMEDIATE: Preserve evidence (logs, network captures)
□ IMMEDIATE: Notify CISO and IR team
□ IMMEDIATE: Activate breach response protocol
□ 15min: Document initial findings
□ 30min: Assess scope and data types involved
□ 60min: Notify legal team if confirmed
```

#### Active Network Attack
```bash
□ IMMEDIATE: Isolate affected network segments
□ IMMEDIATE: Block attack source IPs at firewall
□ IMMEDIATE: Notify security team
□ IMMEDIATE: Enable enhanced logging
□ 15min: Analyze attack methodology
□ 30min: Check for lateral movement
□ 60min: Begin system integrity verification
```

#### Authentication System Compromise
```bash
□ IMMEDIATE: Disable affected authentication service
□ IMMEDIATE: Reset admin passwords
□ IMMEDIATE: Enable emergency access procedures
□ IMMEDIATE: Notify all security personnel
□ 15min: Identify compromised accounts
□ 30min: Force password reset for affected users
□ 60min: Review access logs for unauthorized activity
```

### ⚡ HIGH Severity (15-60 minutes)

#### Brute Force Attack
```bash
□ 15min: Verify attack pattern and scope
□ 15min: Implement IP blocking
□ 30min: Review affected accounts
□ 30min: Notify security manager
□ 45min: Assess need for enhanced monitoring
□ 60min: Document attack details and response
```

#### SQL Injection Attempt
```bash
□ 15min: Block source IP and preserve payload
□ 15min: Analyze injection technique and target
□ 30min: Test vulnerability in safe environment
□ 30min: Assess potential data exposure
□ 45min: Deploy emergency patches if needed
□ 60min: Update WAF rules and signatures
```

#### Privilege Escalation Detected
```bash
□ 15min: Suspend affected user account
□ 15min: Review recent access and changes
□ 30min: Check for unauthorized system access
□ 30min: Notify system administrators
□ 45min: Audit user permissions and roles
□ 60min: Implement additional monitoring
```

## Escalation Decision Tree

```
🚨 Security Alert Received
│
├─ CRITICAL Severity?
│  ├─ YES → Immediate CISO notification + Full response team
│  └─ NO → Continue assessment
│
├─ Data/Privacy Impact?
│  ├─ YES → Notify Legal + Compliance + DPO
│  └─ NO → Standard security response
│
├─ Multiple Systems Affected?
│  ├─ YES → Activate incident command center
│  └─ NO → Single-system response protocol
│
├─ Compliance Framework Impact?
│  ├─ SOX → Notify compliance officer (1 hour)
│  ├─ GDPR/CCPA → Notify DPO (30 minutes)
│  ├─ PCI-DSS → Notify QSA if applicable
│  └─ Other → Framework-specific procedures
│
└─ Unknown/Complex → Escalate to Security Manager
```

## Communication Templates

### 🚨 Critical Alert Notification

**Subject:** [CRITICAL] Security Incident - [Type] - [Time]

**Immediate Actions Required:**
- Alert: [Brief description]
- Systems: [Affected systems]
- Status: [Contained/Active/Under Investigation]
- Impact: [Business impact assessment]
- Response: [Actions taken so far]
- Next: [Immediate next steps]
- Contact: [Incident commander]

### 📞 Escalation Phone Script

**"This is [Name] from PromptScape Security. We have a [SEVERITY] security incident requiring immediate attention:**
- **Incident:** [Brief description]
- **Impact:** [Systems/data affected]
- **Actions:** [What we've done]
- **Need:** [What we need from you]
- **Timeline:** [When we need response]"

## Tool Access Quick Links

### 🖥️ Security Dashboards
- **Primary SOC Dashboard:** [URL]
- **SIEM Platform:** [URL]
- **Incident Tracking:** [URL]
- **Threat Intelligence:** [URL]
- **Compliance Dashboard:** [URL]

### 🔧 Emergency Tools
- **Network Isolation:** [Emergency access]
- **IP Blocking Interface:** [URL]
- **Account Management:** [URL]
- **Log Analysis:** [SIEM access]
- **Evidence Collection:** [Forensic tools]

## Compliance Quick Reference

### ⏰ Regulatory Notification Timelines

| Framework | Internal Notification | External Notification |
|-----------|----------------------|----------------------|
| **GDPR** | DPO: 1 hour | Supervisory Authority: 72 hours |
| **CCPA** | Privacy Officer: 2 hours | AG Office: As required |
| **SOX** | Compliance: 4 hours | Auditors: As required |
| **HIPAA** | Privacy Officer: 1 hour | HHS: 60 days |
| **PCI-DSS** | QSA: 24 hours | Card Brands: Immediately |

### 📋 Documentation Requirements
```bash
□ Incident timeline with UTC timestamps
□ Systems and data affected
□ Actions taken and by whom
□ Evidence preserved and location
□ Business impact assessment
□ Root cause analysis (when complete)
□ Remediation plan and timeline
□ Lessons learned and improvements
```

## Evidence Preservation Checklist

### 💾 Digital Evidence
```bash
□ System logs (with exact timestamps)
□ Network traffic captures
□ Database query logs
□ Application logs and stack traces
□ User access logs
□ Security tool alerts and data
□ System configuration snapshots
□ Memory dumps (if applicable)
```

### 📝 Documentation Evidence
```bash
□ Initial incident report
□ Investigation notes and findings
□ Communication records
□ Decision rationale documentation
□ External correspondence
□ Recovery action logs
□ Post-incident review notes
```

## Recovery Procedures

### 🔄 System Recovery Priorities
1. **Life Safety Systems** (if applicable)
2. **Revenue-Critical Systems**
3. **Customer-Facing Services**
4. **Internal Operations Systems**
5. **Development/Test Systems**

### ✅ Recovery Validation
```bash
□ System integrity verified
□ Security controls restored
□ Monitoring systems operational
□ Backup systems tested
□ User access validated
□ Data integrity confirmed
□ Performance benchmarks met
□ Security scan completed
```

## Post-Incident Actions

### 📊 Immediate Post-Incident (0-24 hours)
```bash
□ Secure all evidence and documentation
□ Brief leadership on incident resolution
□ Update stakeholders on service status
□ Monitor for recurring issues
□ Begin preliminary lessons learned
```

### 📈 Short-term Follow-up (1-7 days)
```bash
□ Complete detailed incident report
□ Conduct post-incident review meeting
□ Implement immediate security improvements
□ Update monitoring and detection rules
□ Brief team on lessons learned
```

### 🔍 Long-term Improvements (1-4 weeks)
```bash
□ Implement systemic security enhancements
□ Update policies and procedures
□ Conduct additional team training
□ Review and test incident response plans
□ Update business continuity plans
```

## Training Scenarios

### 🎯 Monthly Drill Scenarios
- **Phishing Attack Response**
- **Ransomware Detection**
- **Data Breach Simulation**
- **Insider Threat Response**
- **Third-Party Compromise**

### 🧪 Quarterly Exercises
- **Multi-Vector Attack**
- **Supply Chain Compromise**
- **Advanced Persistent Threat**
- **Compliance Violation Response**
- **Business Continuity Integration**

---

## Version Control
- **Version:** 1.0
- **Last Updated:** July 2025
- **Next Review:** October 2025
- **Owner:** Security Operations Team

**🚨 Keep this document readily accessible during security incidents. Print a physical copy for emergency reference when digital systems may be compromised.**

---

*For detailed procedures, refer to the complete Security Alerting Procedures document. This quick guide is for immediate incident response reference only.*