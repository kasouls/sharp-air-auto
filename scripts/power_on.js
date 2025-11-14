const { chromium } = require("playwright");

(async () => {
  console.log("Launching browser...");

  const browser = await chromium.launch({
    headless: true,   // 设成 false 可以本地调试时看到浏览器
  });

  const page = await browser.newPage();

  try {
    console.log("Opening login page...");
    await page.goto("https://cocoromembers.jp.sharp/sic-front/sso/ExLoginViewAction.do", {
      waitUntil: "load",
    });

    // 输入账号
    console.log("Filling email...");
    await page.fill("input[name='loginId']", process.env.SHARP_EMAIL);

    console.log("Filling password...");
    await page.fill("input[name='password']", process.env.SHARP_PW);

    console.log("Click login...");
    await page.click("button[type='submit'], input[type='submit'], #login");

    // 等待设备选择画面出现
    console.log("Waiting device list...");
    await page.waitForSelector("text=KI-SX100", { timeout: 15000 });

    // 点击第一台机器（你可以换成 text=你想选的那台）
    console.log("Select device...");
    await page.click("text=KI-SX100");

    // 等待进入控制页面
    console.log("Waiting for control UI...");
    await page.waitForTimeout(3000);

    // 点击电源 ON（选择器需要你确认，我会下步让你截图给我）
    console.log("Click power ON...");
    await page.click("text=運転 / ON, button#powerOn, img[alt='power_on']");

    console.log("Done!");
  } catch (err) {
    console.error("Error:", err);
  }

  await browser.close();
})();
