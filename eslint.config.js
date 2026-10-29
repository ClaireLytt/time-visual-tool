import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  // ── Phantom module: enforce z-index constants & ref safety ──
  {
    files: ['src/phantom/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error',
        // Rule 1: No raw zIndex numbers — use z-index.ts constants
        // Evidence: FlashcardReview z190 behind PauseMenu z200 (issue #5, 2×)
        {
          selector: 'Property[key.name="zIndex"][value.type="Literal"]',
          message: 'Use named constants from src/phantom/core/z-index.ts instead of raw zIndex numbers. See CLAUDE.md "Z-Index" rule.',
        },
        // Rule 2: No useRef initialized with useGameStore values
        // Evidence: cameraX ReferenceError crash (commit 2b1efd1)
        {
          selector: 'CallExpression[callee.name="useRef"][arguments.0.type="Identifier"][arguments.0.name=/^(cameraX|currentArea|currentAct|collectedItems|isPlaying|isPaused)$/]',
          message: 'Do not initialize useRef with a useGameStore value — it may not be declared yet. Use 0 or null. See CLAUDE.md "useRef Before useGameStore" rule.',
        },
      ],
    },
  },
  prettier,
)
