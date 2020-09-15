module.exports = {
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    coveragePathIgnorePatterns: ['aws', 'handlers', '.build'],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 65,
            lines: 70,
            statements: 70,
        },
    },
    globals: {
        'ts-jest': {
            diagnostics: false,
            tsConfig: 'tsconfig.json',
        },
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    modulePathIgnorePatterns: [
        'interfaces',
        'constants',
        'migrate',
        'getApplyToken',
        'fx-ipay-docs',
        'fx-ipay-types',
        'dist',
        'fixures',
        'webpack.config.js',
        'integration_tests',
    ],
    testMatch: ['/**/test/**/(*.)(test|spec).(ts|tsx|js)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
};