module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: 'commonjs'
      }
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic'
      }
    ],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-transform-class-properties', { loose: true }],
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-optional-chaining'
  ]
};
