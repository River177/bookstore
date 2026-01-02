// Polyfill for Vercel's Node.js runtime to automatically add duplex option to Request
// This fixes the "RequestInit: duplex option is required when sending a body" error

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

