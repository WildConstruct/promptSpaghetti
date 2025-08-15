/**
 * React Native-specific Modal implementation
 */

import React from 'react';
import { Modal } from '../../components/Modal';
import { ModalProps } from '../../types';
import { usePlatformAdapter } from '../usePlatformAdapter';

export interface RNModalProps extends ModalProps {
  animationType?: 'none' | 'slide' | 'fade';
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
  supportedOrientations?: ('portrait' | 'portrait-upside-down' | 'landscape' | 'landscape-left' | 'landscape-right')[];
  onOrientationChange?: (event: { orientation: string }) => void;
  statusBarTranslucent?: boolean;
  hardwareAccelerated?: boolean;
  testID?: string;
}

export const RNModal: React.FC<RNModalProps> = ({
  animationType = 'fade',
  presentationStyle = 'overFullScreen',
  supportedOrientations = ['portrait'],
  onOrientationChange,
  statusBarTranslucent = false,
  hardwareAccelerated = true,
  testID,
  isOpen,
  onClose,
  children,
  ...props
}) => {
  const adapter = usePlatformAdapter();

  // Try to use React Native Modal if available, fallback to web implementation
  let RNModalComponent;
  try {
    RNModalComponent = require('react-native').Modal;
  } catch {
    // Fallback to web modal
    RNModalComponent = null;
  }

  const rnProps = {
    visible: isOpen,
    animationType,
    presentationStyle,
    supportedOrientations,
    onOrientationChange,
    statusBarTranslucent,
    hardwareAccelerated,
    testID: testID || props.testId,
    onRequestClose: onClose, // Required on Android
    // Remove web-specific properties
    style: {
      ...props.style,
      // Remove web-specific CSS properties
      transition: undefined,
      opacity: undefined,
      transform: undefined,
    },
  };

  if (RNModalComponent) {
    return (
      <RNModalComponent {...rnProps}>
        <Modal
          {...props}
          isOpen={true} // Always true since RN Modal handles visibility
          onClose={onClose}
          style={{
            ...rnProps.style,
            // React Native Modal specific styling
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          {children}
        </Modal>
      </RNModalComponent>
    );
  }

  // Fallback to web modal with React Native-like behavior
  return (
    <Modal
      {...props}
      isOpen={isOpen}
      onClose={onClose}
      style={{
        ...rnProps.style,
        // Simulate React Native modal behavior on web
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      {children}
    </Modal>
  );
};
