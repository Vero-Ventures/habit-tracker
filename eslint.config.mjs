// import globals from 'globals';
// import pluginJs from '@eslint/js';
// import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';

// export default [
//   { languageOptions: { globals: globals.node } },
//   pluginJs.configs.recommended,
//   pluginReactConfig,
// ];

import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        require: true,
      },
    },
  },
  pluginJs.configs.recommended,
  pluginReactConfig,
  {
    rules: {
      'react/prop-types': 'warn',
      'no-unused-vars': 'warn',
    },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];