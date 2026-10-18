const fs = require('fs');
const path = require('path');
const scan = require('./detailed_scanned_prices.json');

console.log('=== MULTI-PRICE PAGES & ALL PRICES FOUND ===');
let totalDistinctPricesFound = 0;
const servicePriceDetails = [];

scan.forEach(item => {
  if (item.priceMatches.length > 0) {
    // Extract actual numeric/amount tokens
    const extracted = [];
    item.priceMatches.forEach(pm => {
      // Look for ₹...
      const m = pm.text.match(/₹\s*([\d,]+(?:\s*(?:Lakhs?|Crores?|Cr|L))?)/i) || 
                pm.context.match(/₹\s*([\d,]+(?:\s*(?:Lakhs?|Crores?|Cr|L))?)/i);
      if (m) {
        extracted.push({
          rawAmount: m[0],
          context: pm.context,
          tag: pm.tagName,
          className: pm.className
        });
      }
    });

    // Deduplicate extracted within same page if identical context/amount
    const uniqueInPage = [];
    extracted.forEach(e => {
      if (!uniqueInPage.some(u => u.rawAmount === e.rawAmount && u.context === e.context)) {
        uniqueInPage.push(e);
      }
    });

    totalDistinctPricesFound += uniqueInPage.length;

    console.log(`\nRoute: ${item.canonical_route} (${item.service_id || 'REFERRAL'}) - Found ${uniqueInPage.length} price mention(s):`);
    uniqueInPage.forEach(u => {
      console.log(`   - ${u.rawAmount} | Context: "${u.context}"`);
    });

    servicePriceDetails.push({
      canonical_route: item.canonical_route,
      service_id: item.service_id,
      service_name: item.service_name,
      status: item.record_status,
      prices: uniqueInPage
    });
  }
});

console.log(`\nTotal unique price mentions across all pages: ${totalDistinctPricesFound}`);
fs.writeFileSync(path.join(__dirname, 'analyzed_page_prices.json'), JSON.stringify(servicePriceDetails, null, 2));
