const https = require('https');

// 1. 生成加密 Key
function generateReportDisplayKey() {
    const timestamp = Date.now();
    const dataToEncode = `2026ReportDisplayKey|${timestamp}`;
    const encoded = Buffer.from(unescape(encodeURIComponent(dataToEncode))).toString('base64');
    console.log('[Debug] Generated Key:', encoded);
    return encoded;
}

// 2. 发送请求
function request(path, body) {
    const options = {
        hostname: 'mp.szajly.com',
        port: 443,
        path: '/web' + path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    console.log(`[Debug] Response Status: ${res.statusCode}`);
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    console.error('[Debug] Parse Error:', e);
                    console.log('[Debug] Raw Body:', data);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error('[Debug] Request Error:', e);
            reject(e);
        });

        req.write(JSON.stringify(body));
        req.end();
    });
}

// 3. 执行测试
async function run() {
    const key = generateReportDisplayKey();

    console.log('\n=== Testing fetchStoreStatistics ===');
    const statsBody = {
        reportDisplayKey: key
    };
    const statsRes = await request('/api/store/getStatisticsStore', statsBody);
    if (statsRes) {
        console.log('Code:', statsRes.code);
        console.log('Message:', statsRes.message);
        console.log('Data Length:', statsRes.data ? statsRes.data.length : 'NULL');
        if (statsRes.data && statsRes.data.length > 0) {
            console.log('First Item:', JSON.stringify(statsRes.data[0], null, 2)); // Print details of the first item
            // Check if there are other stores
            if (statsRes.data.length > 1) {
                console.log('Second Item Name:', statsRes.data[1].storeName);
            }
        }
    }

    console.log('\n=== Testing fetchProfitReport (2025-12) ===');
    const reportBody = {
        reportDisplayKey: key,
        companyId: 6,
        statisticsMouth: '2025-12'
    };
    const reportRes = await request('/api/v3/profits/report/display', reportBody);
    if (reportRes) {
        console.log('Code:', reportRes.code);
        console.log('Message:', reportRes.message);
        console.log('Data Length:', reportRes.data ? reportRes.data.length : 'NULL');
        if (reportRes.data && reportRes.data.length > 0) {
            // Print summaries of WarZones
            reportRes.data.forEach(wz => {
                console.log(`WarZone: ${wz.warZone}, Store Count: ${wz.stores ? wz.stores.length : 0}`);
            })
        }
    }
}

run();
