const https = require('https');

const urls = [
  'https://docs.google.com/forms/d/e/1FAIpQLSd-DERFEEOwSOs15bPuiCjc-eMFvKaAEVkKixDwjbPa1OKdfg/viewform',
  'https://docs.google.com/forms/d/16e0rbSymnw47arIdFu3Fzya3rbhrKGQp-vh5gth0t7k/viewform'
];

function fetchForm(targetUrl) {
  return new Promise((resolve, reject) => {
    https.get(targetUrl, (res) => {
      // Handle redirects if any
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchForm(res.headers.location));
      }
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, html }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching Google Form...');
  const res = await fetchForm(urls[0]);
  console.log('Status code:', res.statusCode);

  const titleMatch = res.html.match(/<title>([^<]+)<\/title>/i);
  console.log('Page Title:', titleMatch ? titleMatch[1] : 'Unknown');

  const fbMatch = res.html.match(/var FB_PUBLIC_LOAD_DATA_ = (\[[\s\S]*?\]);\s*<\/script>/);
  if (!fbMatch) {
    console.log('FB_PUBLIC_LOAD_DATA_ not matched. Checking form fields directly in HTML...');
    const inputMatches = [...res.html.matchAll(/name="(entry\.\d+)"/g)].map(m => m[1]);
    console.log('Found entry inputs:', inputMatches);
    return;
  }

  try {
    const data = JSON.parse(fbMatch[1]);
    const formTitle = data[1]?.[8] || data[8] || data[3];
    const formDesc = data[1]?.[0];
    console.log('\n======================================================');
    console.log('FORM METADATA:');
    console.log('Form Title:', formTitle);
    console.log('Description:', formDesc);
    console.log('======================================================\n');

    const questions = data[1]?.[1] || [];
    console.log('Total Questions Detected:', questions.length);

    const extracted = [];
    questions.forEach((q, idx) => {
      const qId = q[0];
      const qTitle = q[1];
      const qDesc = q[2];
      const qType = q[3];
      const qEntries = q[4] || [];
      const entryId = qEntries[0]?.[0];
      const isRequired = qEntries[0]?.[2] === 1;
      const rawOptions = qEntries[0]?.[1] || [];
      const options = rawOptions.map(opt => opt[0]);

      console.log(`\n[Question ${idx + 1}] ID: ${qId} | Entry: entry.${entryId}`);
      console.log(`  Title: "${qTitle}"`);
      console.log(`  Type: ${qType} | Required: ${isRequired ? 'YES' : 'NO'}`);
      if (options.length > 0) {
        console.log(`  Options (${options.length}): ${options.join(' | ')}`);
      }
      extracted.push({
        index: idx + 1,
        title: qTitle,
        entryId: entryId ? 'entry.' + entryId : null,
        required: isRequired,
        type: qType,
        options
      });
    });

    console.log('\n======================================================');
    console.log('SUMMARY JSON FOR MAPPING:');
    console.log(JSON.stringify(extracted, null, 2));
    console.log('======================================================');

  } catch (err) {
    console.error('Error parsing Google Form data:', err);
  }
}

run();
