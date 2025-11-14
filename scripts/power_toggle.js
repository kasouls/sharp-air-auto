const { chromium } = require("playwright");

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const TARGET_URL = "https://cocoromembers.jp.sharp/sic-front/member/A050101ViewAction.do";

  console.log("Opening:", TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: "load", timeout: 60000 });

  console.log("Current URL:", page.url());

  // Step 1 — 判断是否跳到登录页（看是否存在 loginId 输入框）
  const isLoginPage = await page.$("input#loginId");

  if (isLoginPage) {
    console.log("Detected LOGIN PAGE. Logging in now...");

    await page.fill("input#loginId", process.env.SHARP_EMAIL);
    await page.fill("input#password", process.env.SHARP_PW);

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 }),
      page.click("button[type='submit'], #loginBtn, .btn-login"),
    ]);

    console.log("Login completed.");
  } else {
    console.log("Already logged in or still on target page.");
  }

  // Step 2 — 再次访问目标页面（用登录后的 session）
  console.log("Navigating to device list...");
  await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 60000 });

  // Step 3 — 点击 KI-SX100
  console.log("Searching for KI-SX100...");
  await page.waitForSelector("text=KI-SX100", { timeout: 30000 });
  await page.click("text=KI-SX100");

  // Step 4 — 加载控制界面
  console.log("Waiting device control UI...");
  await page.waitForTimeout(4000);

  // Step 5 — 点击电源按钮
  console.log("Clicking power ON / OFF button...");
  await page.click("div.css-18t94o4.css-1dbjc4n");

  console.log("Power toggled successfully!");

  await browser.close();
})();
