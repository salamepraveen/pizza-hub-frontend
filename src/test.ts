// src/test.ts – entry point for Angular unit tests
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// You can also require all *.spec.ts files automatically if using Webpack.
// Uncomment the following if you need auto‑loading:
// const context = require.context('./', true, /\.spec\.ts$/);
// context.keys().map(context);
