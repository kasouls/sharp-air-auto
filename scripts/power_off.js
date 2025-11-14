const { chromium } = require("playwright");

(async () => {
  console.log("Launching browser...");

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  try {
    console.log("Opening login page...");
    await page.goto(
      "https://cocoromembers.jp.sharp/sic-front/sso/ExLoginViewAction.do",
      { waitUntil: "load" }
    );

    // 输入账号密码
    console.log("Filling email...");
    await page.fill("input[name='loginId']", process.env.SHARP_EMAIL);

    console.log("Filling password...");
    await page.fill("input[name='password']", process.env.SHARP_PW);

    console.log("Click login...");
    await page.click("button[type='submit'], input[type='submit']");

    // 等待设备选择列表
    console.log("Waiting device list...");
    await page.waitForSelector("text=KI-SX100", { timeout: 20000 });

    // 点击第一台机器
    console.log("Select device...");
    await page.click("text=KI-SX100");

    // 等待控制页面载入
    console.log("Waiting control UI...");
    await page.waitForTimeout(4000);

    // 点击关机（停止）按钮
    console.log("Click power OFF...");
    await page.click("div[role='button']:has(svg)");

    console.log("Done! Power OFF executed.");
  } catch (err) {
    console.error("Error:", err);
  }

  await browser.close();
})();
