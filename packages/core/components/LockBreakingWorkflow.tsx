// Epic 9.4.3 - Lock Breaking Workflow Component
// Workflow for breaking existing locks with proper authorization

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Shield, Clock, User, FileText } from 'lucide-react';
import { WorkflowLock } from '../types/locking';

interface LockBreakingWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string;
  onBreakLock: (lockId: string, resourceId: string, justification: string) => void;
  userId: string;
}

export const LockBreakingWorkflow: React.FC<LockBreakingWorkflowProps> = ({
  isOpen,
  onClose,
  resourceId,
  onBreakLock,
  userId
}) => {
  const [currentStep, setCurrentStep] = useState<'select' | 'confirm' | 'justification'>('select');
  const [selectedLock, setSelectedLock] = useState<WorkflowLock | null>(null);
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locks, setLocks] = useState<WorkflowLock[]>([]);
  const [userPermissions, setUserPermissions] = useState<{
    canBreakLocks: boolean;
    requiresJustification: boolean;
    roles: string[];
  }>({
    canBreakLocks: false,
    requiresJustification: true,
    roles: []
  });

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    if (isOpen && resourceId) {
      // Mock locks data
      setLocks([
        {
          id: 'lock-1',
          resource_id: resourceId,
          locked_by: 'user-456',
          lock_type: 'edit',
          lock_reason: 'Working on content updates',
          locked_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          auto_release: true,
          workspace_id: 'workspace-123'
        }
      ]);

      // Mock user permissions
      setUserPermissions({
        canBreakLocks: true,
        requiresJustification: true,
        roles: ['admin', 'editor']
      });
    }
  }, [isOpen, resourceId]);

  const handleLockSelect = (lock: WorkflowLock) => {
    setSelectedLock(lock);
    setCurrentStep('confirm');
  };

  const handleConfirmBreak = () => {
    if (userPermissions.requiresJustification) {
      setCurrentStep('justification');
    } else {
      handleBreakLock();
    }
  };

  const handleBreakLock = async () => {
    if (!selectedLock) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (userPermissions.requiresJustification && !justification.trim()) {
        throw new Error('Justification is required');
      }

      await onBreakLock(selectedLock.id, resourceId, justification);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to break lock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCurrentStep('select');
    setSelectedLock(null);
    setJustification('');
    setError(null);
    onClose();
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff < 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">Break Lock</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Step 1: Select Lock */}
          {currentStep === 'select' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium mb-1">Lock Breaking Warning</p>
                    <p>
                      Breaking a lock will immediately release it and notify the current owner.
                      Only break locks when absolutely necessary.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Select lock to break:
                </h3>
                <div className="space-y-2">
                  {locks.map((lock) => (
                    <div
                      key={lock.id}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleLockSelect(lock)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {lock.lock_type.charAt(0).toUpperCase() + lock.lock_type.slice(1)} Lock
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {lock.locked_by}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTimeRemaining(lock.expires_at)}
                              </span>
                            </div>
                            {lock.lock_reason && (
                              <p className="text-sm text-gray-600 mt-1">
                                Reason: {lock.lock_reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Created: {new Date(lock.locked_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Your Permissions</p>
                    <ul className="space-y-1">
                      <li>• Can break locks: {userPermissions.canBreakLocks ? 'Yes' : 'No'}</li>
                      <li>• Justification required: {userPermissions.requiresJustification ? 'Yes' : 'No'}</li>
                      <li>• Roles: {userPermissions.roles.join(', ')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Confirm Break */}
          {currentStep === 'confirm' && selectedLock && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">Confirm Lock Breaking</p>
                    <p>
                      Are you sure you want to break this lock? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Lock Details:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium">
                      {selectedLock.lock_type.charAt(0).toUpperCase() + selectedLock.lock_type.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Owner:</span>
                    <span className="ml-2 font-medium">{selectedLock.locked_by}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedLock.locked_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Expires:</span>
                    <span className="ml-2 font-medium">
                      {formatTimeRemaining(selectedLock.expires_at)}
                    </span>
                  </div>
                  {selectedLock.lock_reason && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Reason:</span>
                      <span className="ml-2 font-medium">{selectedLock.lock_reason}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('select')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBreak}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Confirm Break
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Justification */}
          {currentStep === 'justification' && selectedLock && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start space-x-2">
                  <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Justification Required</p>
                    <p>
                      Please provide a detailed justification for breaking this lock.
                      This will be logged and sent to the lock owner.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={4}
                  placeholder="Please explain why you need to break this lock..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Be specific about the urgency and business need
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('confirm')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleBreakLock}
                  disabled={isSubmitting || !justification.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Breaking Lock...' : 'Break Lock'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};