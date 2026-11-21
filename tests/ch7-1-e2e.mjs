import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const port = 8768;
const base = process.env.SS_BASE_URL || 'http://127.0.0.1:' + port + '/';
const server = process.env.SS_BASE_URL ? null : spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { stdio: 'ignore' });
const browser = await chromium.launch({ headless: true });
const failures = [];
mkdirSync('qa-ch7', { recursive: true });
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    page.on('pageerror', error => failures.push(viewport.width + ': ' + error.message));
    try {
      await page.goto(base + '#chapter=7', { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('#lab-frame')?.contentWindow?.SSChapter7?.experimentCount === 7);
      const frame = page.frameLocator('#lab-frame');
      await frame.locator('.ss7-periodicity').waitFor();
      const lab = await page.locator('#lab-frame').evaluate(el => {
        const doc = el.contentDocument;
        return { title: doc.querySelector('#title')?.textContent, plots: doc.querySelectorAll('#plots svg').length, comparison: doc.querySelectorAll('.ss7-ct-plot svg').length, periodic: doc.querySelectorAll('.ss7-period-plot svg').length, buttons: doc.querySelectorAll('.ss7-alias-play').length };
      });
      if (!lab.title?.startsWith('7.1') || lab.plots < 2 || lab.comparison !== 1 || lab.periodic !== 1 || lab.buttons !== 1) throw Error('Missing 7.1 graphs or controls: ' + JSON.stringify(lab));
      const output = frame.locator('.ss7-alias-status');
      await frame.locator('.ss7-alias-frame').fill('4');
      if (!(await output.textContent()).includes('n = 4')) throw Error('Scrub did not update n');
      const cursor = await frame.locator('.ss7-alias-cursor').getAttribute('x1');
      if (Math.abs(Number(cursor) - (38 + (520 - 38 - 12) * 4 / 8)) > 0.01) throw Error('Cursor did not follow sample index');
      await frame.locator('.ss7-alias-reset').click();
      if (!(await output.textContent()).includes('n = 0')) throw Error('Reset failed');
      await frame.locator('.ss7-alias-play').click();
      await page.waitForTimeout(800);
      if (!(await output.textContent()).includes('n = 1')) throw Error('Play did not advance');
      await frame.locator('.ss7-alias-play').click();
      const paused = await output.textContent();
      await page.waitForTimeout(750);
      if (await output.textContent() !== paused) throw Error('Pause did not stop playback');
      await frame.locator('#ss7-period-k').selectOption('-2');
      const eq = await frame.locator('.ss7-period-equation').textContent();
      if (!eq.includes('−2') && !eq.includes('(-2)')) throw Error('Frequency shift not updated: ' + eq);
      const values = await page.locator('#lab-frame').evaluate(el => {
        const doc = el.contentDocument;
        const sliders = [...doc.querySelectorAll('#controls input[type=range]')];
        return sliders.map(x => x.value);
      });
      await page.locator('#lab-frame').evaluate(el => {
        const doc = el.contentDocument, win = el.contentWindow, slider = doc.querySelector('#controls input[type=range]');
        slider.value = String(Number(slider.value) + Number(slider.step || 1));
        slider.dispatchEvent(new win.Event('input', { bubbles: true }));
      });
      const metrics = await frame.locator('.ss7-sampling-metrics').textContent();
      if (!metrics.includes('Ω = ')) throw Error('Metrics did not render');
      await page.screenshot({ path: 'qa-ch7/ch7-1-' + viewport.width + '.png', fullPage: true });
      console.log('PASS Chapter 7.1 viewport ' + viewport.width + ' (starting sliders: ' + values.join(', ') + ')');
    } catch (error) {
      failures.push(viewport.width + ': ' + error.stack);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
  server?.kill();
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
