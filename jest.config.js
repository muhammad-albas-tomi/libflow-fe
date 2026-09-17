import { createDefaultPreset, pathsToModuleNameMapper } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export const testEnvironment = 'node';
export const transform = { ...tsJestTransformCfg };
export const moduleNameMapper = pathsToModuleNameMapper(
  {
    '^next/headers$': ['./test/__mocks__/next/headers.ts'],
    '~/*': ['./src/*'],
  },
  {
    prefix: '<rootDir>/',
  },
);
