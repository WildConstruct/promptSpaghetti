# Version Control and Updates

> **Epic 8.3 Story 8.3.5** - Version Control and Updates Implementation

## 📋 Overview

This document outlines the version control strategy and update management system for the Content Authoring Handbook. The handbook uses Git-based version control with automated builds and a structured contribution process.

## 🔄 Version Control Strategy

### Repository Structure

```
docs/content-authoring-handbook/
├── .github/
│   └── workflows/
│       ├── build-handbook.yml    # Automated builds
│       ├── update-search.yml     # Search index updates
│       └── deploy-handbook.yml   # Deployment workflow
├── VERSION                       # Current handbook version
├── CHANGELOG.md                  # Version history
├── assets/                       # Static assets and tools
├── part1-foundation/            # Content chapters
├── part2-content-development/
├── part3-engine-reference/
├── part4-practical-guides/
├── part5-advanced-topics/
├── part6-reference-materials/
└── _build/                      # Generated content (ignored)
```

### Branching Strategy

- **main**: Production-ready handbook content
- **develop**: Integration branch for new features
- **feature/**: Individual feature branches
- **release/**: Release preparation branches
- **hotfix/**: Critical fixes to production

### Version Management

- **Semantic Versioning**: MAJOR.MINOR.PATCH format
- **Version Metadata**: Embedded in all generated formats
- **Automated Versioning**: CI/CD pipeline manages version increments
- **Version History**: Complete changelog maintained

## 📝 Change Management Process

### Content Updates

1. **Create Feature Branch**: `git checkout -b feature/update-name`
2. **Make Changes**: Update content, examples, or assets
3. **Update Metadata**: Modify version info and changelog
4. **Test Build**: Run local build to verify changes
5. **Submit PR**: Create pull request with detailed description
6. **Review Process**: Content and technical review
7. **Merge**: Automated build and deployment triggered

### Version Tracking

- **Auto-increment**: Patch version for content updates
- **Manual increment**: Minor/major versions for structural changes
- **Version embedding**: All formats include version information
- **Change detection**: Automated tracking of content modifications

## 🚀 Automated Build System

### Continuous Integration

```yaml
# .github/workflows/build-handbook.yml
name: Build Handbook
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build handbook
        run: npm run build
      - name: Update search index
        run: npm run build:search
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_build/web
```

### Build Triggers

- **Push to main**: Full production build and deployment
- **Pull requests**: Preview builds for testing
- **Scheduled**: Weekly builds to catch dependency updates
- **Manual**: On-demand builds for releases

## 📊 Change Tracking System

### Content Versioning

```javascript
// assets/tools/version-tracker.js
const versionTracker = {
  trackChanges: (filePath, oldContent, newContent) => {
    const changes = {
      file: filePath,
      timestamp: new Date().toISOString(),
      changes: diffLines(oldContent, newContent),
      author: getGitAuthor(),
      version: getCurrentVersion()
    };

    updateChangeLog(changes);
    updateSearchIndex(filePath, newContent);
    return changes;
  },

  generateChangeLog: () => {
    const changes = getRecentChanges();
    return markdownChangeLog(changes);
  }
};
```

### Visual Indicators

- **New Content**: 🆕 badges for recent additions
- **Updated**: 📝 badges for recent modifications
- **Version Tags**: Clear version information in headers
- **Last Modified**: Timestamps on all pages

## 🔧 Contribution Process

### Contributor Guidelines

1. **Fork Repository**: Create personal fork
2. **Create Branch**: Use descriptive branch names
3. **Follow Standards**: Adhere to content style guide
4. **Test Changes**: Verify build process locally
5. **Submit PR**: Include detailed description and testing notes
6. **Address Review**: Respond to reviewer feedback
7. **Merge Process**: Automated after approval

### Review Workflow

- **Content Review**: Subject matter expert approval
- **Technical Review**: Build and functionality verification
- **Editorial Review**: Grammar, style, and consistency
- **Final Approval**: Project maintainer sign-off

### Recognition System

```markdown
## Contributors

- **Major Contributors**: Listed in README
- **Recent Contributors**: Monthly recognition
- **Commit Authors**: Git history preservation
- **Review Credits**: Acknowledgment in changelog
```

## 📈 Update Notifications

### Notification System

```javascript
// assets/js/update-notifications.js
const updateNotifier = {
  checkForUpdates: async () => {
    const response = await fetch('/api/version-check');
    const latest = await response.json();

    if (latest.version > currentVersion) {
      showUpdateNotification(latest);
    }
  },

  showUpdateNotification: updateInfo => {
    const notification = createNotification({
      title: 'Handbook Updated',
      message: `New version ${updateInfo.version} available`,
      actions: ['View Changes', 'Update Now']
    });

    document.body.appendChild(notification);
  }
};
```

### Update Channels

- **In-app Notifications**: Browser notifications for web version
- **Email Notifications**: Optional subscriber updates
- **RSS Feed**: Structured update feed
- **GitHub Releases**: Formal release announcements

## 🔍 Quality Assurance

### Pre-commit Hooks

```bash
#!/bin/sh
# .git/hooks/pre-commit
npm run build:search
npm run validate-links
npm run check-spelling
npm run verify-examples
```

### Content Validation

- **Link Checking**: Automated verification of internal/external links
- **Spell Checking**: Automated spelling validation
- **Example Validation**: Verify all code examples work
- **Format Validation**: Ensure all formats build successfully

### Testing Strategy

- **Build Tests**: Verify all formats generate correctly
- **Content Tests**: Validate examples and code snippets
- **Performance Tests**: Check build times and output sizes
- **Accessibility Tests**: Ensure compliance with accessibility standards

## 📦 Release Management

### Release Process

1. **Version Planning**: Define scope and timeline
2. **Content Freeze**: Lock content for testing
3. **Testing Phase**: Comprehensive validation
4. **Release Candidate**: Preview version for stakeholders
5. **Final Release**: Production deployment
6. **Post-release**: Monitor and hotfix if needed

### Release Artifacts

- **Web Version**: GitHub Pages deployment
- **PDF Version**: Downloadable PDF document
- **EPUB Version**: E-reader compatible format
- **Print Version**: Print-optimized layout
- **Offline Package**: Self-contained HTML bundle

## 🎯 Success Metrics

### Version Control Metrics

- **Contribution Rate**: Number of contributors per month
- **Update Frequency**: Content update cadence
- **Build Success Rate**: CI/CD pipeline reliability
- **Review Turnaround**: Time from PR to merge

### Quality Metrics

- **Content Accuracy**: Error rate in examples
- **Link Validity**: Broken link detection
- **User Feedback**: Satisfaction with update process
- **Performance**: Build time and output size trends

---

_This version control system ensures the Content Authoring Handbook remains current, accurate, and easily maintainable while providing a smooth contribution experience for all stakeholders._
