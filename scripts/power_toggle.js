const { chromium } = require("playwright");

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const LOGIN_URL = "https://cocoromembers.jp.sharp/sic-front/sso/ExLoginViewAction.do";
  console.log("Opening:", LOGIN_URL);

  await page.goto(LOGIN_URL, { timeout: 60000, waitUntil: "domcontentloaded" });

  console.log("Waiting for login form...");

  // 等待邮箱输入框真实出现
  await page.waitForSelector('input[name="loginId"]', { timeout: 30000 });

  console.log("Filling login form...");

  await page.fill('input[name="loginId"]', process.env.SHARP_EMAIL);
  await page.fill('input[name="password"]', process.env.SHARP_PW);

  // 登录按钮
  await page.click('#loginBtn');

  // 等待跳转到 COCORO AIR 页面
  console.log("Waiting for COCORO AIR dashboard...");
  await page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 });

  // 打开设备列表
  await page.goto("https://cocoromembers.jp.sharp/cmc-front/air/airList", {
    waitUntil: "networkidle",
  });

  console.log("Searching for Sharp air purifier...");

  // 等待设备卡片
  await page.waitForSelector(".css-18t9a0r", { timeout: 30000 });

  // 点击第一个设备进入控制页面（你可以以后写成按名字选择）
  const firstDevice = await page.$(".css-18t9a0r");
  if (!firstDevice) {
    console.log("❌ 没找到设备！");
    await browser.close();
    return;
  }

  await firstDevice.click();

  console.log("Opening device control page...");

  // 等待电源按钮出现
  await page.waitForSelector('div[role="button"]', { timeout: 30000 });

  console.log("Toggling power...");

  // 点击电源按钮（唯一的圆形按钮）
  await page.click('div[role="button"]');

  console.log("✔ Power toggled!");

  await browser.close();
})();
