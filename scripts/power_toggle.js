const { chromium } = require("playwright");

(async () => {
  console.log("Launching browser...");

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  // 让 SHARP 误以为是正常 Windows Chrome 浏览器
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  // 登录 URL 列表：不同地区可能指不同入口
  const LOGIN_URLS = [
    "https://cocoromembers.jp.sharp/sic-front/sso/ExLoginViewAction.do",
    "https://cocoromembers.jp.sharp/sic-front/sso/A050101ExLoginAction.do",
    "https://cocoromembers.jp.sharp/sic-front/sso/LoginAction.do",
  ];

  async function safeGoto(url) {
    console.log(`Opening: ${url}`);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      return true;
    } catch (e) {
      console.log(`Failed: ${url}`);
      return false;
    }
  }

  // 依次尝试三个入口
  let opened = false;
  for (const url of LOGIN_URLS) {
    if (await safeGoto(url)) {
      opened = true;
      break;
    }
  }

  if (!opened) {
    console.log("❌ 全部登录入口都无法打开");
    await browser.close();
    return;
  }

  // 输出前 500 字符 HTML 方便确认是否是正确页面
  const html = await page.content();
  console.log("========== LOGIN PAGE HTML (first 500 chars) ==========");
  console.log(html.substring(0, 500));
  console.log("========================================================");

  console.log("Trying to fill login form...");

  // 尝试多种 selector，哪个能填进去用哪个
  const EMAIL_SELECTOR = [
    "input[name='loginId']",
    "input[name='memberId']",
    "input[type='email']",
  ];
  const PW_SELECTOR = [
    "input[name='password']",
    "input[type='password']",
  ];

  let emailFilled = false;
  for (let sel of EMAIL_SELECTOR) {
    if (await page.$(sel)) {
      console.log(`Found email field: ${sel}`);
      await page.fill(sel, process.env.SHARP_EMAIL);
      emailFilled = true;
      break;
    }
  }

  if (!emailFilled) {
    console.log("❌ 找不到邮箱输入框，停止。");
    await browser.close();
    return;
  }

  let pwFilled = false;
  for (let sel of PW_SELECTOR) {
    if (await page.$(sel)) {
      console.log(`Found password field: ${sel}`);
      await page.fill(sel, process.env.SHARP_PW);
      pwFilled = true;
      break;
    }
  }

  if (!pwFilled) {
    console.log("❌ 找不到密码输入框，停止。");
    await browser.close();
    return;
  }

  console.log("Trying to click submit button…");

  // 常见的提交按钮 selector
  const SUBMIT_SELECTOR = [
    "button[type='submit']",
    "input[type='submit']",
    "#login",
    "button",
  ];

  let submitted = false;
  for (let sel of SUBMIT_SELECTOR) {
    if (await page.$(sel)) {
      console.log(`Submitting using ${sel}`);
      await page.click(sel);
      submitted = true;
      break;
    }
  }

  if (!submitted) {
    console.log("❌ 找不到提交按钮，停止。");
    await browser.close();
    return;
  }

  console.log("Waiting for device list…");
  try {
    await page.waitForSelector("text=KI-SX100", { timeout: 15000 });
  } catch (e) {
    console.log("❌ 无法找到设备 KI-SX100，HTML 输出如下：");
    const html2 = await page.content();
    console.log(html2.substring(0, 800));
    await browser.close();
    return;
  }

  console.log("Selecting device KI-SX100");
  await page.click("text=KI-SX100");

  console.log("Waiting for control page…");
  await page.waitForTimeout(3000);

  console.log("Clicking power button...");
  try {
    await page.click("div.css-18t94o4.css-1dbjc4n.r-a1yn9n.r-1loqt21.r-1udh08x.r-bnwqim");
    console.log("✔ Power toggled!");
  } catch (e) {
    console.log("❌ 无法点击电源按钮");
    const html3 = await page.content();
    console.log(html3.substring(0, 800));
  }

  await browser.close();
})();
