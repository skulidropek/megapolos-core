export default {
  secret: process.env.MEGAPOLOS_SECRET,
  connectionString: process.env.MEGAPOLOS_CONNECTION_STRING,
  registryHost: process.env.MEGAPOLOS_REGISTRY_HOST || '',
  registryUser: process.env.MEGAPOLOS_REGISTRY_USER || '',
  registryPassword: process.env.MEGAPOLOS_REGISTRY_PASSWORD || '',
  debug: process.env.MEGAPOLOS_DEBUG || false,
  devMode: process.env.MEGAPOLOS_DEV_MODE || false,
  publicSchema: process.env.MEGAPOLOS_PUBLIC_SCHEMA || false,
  allowUnauthorized: process.env.MEGAPOLOS_ALLOW_UNAUTHORIZED || false,
  noRoot: process.env.MEGAPOLOS_NO_ROOT || false,
};
