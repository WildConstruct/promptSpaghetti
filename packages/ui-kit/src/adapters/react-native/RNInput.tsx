/**
 * React Native-specific Input implementation
 */

import React from 'react';
import { Input, InputProps, TextArea, TextAreaProps } from '../../components/Input';
import { usePlatformAdapter } from '../usePlatformAdapter';

export interface RNInputProps extends InputProps {
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'visible-password' | 'ascii-capable' | 'numbers-and-punctuation' | 'url' | 'name-phone-pad' | 'twitter' | 'web-search';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send' | 'none' | 'previous' | 'default' | 'emergency-call' | 'google' | 'join' | 'route' | 'yahoo';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  blurOnSubmit?: boolean;
  clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
  enablesReturnKeyAutomatically?: boolean;
  maxLength?: number;
  multiline?: boolean;
  secureTextEntry?: boolean;
  selectTextOnFocus?: boolean;
  selectionColor?: string;
  testID?: string;
  textContentType?: 'none' | 'URL' | 'addressCity' | 'addressCityAndState' | 'addressState' | 'countryName' | 'creditCardNumber' | 'emailAddress' | 'familyName' | 'fullStreetAddress' | 'givenName' | 'jobTitle' | 'location' | 'middleName' | 'name' | 'namePrefix' | 'nameSuffix' | 'nickname' | 'organizationName' | 'postalCode' | 'streetAddressLine1' | 'streetAddressLine2' | 'sublocality' | 'telephoneNumber' | 'username' | 'password' | 'newPassword' | 'oneTimeCode';
}

export const RNInput: React.FC<RNInputProps> = ({
  keyboardType = 'default',
  returnKeyType = 'done',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  autoFocus = false,
  blurOnSubmit = true,
  clearButtonMode = 'while-editing',
  enablesReturnKeyAutomatically = false,
  maxLength,
  multiline = false,
  secureTextEntry = false,
  selectTextOnFocus = false,
  selectionColor,
  testID,
  textContentType,
  type,
  ...props
}) => {
  const adapter = usePlatformAdapter();

  // Map web input types to React Native keyboard types
  const getKeyboardType = () => {
    if (keyboardType !== 'default') return keyboardType;
    
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
    if (textContentType) return textContentType;
    
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
    return (
      <TextArea
        {...props}
        {...rnProps}
        style={rnProps.style}
      />
    );
  }

  return (
    <Input
      {...props}
      {...rnProps}
      style={rnProps.style}
    />
  );
};

export interface RNTextAreaProps extends TextAreaProps {
  keyboardType?: RNInputProps['keyboardType'];
  returnKeyType?: RNInputProps['returnKeyType'];
  autoCapitalize?: RNInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  selectionColor?: string;
  testID?: string;
  textContentType?: RNInputProps['textContentType'];
}

export const RNTextArea: React.FC<RNTextAreaProps> = ({
  keyboardType = 'default',
  returnKeyType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  autoFocus = false,
  maxLength,
  selectionColor,
  testID,
  textContentType,
  ...props
}) => {
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

  return (
    <TextArea
      {...props}
      {...rnProps}
      style={rnProps.style}
    />
  );
};