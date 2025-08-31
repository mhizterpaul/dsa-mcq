import { newDb } from 'pg-mem';
import { expect } from '@jest/globals';

// Create an in-memory database for all tests
const db = newDb();
const pg = db.adapters.createPg();

// Set the DATABASE_URL to point to the in-memory database
process.env.DATABASE_URL = `postgresql://${pg.user}:${pg.password}@${pg.host}:${pg.port}/${pg.database}`;

// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
// import '@testing-library/jest-dom/extend-expect';
