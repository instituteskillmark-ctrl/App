import http from 'http';

function checkUrl(urlPath: string) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const hasCssLink = data.includes('<link rel="stylesheet"') || data.includes('_next/static/css');
        const hasErrorText = data.includes('Minified React error') || data.includes('Application Exception Caught');
        const statusCode = res.statusCode;
        resolve({ urlPath, statusCode, hasCssLink, hasErrorText, length: data.length });
      });
    }).on('error', (err) => {
      resolve({ urlPath, error: err.message });
    });
  });
}

async function verify() {
  console.log('🔍 Testing localhost dev server endpoints...');
  const routes = [
    '/login',
    '/dashboard',
    '/roadmap',
    '/today',
    '/projects',
    '/progress',
    '/notes',
    '/settings',
  ];

  for (const r of routes) {
    const res: any = await checkUrl(r);
    console.log(`Route: ${r.padEnd(15)} | Status: ${res.statusCode} | CSS Bundle Linked: ${res.hasCssLink} | React Errors: ${res.hasErrorText}`);
  }
}

verify().catch(console.error);
