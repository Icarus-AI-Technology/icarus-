// Basic check that tesseract.js can be imported and a worker created
import { createWorker } from 'tesseract.js';

(async () => {
  try {
    const worker = await createWorker();
    await worker.terminate();
    console.log('[QA][Tesseract] OK: worker created');
    process.exit(0);
  } catch (err) {
    console.log('[QA][Tesseract] FAIL:', err?.message || err);
    process.exit(1);
  }
})();
