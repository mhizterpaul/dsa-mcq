/**
 * Global guard for integration tests to prevent accidental production hits
 * and ensure all required environment variables are present.
 */
export function ensureIntegrationTestEnv() {
    if (process.env.RUN_INTEGRATION_TESTS !== 'true') {
        throw new Error('Integration tests must be explicitly enabled with RUN_INTEGRATION_TESTS=true');
    }

    if (process.env.NODE_ENV === 'production') {
        throw new Error('Integration tests should NEVER be run in production environment');
    }

    const requiredEnvVars = [
        'DATABASE_URL',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'SUPABASE_BUCKET_NAME',
        'UPSTASH_REDIS_REST_URL',
        'UPSTASH_REDIS_REST_TOKEN',
        'JWT_SECRET',
        'SERVICE',
        'USER',
        'CLIENTID',
        'CLIENTSECRET',
        'REFRESH_TOKEN'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables for integration tests: ${missing.join(', ')}`);
    }

    // Additional check for Upstash to ensure we're using a test/dev instance
    if (!process.env.UPSTASH_REDIS_REST_URL?.includes('test') && !process.env.UPSTASH_REDIS_REST_URL?.includes('localhost') && process.env.ALLOW_PROD_REDIS_FOR_TEST !== 'true') {
         console.warn('WARNING: UPSTASH_REDIS_REST_URL does not seem to be a test instance. Use ALLOW_PROD_REDIS_FOR_TEST=true to override if this is intentional.');
    }
}
