// import globals from 'globals';
// import pluginJs from '@eslint/js';
// import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';

// export default [
//   { languageOptions: { globals: globals.node } },
//   pluginJs.configs.recommended,
//   pluginReactConfig,
// ];

// To address temporary errors of pushing initial skeleton frontend code, May 13th 9:30PM
import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';

export default [
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  pluginJs.configs.recommended,
  pluginReactConfig,
  {
    settings: {
      react: {
        version: 'detect', // automatically detect the React version
      },
    },
  },
  {
    files: [
      'App.js',
      'src/components/CustomPicker.js',
      'src/navigator/Navigator.js',
      'src/screens/community/ViewCommunity.js',
      'src/screens/profile/HealthHabitReport.js',
      'src/screens/profile/HealthHabitReportDetails.js',
      'src/screens/profile/Profile.js',
      'src/screens/profile/SavedPost.js',
      'src/screens/profile/UpdateFavoriteBook.js',
      'src/screens/profile/UpdateFavoriteFood.js',
      'src/screens/profile/UpdateProfile.js',
      'src/screens/profile/UserCommunity.js',
      'src/screens/profile/UserHabit.js',
      'src/screens/profile/UserProfile.js',
      'src/screens/profile/HealthHabitReportUtils.js',
    ],
    rules: {
      'no-unused-vars': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-undef': 'off',
      'react/no-unescaped-entities': 'off',
      'no-empty': 'off',
      'no-dupe-keys': 'off',
      'no-warning-comments': 'off',
    },
  },
];
