const { chromium } = require("playwright");

(async () => {
  console.log("Launching browser...");

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  try {
    const CONTROL_URL = "https://cocoroplusapp.jp.sharp/air/ap/main/status";

    console.log("Opening:", CONTROL_URL);
    await page.goto(CONTROL_URL, { waitUntil: "load" });

    await page.waitForTimeout(3000);

    console.log("Current URL:", page.url());

    const html = await page.content();
    console.log("===== PAGE HTML (first 2000 chars) =====");
    console.log(html.substring(0, 2000));
    console.log("=========================================");

    console.log("Trying to click ON/OFF buttons…");

    const trySelectors = [
      "text=運転",
      "text=切",
      "text=入",
      "text=ON",
      "text=OFF",
      "img[alt*=電源]",
      "img[alt*=power]",
      "button",
    ];

    let clicked = false;
    for (const s of trySelectors) {
      try {
        await page.click(s, { timeout: 800 });
        console.log("Clicked:", s);
        clicked = true;
        break;
      } catch (e) {}
    }

    if (!clicked) console.log("❌ No ON/OFF button found (send screenshot).");

  } catch (err) {
    console.error("ERROR:", err);
  }

  await browser.close();
})();
