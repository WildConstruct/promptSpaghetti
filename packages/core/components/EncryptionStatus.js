import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const EncryptionStatus = ({ encryptionState, className = '', showDetails = false }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'encrypted':
                return 'text-green-500';
            case 'encrypting':
            case 'decrypting':
                return 'text-yellow-500';
            case 'not_encrypted':
                return 'text-orange-500';
            case 'error':
                return 'text-red-500';
            case 'unknown':
            default:
                return 'text-gray-500';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'encrypted':
                return '🔒';
            case 'encrypting':
            case 'decrypting':
                return '🔄';
            case 'not_encrypted':
                return '🔓';
            case 'error':
                return '⚠️';
            case 'unknown':
            default:
                return '❓';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'encrypted':
                return 'Encrypted';
            case 'encrypting':
                return 'Encrypting...';
            case 'decrypting':
                return 'Decrypting...';
            case 'not_encrypted':
                return 'Not Encrypted';
            case 'error':
                return 'Encryption Error';
            case 'unknown':
            default:
                return 'Unknown';
        }
    };
    const getStrengthColor = (strength) => {
        switch (strength) {
            case 'strong':
                return 'text-green-600';
            case 'medium':
                return 'text-yellow-600';
            case 'weak':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };
    const formatTime = (timestamp) => {
        if (!timestamp)
            return 'Never';
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };
    const formatDataSize = (size) => {
        if (!size)
            return 'Unknown';
        if (size < 1024)
            return `${size} B`;
        if (size < 1024 * 1024)
            return `${(size / 1024).toFixed(1)} KB`;
        if (size < 1024 * 1024 * 1024)
            return `${(size / (1024 * 1024)).toFixed(1)} MB`;
        return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };
    return (_jsxs("div", { className: `flex items-center space-x-2 ${className}`, children: [_jsx("span", { className: `text-sm ${getStatusColor(encryptionState.status)}`, title: `Encryption: ${getStatusText(encryptionState.status)}`, children: getStatusIcon(encryptionState.status) }), _jsx("span", { className: "text-sm text-gray-600", children: getStatusText(encryptionState.status) }), encryptionState.algorithm && (_jsx("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: encryptionState.algorithm })), encryptionState.strength && (_jsx("span", { className: `text-xs font-semibold ${getStrengthColor(encryptionState.strength)}`, title: `Encryption strength: ${encryptionState.strength}`, children: encryptionState.strength.toUpperCase() })), encryptionState.error && (_jsx("span", { className: "text-xs text-red-600 cursor-help", title: encryptionState.error, children: "\u26A0" })), showDetails && (_jsxs("div", { className: "text-xs text-gray-500 space-x-2", children: [encryptionState.lastEncrypted && (_jsxs("span", { children: ["Last encrypted: ", formatTime(encryptionState.lastEncrypted)] })), encryptionState.dataSize && (_jsxs("span", { children: ["Size: ", formatDataSize(encryptionState.dataSize)] })), encryptionState.encryptionTime && (_jsxs("span", { children: ["(", encryptionState.encryptionTime, "ms)"] }))] }))] }));
};
// Compact version for status bars
export const EncryptionStatusIcon = ({ encryptionState, onClick }) => {
    const statusColor = {
        encrypted: '#10b981', // green
        encrypting: '#f59e0b', // yellow
        decrypting: '#f59e0b', // yellow
        not_encrypted: '#f97316', // orange
        error: '#ef4444', // red
        unknown: '#6b7280' // gray
    }[encryptionState.status];
    const statusIcon = {
        encrypted: '🔒',
        encrypting: '🔄',
        decrypting: '🔄',
        not_encrypted: '🔓',
        error: '⚠️',
        unknown: '❓'
    }[encryptionState.status];
    return (_jsxs("div", { className: "cursor-pointer flex items-center space-x-1", onClick: onClick, title: `Encryption: ${encryptionState.status}${encryptionState.algorithm ? ` (${encryptionState.algorithm})` : ''}${encryptionState.error ? ` - ${encryptionState.error}` : ''}`, children: [_jsx("span", { className: "text-sm", children: statusIcon }), _jsx("svg", { width: "8", height: "8", viewBox: "0 0 8 8", fill: statusColor, className: encryptionState.status === 'encrypting' || encryptionState.status === 'decrypting' ? 'animate-pulse' : '', children: _jsx("circle", { cx: "4", cy: "4", r: "3" }) })] }));
};
// Encryption details modal/dropdown content
export const EncryptionDetails = ({ encryptionState, onEncrypt, onDecrypt, _____onChangeAlgorithm }) => {
    const isEncrypted = encryptionState.status === 'encrypted';
    const isProcessing = encryptionState.status === 'encrypting' || encryptionState.status === 'decrypting';
    const canEncrypt = encryptionState.status === 'not_encrypted' && !isProcessing;
    const canDecrypt = encryptionState.status === 'encrypted' && !isProcessing;
    const formatTime = (timestamp) => {
        if (!timestamp)
            return 'Never';
        const date = new Date(timestamp);
        return date.toLocaleString();
    };
    const formatDataSize = (size) => {
        if (!size)
            return 'Unknown';
        if (size < 1024)
            return `${size} B`;
        if (size < 1024 * 1024)
            return `${(size / 1024).toFixed(1)} KB`;
        if (size < 1024 * 1024 * 1024)
            return `${(size / (1024 * 1024)).toFixed(1)} MB`;
        return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };
    const getStrengthDetails = (algorithm) => {
        switch (algorithm) {
            case 'AES-256-GCM':
            case 'AES-256-CBC':
            case 'ChaCha20-Poly1305':
                return 'Strong encryption (256-bit)';
            case 'AES-128-GCM':
                return 'Medium encryption (128-bit)';
            case 'RSA-2048':
                return 'Medium encryption (RSA 2048-bit)';
            case 'RSA-4096':
                return 'Strong encryption (RSA 4096-bit)';
            default:
                return 'Unknown encryption strength';
        }
    };
    return (_jsx("div", { className: "p-4 bg-white rounded-lg shadow-lg border w-80", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-medium text-gray-900", children: "Encryption Status" }), _jsx(EncryptionStatusIcon, { encryptionState: encryptionState })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Status:" }), _jsx("span", { className: `font-medium ${isEncrypted ? 'text-green-600' :
                                        encryptionState.status === 'error' ? 'text-red-600' :
                                            encryptionState.status === 'not_encrypted' ? 'text-orange-600' :
                                                'text-gray-600'}`, children: encryptionState.status.replace('_', ' ') })] }), encryptionState.algorithm && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Algorithm:" }), _jsx("span", { className: "text-gray-900 font-mono text-xs", children: encryptionState.algorithm })] })), encryptionState.strength && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Strength:" }), _jsx("span", { className: `font-medium ${encryptionState.strength === 'strong' ? 'text-green-600' :
                                        encryptionState.strength === 'medium' ? 'text-yellow-600' :
                                            'text-red-600'}`, children: encryptionState.strength })] })), encryptionState.keyId && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Key ID:" }), _jsxs("span", { className: "text-gray-900 font-mono text-xs", children: [encryptionState.keyId.substring(0, 8), "..."] })] })), encryptionState.lastEncrypted && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Last Encrypted:" }), _jsx("span", { className: "text-gray-900 text-xs", children: formatTime(encryptionState.lastEncrypted) })] })), encryptionState.lastDecrypted && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Last Decrypted:" }), _jsx("span", { className: "text-gray-900 text-xs", children: formatTime(encryptionState.lastDecrypted) })] })), encryptionState.dataSize && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Data Size:" }), _jsx("span", { className: "text-gray-900", children: formatDataSize(encryptionState.dataSize) })] })), encryptionState.encryptionTime && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Processing Time:" }), _jsxs("span", { className: "text-gray-900", children: [encryptionState.encryptionTime, "ms"] })] })), encryptionState.algorithm && (_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-gray-600 mb-1", children: "Security Details:" }), _jsx("span", { className: "text-xs text-gray-700 bg-gray-50 p-2 rounded", children: getStrengthDetails(encryptionState.algorithm) })] })), encryptionState.error && (_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-gray-600 mb-1", children: "Error:" }), _jsx("span", { className: "text-red-600 text-xs bg-red-50 p-2 rounded", children: encryptionState.error })] }))] }), _jsxs("div", { className: "flex space-x-2 pt-2 border-t", children: [canEncrypt && onEncrypt && (_jsx("button", { onClick: onEncrypt, className: "flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center justify-center", children: "\uD83D\uDD12 Encrypt" })), canDecrypt && onDecrypt && (_jsx("button", { onClick: onDecrypt, className: "flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center justify-center", children: "\uD83D\uDD13 Decrypt" })), isProcessing && (_jsx("div", { className: "flex-1 px-3 py-1 bg-gray-200 text-gray-600 rounded text-sm text-center", children: "Processing..." }))] })] }) }));
};
