type EnvConfig = {
  DATABASE_URL: string;
  MORALIS_MASTER_KEY: string;
  MORALIS_SERVER_URL: string;
  MORALIS_APP_ID: string;
  TOKEN_SECRET: string;
  TOKEN_LIFE_TIME: string;
}

function getConfig(key: keyof EnvConfig) {
  return process.env[key];
}

export { getConfig };
