
import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@shared(.*)$': '<rootDir>/src/shared/$1',
    '^@main(.*)$': '<rootDir>/src/main/$1',
    '^@renderer(.*)$': '<rootDir>/src/renderer/$1',
    '^@back(.*)$': '<rootDir>/src/back/$1',
    '^@database(.*)$': '<rootDir>/src/database/$1',
    '^@tests(.*)$': '<rootDir>/tests/$1'
  },
  testPathIgnorePatterns: [
    '<rootDir>/build/'
  ]
};

export default config;
