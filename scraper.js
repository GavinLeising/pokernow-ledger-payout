const puppeteer = require('puppeteer');

async function scrapeLedger(url) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2'});

  // Press the button with class "show-log-button"
  await page.waitForSelector('.show-log-button');
  await page.click('.show-log-button');

  // Press the button with class "ledger-button"
  await page.waitForSelector('.ledger-button');
  await page.click('.ledger-button');

  // Wait for the table to load and extract its contents
  await page.waitForSelector('.player-ledger-table');
  const tableData = await page.evaluate(() => {
    const rows = document.querySelectorAll('.player-ledger-table tr');
      return Array.from(rows, row => {
      const cells = row.querySelectorAll('td');
      if (cells.length > 0) {
        // Extract name and net payout, and clean the name string
        const name = cells[0].innerText.split('@')[0].trim();
        const netPayout = cells[cells.length - 1].innerText.trim();
        return [name, netPayout];
      }
    }).filter(row => row); // Remove undefined rows
  });

  await browser.close();
  return tableData;
}

function calculatePayouts(data) {
  let players = {};
  
  data.forEach(row => {
    const [name, netPayout] = row; // Adjust index based on actual table structure
    if (!players[name]) {
      players[name] = 0;
    }
    players[name] += parseFloat(netPayout);
    players[name] = parseFloat(players[name].toFixed(2));
  });

  let payouts = [];
  let creditors = Object.entries(players).filter(([_, value]) => value > 0);
  let debtors = Object.entries(players).filter(([_, value]) => value < 0);

  creditors.sort((a, b) => b[1] - a[1]);
  debtors.sort((a, b) => a[1] - b[1]);

  for (let i = 0; i < debtors.length; i++) {
    let debtor = debtors[i][0]
    debt = -debtors[i][1];
    while (debt > 0) {
      let [creditor, credit] = creditors.shift();
      let payment = Math.min(credit, debt);
      payouts.push(`${debtor} pays ${creditor} $${payment.toFixed(2)}`);
      debt = (debt-payment).toFixed(2);
      credit = (credit-payment).toFixed(2);
      if (credit > 0) {
        creditors.unshift([creditor, credit]);
      }
    }
  }

  return payouts;
}

module.exports = { scrapeLedger, calculatePayouts };