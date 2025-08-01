import React, { useState, useEffect } from 'react';
import { Modal, Steps, Button, Form, Select, Checkbox, Alert, Typography } from 'antd';
import { RestoreOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined }
  LoadingOutlined 
 from '@ant-design/icons';
import { RestorationPreview } from './RestorationPreview';
import { RestorationConfirmation } from './RestorationConfirmation';
import { RestoreProgressPanel } from './RestoreProgressPanel';
import { RestorationConfig, 
  RestorationPreviewResponse, 
  RestorationAttempt,
  RestorationType,
  RestorationStrategy }
  RestorationProgressResponse
 from '../../types/restoration';
import { useRestoration } from '../../hooks/useRestoration';
const { Step } = Steps;
const { Title, Text } = Typography;
const { Option } = Select;


interface RestorationWizardProps { visible: boolean;
  onClose: () => void;
  projectId: string;
  sourceSnapshotId: string;
  targetSnapshotId?: string;
  onSuccess?: (attempt: RestorationAttempt) => void;
  onError?: (error: string) => void;
  interface WizardStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  const wizardSteps: WizardStep = [
  {
  title: 'Configure';
  description: 'Set restoration options';
  icon: <RestoreOutlined /> }



  { title: 'Preview'
  description: 'Review changes'
  icon: <ExclamationCircleOutlined /> }

  { title: 'Confirm'
  description: 'Confirm restoration'
  icon: <CheckCircleOutlined /> }

  { title: 'Progress'
  description: 'Monitor progress'
  icon: <LoadingOutlined />];
  export const RestorationWizard: React.FC<RestorationWizardProps> = ({)
  visible
  onClose
  projectId
  sourceSnapshotId
  targetSnapshotId
  onSuccess }
  onError
}) => { const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [config, setConfig] = useState<RestorationConfig>({)
  restorationType: 'full'
  restorationStrategy: 'replace'
  preserveCurrentChanges: false
  createBackup: true
  notifyOnCompletion: true }
});
  const [preview, setPreview] = useState<RestorationPreviewResponse | null>(null);
  const [restorationAttempt, setRestorationAttempt] = useState<RestorationAttempt | null>(null);
  const [progress, setProgress] = useState<RestorationProgressResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { generatePreview
    createRestoration
    getProgress }
    cancelRestoration 
 = useRestoration();
  // Reset state when modal opens/closes
  useEffect(() => { if (visible) {
  setCurrentStep(0);
  setConfig({)
  restorationType: 'full'
  restorationStrategy: 'replace'
  preserveCurrentChanges: false
  createBackup: true
  notifyOnCompletion: true }
});
      setPreview(null);
      setRestorationAttempt(null);
      setProgress(null);
      setError(null);
      form.resetFields();
  }, [visible, form]);
  // Poll for progress updates
  useEffect(() => { let interval: NodeJS.Timeout;
  if (restorationAttempt && currentStep === 3) {
  interval = setInterval(async () => {
  try {
  const progressData = await getProgress(restorationAttempt.id);
  setProgress(progressData);
  if (progressData.status === 'completed') {
  clearInterval(interval);
  onSuccess?.(restorationAttempt) } else if (progressData.status === 'failed') { clearInterval(interval);
            setError(progressData.errorMessage || 'Restoration failed');
            onError?.(progressData.errorMessage || 'Restoration failed') } catch (error) { console.error('Failed to get progress:', error) }, 1000);
    return () => { if (interval) clearInterval(interval) };
  }, [restorationAttempt, currentStep, getProgress, onSuccess, onError]);
  const handleNext = async () => {
    if (currentStep === 0) {
      // Configuration step - validate and generate preview
      try {
        const values = await form.validateFields();
        const updatedConfig = { ...config, ...values };
        setConfig(updatedConfig);
        setLoading(true);
        const previewData = await generatePreview({ )
  projectId
  sourceSnapshotId
  targetSnapshotId
  config: updatedConfig }
});
        setPreview(previewData);
        setCurrentStep(1);
 catch (error) { console.error('Failed to generate preview:', error);
  setError('Failed to generate preview. Please try again.') } finally { setLoading(false) } else if (currentStep === 1) { // Preview step - move to confirmation
      setCurrentStep(2) } else if (currentStep === 2) { // Confirmation step - start restoration
      try {
        setLoading(true);
        const attempt = await createRestoration({)
  projectId
          sourceSnapshotId
          targetSnapshotId }
          config
        });
        setRestorationAttempt(attempt);
        setCurrentStep(3);
 catch (error) { console.error('Failed to start restoration:', error);
  setError('Failed to start restoration. Please try again.') } finally { setLoading(false) };
  const handlePrevious = () => { setCurrentStep(Math.max(0, currentStep - 1));
    setError(null) };
  const handleCancel = async () => { if (restorationAttempt && currentStep === 3) {
      try {
        await cancelRestoration(restorationAttempt.id) } catch (error) { console.error('Failed to cancel restoration:', error);
  onClose() };
  const canGoNext = () => { if (currentStep === 0) return true;
    if (currentStep === 1) return preview !== null;
    if (currentStep === 2) return true;
    return false };
  const canGoPrevious = () => { return currentStep > 0 && currentStep < 3 };
  const renderStepContent = () => {
    switch (currentStep) {
    case 0:
      return;
        <Form
          form={form}
          layout="vertical"
          initialValues={config}
          onValuesChange={(changedValues) => {
            setConfig(prev => ({ ...prev, ...changedValues }));
}
        >
          <Form.Item
            name="restorationType"
            label="Restoration Type"
            tooltip="Choose how much of the snapshot to restore"
          >
            <Select>
              <Option value="full">Full Restoration</Option>
              <Option value="partial">Partial Restoration</Option>
              <Option value="selective">Selective Restoration</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="restorationStrategy"
            label="Restoration Strategy"
            tooltip="Choose how to handle conflicts with current state"
          >
            <Select>
              <Option value="replace">Replace Current State</Option>
              <Option value="merge">Merge with Current State</Option>
              <Option value="selective">Selective Merge</Option>
            </Select>
          </Form.Item>
          <Form.Item name="preserveCurrentChanges" valuePropName="checked">
            <Checkbox>
                Preserve current changes where possible
            </Checkbox>
          </Form.Item>
          <Form.Item name="createBackup" valuePropName="checked">
            <Checkbox>
                Create backup before restoration
            </Checkbox>
          </Form.Item>
          <Form.Item name="notifyOnCompletion" valuePropName="checked">
            <Checkbox>
                Notify when restoration completes
            </Checkbox>
          </Form.Item>
        </Form>
      );
    case 1:
      return preview ? ()
        <RestorationPreview
          preview={preview}
          config={config}
          onConflictResolve={ (conflictId, strategy) => {
  // Handle conflict resolution
  console.log('Resolving conflict:', conflictId, strategy) }}
        />
      ) : ()
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
          <Title level={4}>Generating Preview...</Title>
          <Text type="secondary">
              Please wait while we analyze the changes that will be made.
          </Text>
        </div>
      );
    case 2:
      return preview ? ()
        <RestorationConfirmation
          preview={preview}
          config={config}
          onConfirm={() => handleNext()}
          onCancel={() => handlePrevious()}
        />
      ) : null;
    case 3:
      return progress ? ()
        <RestoreProgressPanel
          progress={progress}
          onCancel={() => handleCancel()}
          showDetails={true}
        />
      ) : ()
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
          <Title level={4}>Starting Restoration...</Title>
          <Text type="secondary">
              Please wait while we prepare the restoration process.
          </Text>
        </div>
      );
    default:
      return null;
  };
  const getModalTitle = () => { const stepTitles = [
      'Configure Restoration',
      'Preview Changes',
      'Confirm Restoration' }
      'Restoration in Progress'
    ];
    return stepTitles[currentStep] || 'Version Restoration';
  };
  const getModalWidth = () => { switch (currentStep) {
  case 1:,
  case 2:,
  return 900;
  case 3:,
  return 700;
  default: }
  return 600;
};
  return;
    <Modal
      title={getModalTitle()}
      visible={visible}
      onCancel={handleCancel}
      width={getModalWidth()}
      footer={null}
      destroyOnClose
      maskClosable={false}
    >
      <div style={{ marginBottom: '24px' }}>
        <Steps current={currentStep} size="small">
          {wizardSteps.map((step, index) => ()
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>
      </div>
      {error && ()
        <Alert
          type="error"
          message="Error"
          description={error}
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: '16px' }}
        />
      )}
      <div style={{ minHeight: '400px' }}>
        {renderStepContent()}
      </div>
      {currentStep < 3 && ()
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
          <Button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
          >
            Previous
          </Button>
          <div>
            <Button
              onClick={handleCancel}
              style={{ marginRight: '8px' }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleNext}
              disabled={!canGoNext()}
              loading={loading}
            >
              {currentStep === 2 ? 'Start Restoration' : 'Next'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};