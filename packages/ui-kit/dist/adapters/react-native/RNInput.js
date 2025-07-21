import { jsx as _jsx } from "react/jsx-runtime";
import { Input, TextArea } from '../../components/Input';
import { usePlatformAdapter } from '../usePlatformAdapter';
export const RNInput = ({ keyboardType = 'default', returnKeyType = 'done', autoCapitalize = 'sentences', autoCorrect = true, autoFocus = false, blurOnSubmit = true, clearButtonMode = 'while-editing', enablesReturnKeyAutomatically = false, maxLength, multiline = false, secureTextEntry = false, selectTextOnFocus = false, selectionColor, testID, textContentType, type, ...props }) => {
    const adapter = usePlatformAdapter();
    // Map web input types to React Native keyboard types
    const getKeyboardType = () => {
        if (keyboardType !== 'default')
            return keyboardType;
        switch (type) {
            case 'email':
                return 'email-address';
            case 'number':
                return 'numeric';
            case 'tel':
                return 'phone-pad';
            case 'url':
                return 'url';
            default:
                return 'default';
        }
    };
    // Map web input types to React Native text content types
    const getTextContentType = () => {
        if (textContentType)
            return textContentType;
        switch (type) {
            case 'email':
                return 'emailAddress';
            case 'password':
                return 'password';
            case 'tel':
                return 'telephoneNumber';
            case 'url':
                return 'URL';
            default:
                return 'none';
        }
    };
    const rnProps = {
        keyboardType: getKeyboardType(),
        returnKeyType,
        autoCapitalize,
        autoCorrect,
        autoFocus,
        blurOnSubmit,
        clearButtonMode,
        enablesReturnKeyAutomatically,
        maxLength,
        multiline,
        secureTextEntry: secureTextEntry || type === 'password',
        selectTextOnFocus,
        selectionColor,
        testID: testID || props.testId,
        textContentType: getTextContentType(),
        // Remove web-specific properties
        style: {
            ...props.style,
            // Remove web-specific CSS properties
            WebkitTapHighlightColor: undefined,
            WebkitAppearance: undefined,
            outline: undefined,
            resize: undefined
        }
    };
    if (multiline) {
        return (_jsx(TextArea, { ...props, ...rnProps, style: rnProps.style }));
    }
    return (_jsx(Input, { ...props, ...rnProps, style: rnProps.style }));
};
export const RNTextArea = ({ keyboardType = 'default', returnKeyType = 'default', autoCapitalize = 'sentences', autoCorrect = true, autoFocus = false, maxLength, selectionColor, testID, textContentType, ...props }) => {
    const rnProps = {
        keyboardType,
        returnKeyType,
        autoCapitalize,
        autoCorrect,
        autoFocus,
        maxLength,
        selectionColor,
        testID: testID || props.testId,
        textContentType,
        multiline: true,
        // Remove web-specific properties
        style: {
            ...props.style,
            WebkitTapHighlightColor: undefined,
            WebkitAppearance: undefined,
            outline: undefined,
            resize: undefined,
            // React Native TextInput specific styling
            textAlignVertical: 'top' // Ensure text starts at top in multiline
        }
    };
    return (_jsx(TextArea, { ...props, ...rnProps, style: rnProps.style }));
};
//# sourceMappingURL=RNInput.js.map