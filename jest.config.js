module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules[\\\\/](?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|react-native-screens|@react-native-async-storage|@gluestack-ui|@gluestack-style|react-native-svg)',
  ],
  setupFiles: ['./jest.setup.js'],
};
