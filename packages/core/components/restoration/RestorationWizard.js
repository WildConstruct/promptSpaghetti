import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Modal, Steps, Button, Form, Select, Checkbox, Alert, Typography } from 'antd';
import { RestoreOutlined, ExclamationCircleOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { RestorationPreview } from './RestorationPreview';
import { RestorationConfirmation } from './RestorationConfirmation';
import { RestoreProgressPanel } from './RestoreProgressPanel';
import { useRestoration } from '../../hooks/useRestoration';
const { Step } = Steps;
const { Title, Text } = Typography;
const { Option } = Select;
const wizardSteps = [
    {
        title: 'Configure',
        description: 'Set restoration options',
        icon: _jsx(RestoreOutlined, {}),
    },
    {
        title: 'Preview',
        description: 'Review changes',
        icon: _jsx(ExclamationCircleOutlined, {}),
    },
    {
        title: 'Confirm',
        description: 'Confirm restoration',
        icon: _jsx(CheckCircleOutlined, {}),
    },
    {
        title: 'Progress',
        description: 'Monitor progress',
        icon: _jsx(LoadingOutlined, {}),
    },
];
export const RestorationWizard = ({ visible, onClose, projectId, sourceSnapshotId, targetSnapshotId, onSuccess, onError, }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [config, setConfig] = useState({
        restorationType: 'full',
        restorationStrategy: 'replace',
        preserveCurrentChanges: false,
        createBackup: true,
        notifyOnCompletion: true,
    });
    const [preview, setPreview] = useState(null);
    const [restorationAttempt, setRestorationAttempt] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { generatePreview, createRestoration, getProgress, cancelRestoration } = useRestoration();
    // Reset state when modal opens/closes
    useEffect(() => {
        if (visible) {
            setCurrentStep(0);
            setConfig({
                restorationType: 'full',
                restorationStrategy: 'replace',
                preserveCurrentChanges: false,
                createBackup: true,
                notifyOnCompletion: true,
            });
            setPreview(null);
            setRestorationAttempt(null);
            setProgress(null);
            setError(null);
            form.resetFields();
        }
    }, [visible, form]);
    // Poll for progress updates
    useEffect(() => {
        let interval;
        if (restorationAttempt && currentStep === 3) {
            interval = setInterval(async () => {
                try {
                    const progressData = await getProgress(restorationAttempt.id);
                    setProgress(progressData);
                    if (progressData.status === 'completed') {
                        clearInterval(interval);
                        onSuccess?.(restorationAttempt);
                    }
                    else if (progressData.status === 'failed') {
                        clearInterval(interval);
                        setError(progressData.errorMessage || 'Restoration failed');
                        onError?.(progressData.errorMessage || 'Restoration failed');
                    }
                }
                catch (error) {
                    console.error('Failed to get progress:', error);
                }
            }, 1000);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [restorationAttempt, currentStep, getProgress, onSuccess, onError]);
    const handleNext = async () => {
        if (currentStep === 0) {
            // Configuration step - validate and generate preview
            try {
                const values = await form.validateFields();
                const updatedConfig = { ...config, ...values };
                setConfig(updatedConfig);
                setLoading(true);
                const previewData = await generatePreview({
                    projectId,
                    sourceSnapshotId,
                    targetSnapshotId,
                    config: updatedConfig,
                });
                setPreview(previewData);
                setCurrentStep(1);
            }
            catch (error) {
                console.error('Failed to generate preview:', error);
                setError('Failed to generate preview. Please try again.');
            }
            finally {
                setLoading(false);
            }
        }
        else if (currentStep === 1) {
            // Preview step - move to confirmation
            setCurrentStep(2);
        }
        else if (currentStep === 2) {
            // Confirmation step - start restoration
            try {
                setLoading(true);
                const attempt = await createRestoration({
                    projectId,
                    sourceSnapshotId,
                    targetSnapshotId,
                    config,
                });
                setRestorationAttempt(attempt);
                setCurrentStep(3);
            }
            catch (error) {
                console.error('Failed to start restoration:', error);
                setError('Failed to start restoration. Please try again.');
            }
            finally {
                setLoading(false);
            }
        }
    };
    const handlePrevious = () => {
        setCurrentStep(Math.max(0, currentStep - 1));
        setError(null);
    };
    const handleCancel = async () => {
        if (restorationAttempt && currentStep === 3) {
            try {
                await cancelRestoration(restorationAttempt.id);
            }
            catch (error) {
                console.error('Failed to cancel restoration:', error);
            }
        }
        onClose();
    };
    const canGoNext = () => {
        if (currentStep === 0)
            return true;
        if (currentStep === 1)
            return preview !== null;
        if (currentStep === 2)
            return true;
        return false;
    };
    const canGoPrevious = () => {
        return currentStep > 0 && currentStep < 3;
    };
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (_jsxs(Form, { form: form, layout: "vertical", initialValues: config, onValuesChange: (changedValues) => {
                        setConfig(prev => ({ ...prev, ...changedValues }));
                    }, children: [_jsx(Form.Item, { name: "restorationType", label: "Restoration Type", tooltip: "Choose how much of the snapshot to restore", children: _jsxs(Select, { children: [_jsx(Option, { value: "full", children: "Full Restoration" }), _jsx(Option, { value: "partial", children: "Partial Restoration" }), _jsx(Option, { value: "selective", children: "Selective Restoration" })] }) }), _jsx(Form.Item, { name: "restorationStrategy", label: "Restoration Strategy", tooltip: "Choose how to handle conflicts with current state", children: _jsxs(Select, { children: [_jsx(Option, { value: "replace", children: "Replace Current State" }), _jsx(Option, { value: "merge", children: "Merge with Current State" }), _jsx(Option, { value: "selective", children: "Selective Merge" })] }) }), _jsx(Form.Item, { name: "preserveCurrentChanges", valuePropName: "checked", children: _jsx(Checkbox, { children: "Preserve current changes where possible" }) }), _jsx(Form.Item, { name: "createBackup", valuePropName: "checked", children: _jsx(Checkbox, { children: "Create backup before restoration" }) }), _jsx(Form.Item, { name: "notifyOnCompletion", valuePropName: "checked", children: _jsx(Checkbox, { children: "Notify when restoration completes" }) })] }));
            case 1:
                return preview ? (_jsx(RestorationPreview, { preview: preview, config: config, onConflictResolve: (conflictId, strategy) => {
                        // Handle conflict resolution
                        console.log('Resolving conflict:', conflictId, strategy);
                    } })) : (_jsxs("div", { style: { textAlign: 'center', padding: '40px' }, children: [_jsx(LoadingOutlined, { style: { fontSize: '48px', marginBottom: '16px' } }), _jsx(Title, { level: 4, children: "Generating Preview..." }), _jsx(Text, { type: "secondary", children: "Please wait while we analyze the changes that will be made." })] }));
            case 2:
                return preview ? (_jsx(RestorationConfirmation, { preview: preview, config: config, onConfirm: () => handleNext(), onCancel: () => handlePrevious() })) : null;
            case 3:
                return progress ? (_jsx(RestoreProgressPanel, { progress: progress, onCancel: () => handleCancel(), showDetails: true })) : (_jsxs("div", { style: { textAlign: 'center', padding: '40px' }, children: [_jsx(LoadingOutlined, { style: { fontSize: '48px', marginBottom: '16px' } }), _jsx(Title, { level: 4, children: "Starting Restoration..." }), _jsx(Text, { type: "secondary", children: "Please wait while we prepare the restoration process." })] }));
            default:
                return null;
        }
    };
    const getModalTitle = () => {
        const stepTitles = [
            'Configure Restoration',
            'Preview Changes',
            'Confirm Restoration',
            'Restoration in Progress',
        ];
        return stepTitles[currentStep] || 'Version Restoration';
    };
    const getModalWidth = () => {
        switch (currentStep) {
            case 1:
            case 2:
                return 900;
            case 3:
                return 700;
            default:
                return 600;
        }
    };
    return (_jsxs(Modal, { title: getModalTitle(), visible: visible, onCancel: handleCancel, width: getModalWidth(), footer: null, destroyOnClose: true, maskClosable: false, children: [_jsx("div", { style: { marginBottom: '24px' }, children: _jsx(Steps, { current: currentStep, size: "small", children: wizardSteps.map((step, index) => (_jsx(Step, { title: step.title, description: step.description, icon: step.icon }, index))) }) }), error && (_jsx(Alert, { type: "error", message: "Error", description: error, showIcon: true, closable: true, onClose: () => setError(null), style: { marginBottom: '16px' } })), _jsx("div", { style: { minHeight: '400px' }, children: renderStepContent() }), currentStep < 3 && (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: '24px' }, children: [_jsx(Button, { onClick: handlePrevious, disabled: !canGoPrevious(), children: "Previous" }), _jsxs("div", { children: [_jsx(Button, { onClick: handleCancel, style: { marginRight: '8px' }, children: "Cancel" }), _jsx(Button, { type: "primary", onClick: handleNext, disabled: !canGoNext(), loading: loading, children: currentStep === 2 ? 'Start Restoration' : 'Next' })] })] }))] }));
};
