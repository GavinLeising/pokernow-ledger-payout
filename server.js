const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { scrapeLedger, calculatePayouts } = require('./scraper');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

app.post('/calculate-payouts', async (req, res) => {
  try {
    const url = req.body.url;
    console.log(url);
    const data = await scrapeLedger(url);
    const payouts = calculatePayouts(data);
    console.log("PAYOUTS");
    console.log(payouts);
    res.json({ payouts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});