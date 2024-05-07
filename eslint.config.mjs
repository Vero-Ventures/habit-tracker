import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import recommendedReactConfig from 'eslint-plugin-react/configs/recommended.js';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        require: "readonly" // manually define 'require' if used 
      },
    },
    parserOptions: {
      ecmaVersion: 2020, // ECMAScript version
      sourceType: 'module', // set module type
      ecmaFeatures: {
        jsx: true,  // enable JSX 
      }
    },
    settings: {
      react: {
        version: "detect", // automatically detect React version
      },
    },
  },
  pluginJs.configs.recommended,
  {
    ...recommendedReactConfig,
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
