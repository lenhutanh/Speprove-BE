import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
  // Cấu hình Global Ignores (Phải là object riêng ở đầu)
  {
    ignores: ['dist', 'node_modules', 'bin', 'build']
  },

  // Kế thừa các bộ quy tắc (Spread trực tiếp vào mảng)
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,

  // Cấu hình chi tiết cho các file TS
  {
    files: ['**/*.ts', '**/*.mts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
      'no-console': 'off',
      'prefer-const': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // Rule của Prettier
      'prettier/prettier': 'warn'
    }
  }
)
