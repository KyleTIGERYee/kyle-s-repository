const https = require('https');

function generateReportDisplayKey() {
    const timestamp = Date.now();
    const dataToEncode = `2026ReportDisplayKey|${timestamp}`;
    const encoded = Buffer.from(unescape(encodeURIComponent(dataToEncode))).toString('base64');
    return encoded;
}

function request(hostname, path, body) {
    const options = {
        hostname: hostname,
        port: 443,
        path: path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    return new Promise((resolve) => {
        const start = Date.now();
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const duration = Date.now() - start;
                try {
                    // Try to parse JSON if content-type looks like json, or just inspect body
                    const json = JSON.parse(data);
                    resolve({
                        hostname,
                        status: res.statusCode,
                        duration,
                        code: json.code,
                        count: json.count,
                        dataLen: json.data?.length,
                        firstStore: json.data?.[0]?.storeName,
                        error: null
                    });
                } catch (e) {
                    resolve({
                        hostname,
                        status: res.statusCode,
                        duration,
                        bodyPreview: data.substring(0, 100),
                        error: 'JSON Parse Error'
                    });
                }
            });
        });

        req.on('error', (e) => resolve({ hostname, error: e.message }));
        req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    const key = generateReportDisplayKey();
    const body = { reportDisplayKey: key };
    const path = '/web/api/store/getStatisticsStore';

    console.log('--- Testing Store Statistics API ---');
    console.log(`Path: ${path}`);
    console.log(`Payload: ${JSON.stringify(body)}\n`);

    const hosts = ['mp.szajly.com', 'weapp.szajly.com'];

    for (const host of hosts) {
        console.log(`Testing ${host}...`);
        const result = await request(host, path, body);
        console.log(JSON.stringify(result, null, 2));
        console.log('-----------------------------------');
    }
}

run();
