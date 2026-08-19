/* eslint-env jest */
jest.mock('react-native-screens', () => {
  const View = require('react-native').View;
  return {
    enableScreens: jest.fn(),
    screensEnabled: jest.fn(() => true),
    ScreenContainer: View,
    Screen: View,
    NativeScreen: View,
    NativeScreenContainer: View,
    ScreenStack: View,
    ScreenStackHeaderConfig: View,
    ScreenStackHeaderSubview: View,
    SearchBar: View,
    FullWindowOverlay: View,
    compatibilityFlags: {
      usesNewAndroidHeaderHeightImplementation: false,
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  const storage = new Map();
  return {
    setItem: jest.fn((k, v) => {
      storage.set(k, v);
      return Promise.resolve();
    }),
    getItem: jest.fn(k => Promise.resolve(storage.get(k) ?? null)),
    removeItem: jest.fn(k => {
      storage.delete(k);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      storage.clear();
      return Promise.resolve();
    }),
  };
});

jest.mock('@gluestack-ui/themed', () => {
  const { View, Text, TextInput, TouchableOpacity } = require('react-native');
  return {
    GluestackUIProvider: ({ children }) => children,
    Box: View,
    VStack: View,
    HStack: View,
    Center: View,
    Heading: Text,
    Text: Text,
    Card: View,
    Badge: View,
    BadgeText: Text,
    BadgeIcon: View,
    Button: TouchableOpacity,
    ButtonText: Text,
    ButtonSpinner: View,
    ButtonIcon: View,
    Input: View,
    InputField: TextInput,
    Textarea: View,
    TextareaInput: TextInput,
    FormControl: View,
    FormControlLabel: View,
    FormControlLabelText: Text,
    FormControlError: View,
    FormControlErrorText: Text,
    Alert: View,
    AlertText: Text,
    Spinner: View,
    Divider: View,
    Modal: ({ isOpen, children }) => (isOpen ? children : null),
    ModalBackdrop: View,
    ModalContent: View,
    ModalHeader: View,
    ModalCloseButton: TouchableOpacity,
    ModalBody: View,
    ModalFooter: View,
  };
});

jest.mock('@gluestack-ui/config', () => ({
  config: {},
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const createMockIcon = name => {
    const MockIcon = props =>
      React.createElement(View, { ...props, testID: `icon-${name}` });
    MockIcon.displayName = name;
    return MockIcon;
  };
  return new Proxy(
    {},
    {
      get: (_target, prop) => createMockIcon(prop),
    },
  );
});
