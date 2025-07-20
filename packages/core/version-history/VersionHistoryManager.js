/**
 * Epic 9.3.1 - Version History Manager
 * Manages version snapshots, branching, and change tracking for projects
 */
export class VersionHistoryManager {
    apiClient;
    projectId;
    userId;
    snapshots = new Map();
    branches = new Map();
    changeEvents = [];
    currentSessionId;
    constructor(apiClient, projectId, userId) {
        this.apiClient = apiClient;
        this.projectId = projectId;
        this.userId = userId;
        this.currentSessionId = crypto.randomUUID();
    }
    // Snapshot Management
    async createSnapshot(graphData, options = {}) {
        try {
            // Prepare snapshot data
            const snapshotData = {
                project_id: this.projectId,
                graph_data: graphData,
                title: options.title,
                description: options.description,
                changelog: options.changelog,
                snapshot_type: options.snapshot_type || 'manual',
                trigger_event: options.trigger_event,
                version_tag: options.version_tag,
                workflow_state: options.workflow_state || 'draft',
                approval_status: options.approval_status,
                created_by: this.userId
            };
            const response = await this.apiClient.post('/api/version-snapshots', snapshotData);
            const snapshot = response.data;
            // Update local cache
            this.snapshots.set(snapshot.id, snapshot);
            // Record change event
            await this.recordChangeEvent({
                event_type: 'snapshot_created',
                event_data: {
                    snapshot_id: snapshot.id,
                    snapshot_type: snapshot.snapshot_type,
                    version_number: snapshot.version_number
                },
                affected_nodes: this.extractNodeIds(graphData),
                change_magnitude: this.calculateChangeMagnitude(graphData)
            });
            return snapshot;
        }
        catch (error) {
            console.error('Failed to create snapshot:', error);
            throw error;
        }
    }
    async getSnapshots(filter = {}) {
        try {
            const params = new URLSearchParams();
            params.append('project_id', this.projectId);
            Object.entries(filter).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });
            const response = await this.apiClient.get(`/api/version-snapshots?${params}`);
            const result = response.data;
            // Update local cache
            result.snapshots.forEach((snapshot) => {
                this.snapshots.set(snapshot.id, snapshot);
            });
            return result;
        }
        catch (error) {
            console.error('Failed to get snapshots:', error);
            throw error;
        }
    }
    async getSnapshot(snapshotId) {
        try {
            // Check cache first
            if (this.snapshots.has(snapshotId)) {
                return this.snapshots.get(snapshotId);
            }
            const response = await this.apiClient.get(`/api/version-snapshots/${snapshotId}`);
            const snapshot = response.data;
            this.snapshots.set(snapshotId, snapshot);
            return snapshot;
        }
        catch (error) {
            console.error('Failed to get snapshot:', error);
            throw error;
        }
    }
    async getSnapshotData(snapshotId) {
        try {
            const response = await this.apiClient.get(`/api/version-snapshots/${snapshotId}/data`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get snapshot data:', error);
            throw error;
        }
    }
    async deleteSnapshot(snapshotId) {
        try {
            await this.apiClient.delete(`/api/version-snapshots/${snapshotId}`);
            this.snapshots.delete(snapshotId);
            // Record change event
            await this.recordChangeEvent({
                event_type: 'snapshot_deleted',
                event_data: { snapshot_id: snapshotId },
                affected_nodes: [],
                change_magnitude: 0
            });
        }
        catch (error) {
            console.error('Failed to delete snapshot:', error);
            throw error;
        }
    }
    // Diff Management
    async compareFreshSnapshots(fromSnapshotId, toSnapshotId) {
        try {
            const response = await this.apiClient.get(`/api/version-diffs/${fromSnapshotId}/${toSnapshotId}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to compare snapshots:', error);
            throw error;
        }
    }
    async getSnapshotDiff(fromSnapshotId, toSnapshotId) {
        try {
            // Try to get cached diff first
            const response = await this.apiClient.get(`/api/version-diffs/${fromSnapshotId}/${toSnapshotId}`);
            return response.data;
        }
        catch (error) {
            // If not cached, compute diff
            return await this.computeDiff(fromSnapshotId, toSnapshotId);
        }
    }
    async computeDiff(fromSnapshotId, toSnapshotId) {
        try {
            const response = await this.apiClient.post('/api/version-diffs/compute', {
                from_snapshot_id: fromSnapshotId,
                to_snapshot_id: toSnapshotId
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to compute diff:', error);
            throw error;
        }
    }
    // Branch Management
    async createBranch(name, options = {}) {
        try {
            const branchData = {
                project_id: this.projectId,
                name,
                description: options.description,
                branch_type: options.branch_type || 'feature',
                parent_branch_id: options.parent_branch_id,
                base_snapshot_id: options.base_snapshot_id,
                visibility: options.visibility || 'workspace',
                created_by: this.userId
            };
            const response = await this.apiClient.post('/api/branches', branchData);
            const branch = response.data;
            this.branches.set(branch.id, branch);
            // Record change event
            await this.recordChangeEvent({
                event_type: 'branch_created',
                event_data: {
                    branch_id: branch.id,
                    branch_name: branch.name,
                    branch_type: branch.branch_type
                },
                affected_nodes: [],
                change_magnitude: 0
            });
            return branch;
        }
        catch (error) {
            console.error('Failed to create branch:', error);
            throw error;
        }
    }
    async getBranches() {
        try {
            const response = await this.apiClient.get(`/api/branches?project_id=${this.projectId}`);
            const branches = response.data;
            branches.forEach((branch) => {
                this.branches.set(branch.id, branch);
            });
            return branches;
        }
        catch (error) {
            console.error('Failed to get branches:', error);
            throw error;
        }
    }
    async switchBranch(branchName) {
        try {
            const response = await this.apiClient.post(`/api/branches/switch`, {
                project_id: this.projectId,
                branch_name: branchName
            });
            const branch = response.data.branch;
            this.branches.set(branch.id, branch);
            // Record change event
            await this.recordChangeEvent({
                event_type: 'branch_switched',
                event_data: {
                    branch_name: branchName,
                    head_snapshot_id: branch.head_snapshot_id
                },
                affected_nodes: [],
                change_magnitude: 0
            });
            return branch;
        }
        catch (error) {
            console.error('Failed to switch branch:', error);
            throw error;
        }
    }
    async mergeBranch(sourceBranchId, targetBranchId, options = {}) {
        try {
            const response = await this.apiClient.post('/api/branches/merge', {
                source_branch_id: sourceBranchId,
                target_branch_id: targetBranchId,
                merge_message: options.merge_message,
                strategy: options.strategy || 'merge',
                delete_source: options.delete_source || false
            });
            const mergeSnapshot = response.data;
            this.snapshots.set(mergeSnapshot.id, mergeSnapshot);
            // Record change event
            await this.recordChangeEvent({
                event_type: 'branch_merged',
                event_data: {
                    source_branch_id: sourceBranchId,
                    target_branch_id: targetBranchId,
                    merge_snapshot_id: mergeSnapshot.id,
                    strategy: options.strategy
                },
                affected_nodes: [],
                change_magnitude: 5 // Merges are significant changes
            });
            return mergeSnapshot;
        }
        catch (error) {
            console.error('Failed to merge branch:', error);
            throw error;
        }
    }
    // Change Event Tracking
    async recordChangeEvent(event) {
        try {
            const eventData = {
                project_id: this.projectId,
                event_type: event.event_type,
                event_data: event.event_data,
                author_id: this.userId,
                session_id: this.currentSessionId,
                occurred_at: new Date().toISOString(),
                affected_nodes: event.affected_nodes,
                affected_properties: this.extractAffectedProperties(event.event_data),
                change_magnitude: event.change_magnitude,
                workflow_state: event.workflow_state,
                approval_required: event.approval_required || false
            };
            const response = await this.apiClient.post('/api/change-events', eventData);
            const changeEvent = response.data;
            this.changeEvents.push(changeEvent);
            return changeEvent;
        }
        catch (error) {
            console.error('Failed to record change event:', error);
            throw error;
        }
    }
    async getChangeEvents(filter = {}) {
        try {
            const params = new URLSearchParams();
            params.append('project_id', this.projectId);
            Object.entries(filter).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (Array.isArray(value)) {
                        value.forEach(v => params.append(key, String(v)));
                    }
                    else {
                        params.append(key, String(value));
                    }
                }
            });
            const response = await this.apiClient.get(`/api/change-events?${params}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get change events:', error);
            throw error;
        }
    }
    // Annotation Management
    async addAnnotation(snapshotId, annotation) {
        try {
            const annotationData = {
                snapshot_id: snapshotId,
                annotation_type: annotation.annotation_type || 'comment',
                title: annotation.title,
                content_markdown: annotation.content_markdown,
                priority: annotation.priority || 'normal',
                target_element_id: annotation.target_element_id,
                target_coordinates: annotation.target_coordinates,
                author_id: this.userId
            };
            const response = await this.apiClient.post('/api/version-annotations', annotationData);
            return response.data;
        }
        catch (error) {
            console.error('Failed to add annotation:', error);
            throw error;
        }
    }
    async getAnnotations(snapshotId) {
        try {
            const response = await this.apiClient.get(`/api/version-annotations?snapshot_id=${snapshotId}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get annotations:', error);
            throw error;
        }
    }
    async resolveAnnotation(annotationId, resolutionNote) {
        try {
            const response = await this.apiClient.put(`/api/version-annotations/${annotationId}/resolve`, {
                resolved_by: this.userId,
                resolution_note: resolutionNote
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to resolve annotation:', error);
            throw error;
        }
    }
    // Utility Methods
    extractNodeIds(graphData) {
        return graphData?.nodes?.map((node) => node.id) || [];
    }
    extractAffectedProperties(eventData) {
        // Extract property names from event data
        const properties = [];
        if (eventData.property_changes) {
            properties.push(...Object.keys(eventData.property_changes));
        }
        if (eventData.modified_properties) {
            properties.push(...eventData.modified_properties);
        }
        return properties;
    }
    calculateChangeMagnitude(graphData) {
        // Simple heuristic for change magnitude
        const nodeCount = graphData?.nodes?.length || 0;
        const edgeCount = graphData?.edges?.length || 0;
        // Normalize to 0-10 scale
        return Math.min(10, Math.log10(nodeCount + edgeCount + 1) * 2);
    }
    // Statistics and Analytics
    async getVersionStatistics() {
        try {
            const response = await this.apiClient.get(`/api/version-statistics?project_id=${this.projectId}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get version statistics:', error);
            throw error;
        }
    }
    // Cleanup and Maintenance
    startNewSession() {
        this.currentSessionId = crypto.randomUUID();
    }
    async cleanupOldData(options = {}) {
        try {
            const response = await this.apiClient.post('/api/version-cleanup', {
                project_id: this.projectId,
                days_old: options.days_old || 90,
                keep_milestones: options.keep_milestones !== false,
                keep_tagged_versions: options.keep_tagged_versions !== false
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to cleanup old data:', error);
            throw error;
        }
    }
}
