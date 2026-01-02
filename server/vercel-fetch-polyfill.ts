// Polyfills for Vercel's Node.js runtime

// Make this a module
export {};

// 1. Fix "RequestInit: duplex option is required when sending a body" error
const originalRequest = globalThis.Request;

if (originalRequest) {
  // @ts-ignore - Polyfill for Vercel's strict fetch implementation
  globalThis.Request = class Request extends originalRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      // If init has a body and no duplex option, add it
      if (init && init.body && !('duplex' in init)) {
        super(input, { ...init, duplex: 'half' } as RequestInit);
      } else {
        super(input, init);
      }
    }
  } as typeof originalRequest;
}

// 2. Fix BigInt serialization error
// PostgreSQL bigint types are mapped to JavaScript BigInt, which can't be serialized to JSON
// Add toJSON method to BigInt prototype to convert to Number
declare global {
  interface BigInt {
    toJSON(): number;
  }
}

if (!(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function() {
    return Number(this);
  };
}

