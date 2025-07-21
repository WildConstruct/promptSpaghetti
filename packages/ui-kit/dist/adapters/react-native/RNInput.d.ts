/**
 * React Native-specific Input implementation
 */
import React from 'react';
import { InputProps, TextAreaProps } from '../../components/Input';
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
export declare const RNInput: React.FC<RNInputProps>;
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
export declare const RNTextArea: React.FC<RNTextAreaProps>;
//# sourceMappingURL=RNInput.d.ts.map