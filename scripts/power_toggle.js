const { chromium } = require("playwright");

(async () => {
  console.log("Launching browser...");

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  try {
    console.log("Opening login page...");
    await page.goto("https://cocoromembers.jp.sharp/sic-front/sso/ExLoginViewAction.do", {
      waitUntil: "load"
    });

    // 输入账号
    console.log("Filling email...");
    await page.fill("input[name='loginId']", process.env.SHARP_EMAIL);

    console.log("Filling password...");
    await page.fill("input[name='password']", process.env.SHARP_PW);

    console.log("Click login...");
    await Promise.all([
      page.waitForNavigation(),
      page.click("button[type='submit'], input[type='submit']")
    ]);

    // 进入设备列表页
    console.log("Waiting device list...");
    await page.waitForSelector("text=空気清浄機", { timeout: 20000 });

    // 点击第一台设备（默认：单设备）
    console.log("Selecting device...");
    await page.locator("text=空気清浄機").first().click();

    // 等待控制面板加载
    console.log("Waiting control UI...");
    await page.waitForTimeout(4000);

    // 点击电源按钮（最通用最稳的 selector）
    console.log("Clicking power button...");
    await page.click("div[role='button']:has(svg)");

    console.log("Done!");

  } catch (err) {
    console.error("Error:", err);
  }

  await browser.close();
})();
