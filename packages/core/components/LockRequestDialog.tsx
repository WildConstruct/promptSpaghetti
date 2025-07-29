// Epic 9.4.3 - Lock Request Dialog Component
// Dialog for requesting locks on resources
import React, { useState, useEffect } from 'react';
import { X, Lock, Clock, AlertTriangle, Info } from 'lucide-react';
interface LockRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRequest: (resourceId: string, lockType: string, reason?: string) => void;
  resourceId?: string | null;
  userId: string;
  export const LockRequestDialog: React.FC<LockRequestDialogProps> = ({,)
  isOpen,
  onClose,
  onRequest,
  resourceId,
  userId
}) => {
  const [selectedResource, setSelectedResource] = useState(resourceId || '');
  const [lockType, setLockType] = useState<string>('edit');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (resourceId) {
      setSelectedResource(resourceId);
  }, [resourceId]);
  const lockTypes = [;
    {
  value: 'edit',
  label: 'Edit Lock',
  description: 'Prevents others from editing this resource',
  icon: Lock,
  color: 'text-blue-500',
}
    {
  value: 'state_change',
  label: 'State Change Lock',
  description: 'Prevents workflow state changes',
  icon: Clock,
  color: 'text-orange-500',
}
    {
  value: 'delete',
  label: 'Delete Lock',
  description: 'Prevents resource deletion',
  icon: AlertTriangle,
  color: 'text-red-500',
}
    {
      value: 'admin',
      label: 'Admin Lock',
      description: 'Administrative lock with full restrictions',
      icon: AlertTriangle,
      color: 'text-purple-500'];
  const durationOptions = [;
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
    { value: 480, label: '8 hours' },
    { value: 1440, label: '24 hours' }
  ];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (!selectedResource) {
        throw new Error('Please select a resource');
      if (!reason.trim()) {
        throw new Error('Please provide a reason for the lock');
      await onRequest(selectedResource, lockType, reason);
      onClose();
    } catch (error) {
  setError(error instanceof Error ? error.message : 'Failed to request lock');
} finally {
      setIsSubmitting(false);
  };
  const handleCancel = () => {
    setSelectedResource('');
    setLockType('edit');
    setReason('');
    setDuration(60);
    setError(null);
    onClose();
  };
  if (!isOpen) return null;
  return;
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Request Lock</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Display */}
          {error && ()
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}
          {/* Resource Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource ID
            </label>
            <input
              type="text"
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              placeholder="Enter resource ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              The unique identifier of the resource you want to lock
            </p>
          </div>
          {/* Lock Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Lock Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lockTypes.map((type) => {
                const Icon = type.icon;
                return;
                  <div key={type.value}>
                    <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="lockType"
                        value={type.value}
                        checked={lockType === type.value}
                        onChange={(e) => setLockType(e.target.value)}
                        className="mt-1"
                      />
                      <Icon className={`h-5 w-5 ${type.color} mt-0.5`} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {type.label}
                        </p>
                        <p className="text-sm text-gray-500">
                          {type.description}
                        </p>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Duration Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {durationOptions.map((option) => ()
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              How long should the lock be active?
            </p>
          </div>
          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Please explain why you need this lock..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              A brief explanation of why you need this lock
            </p>
          </div>
          {/* Lock Policy Information */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Lock Policy</p>
                <ul className="space-y-1 text-blue-600">
                  <li>• Locks automatically expire after the specified duration</li>
                  <li>• You can release your own locks at any time</li>
                  <li>• Administrators may break locks if necessary</li>
                  <li>• Conflicting lock requests may be queued</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Requesting...' : 'Request Lock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};