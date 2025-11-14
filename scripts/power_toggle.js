const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const LOGIN_URL = "https://cocoromembers.jp.sharp/sic-front/member/A050101ViewAction.do";

  console.log("Opening:", LOGIN_URL);

  await page.goto(LOGIN_URL, {
    waitUntil: "load",
    timeout: 60000
  });

  // 打印当前真实 URL
  console.log("Current URL after redirect:", page.url());

  // 保存 HTML 方便分析
  const html = await page.content();
  console.log("========== PAGE HTML (first 2000 chars) ==========");
  console.log(html.substring(0, 2000));
  console.log("===================================================");

  // 尝试查找输入框
  console.log("Trying to find loginId input...");
  const emailExists = await page.$('input#loginId');

  if (!emailExists) {
    console.log("❌ loginId input NOT found!");
    await browser.close();
    return;
  }

  console.log("Found login form, filling...");
  await page.fill('input#loginId', process.env.SHARP_EMAIL);
  await page.fill('input#password', process.env.SHARP_PW);
  await page.click('#loginBtn');

  await page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 });
  console.log("Logged in!");
})();
