const { chromium } = require('playwright');

async function completeShield(page) {
  await page.click('.step[data-stage="shield"]');
  await page.check('#approval-check');
  if (await page.isDisabled('#apply-shield-btn')) throw new Error('approval did not enable action');
  await page.click('#apply-shield-btn');
  await page.waitForSelector('#stage-replay:not([hidden])', { timeout: 10000 });
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/local/bin/chromium',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));

  const url = 'http' + '://127.0.0.1:8765/demo.html';
  await page.goto(url, { waitUntil: 'networkidle' });
  if ((await page.title()) !== 'BoxShield Arena — Attack. Patch. Replay. Prove.') throw new Error('title mismatch');

  // Quick Arena acceptance path.
  await page.click('#launch-btn');
  await page.waitForSelector('#stage-prove:not([hidden])', { timeout: 15000 });
  const quickBaseline = await page.textContent('#baseline-score');
  if (quickBaseline !== '13') throw new Error(`unexpected quick baseline ${quickBaseline}`);
  await completeShield(page);
  const quickHardened = await page.textContent('#versus-after');
  if (quickHardened !== '100') throw new Error(`unexpected quick hardened ${quickHardened}`);

  // Full recorded suite acceptance path and release screenshot.
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.click('#load-report-btn');
  await page.waitForSelector('#stage-prove:not([hidden])', { timeout: 15000 });
  const fullBaseline = await page.textContent('#baseline-score');
  if (fullBaseline !== '26') throw new Error(`unexpected full baseline ${fullBaseline}`);
  await completeShield(page);
  const fullHardened = await page.textContent('#versus-after');
  const utility = await page.textContent('#utility-retention');
  if (fullHardened !== '89') throw new Error(`unexpected full hardened ${fullHardened}`);
  if (utility !== '80%') throw new Error(`unexpected full utility ${utility}`);

  await page.evaluate(() => { if (document.activeElement) document.activeElement.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path: 'build/boxshield-arena.png', fullPage: true });
  if (errors.length) throw new Error(errors.join('; '));

  console.log(JSON.stringify({
    ok: true,
    quick: { baseline: quickBaseline, hardened: quickHardened },
    full: { baseline: fullBaseline, hardened: fullHardened, utility },
    screenshot: 'build/boxshield-arena.png'
  }));
  await browser.close();
  process.exit(0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
