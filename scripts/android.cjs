const { existsSync } = require('node:fs');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');
const env = { ...process.env };
if (process.platform === 'win32') {
  const studioJdk = join(
    env.ProgramFiles || 'C:/Program Files',
    'Android/Android Studio/jbr',
  );
  const sdk = join(env.LOCALAPPDATA || '', 'Android/Sdk');
  if (!env.JAVA_HOME && existsSync(studioJdk)) env.JAVA_HOME = studioJdk;
  if (!env.ANDROID_HOME && existsSync(sdk)) env.ANDROID_HOME = sdk;
  env.Path = [
    env.JAVA_HOME && join(env.JAVA_HOME, 'bin'),
    env.ANDROID_HOME && join(env.ANDROID_HOME, 'platform-tools'),
    env.Path || env.PATH,
  ]
    .filter(Boolean)
    .join(';');
}
const result = spawnSync(
  process.execPath,
  [
    join(__dirname, '../node_modules/@react-native-community/cli/build/bin.js'),
    'run-android',
    ...process.argv.slice(2),
  ],
  { env, stdio: 'inherit' },
);
process.exit(result.status ?? 1);
