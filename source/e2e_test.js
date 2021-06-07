beforeAll(async () => {
  await page.goto('http://127.0.0.1:5500/source/');
  await page.waitForTimeout(500);
});
test('Clicking add entry button should open up textBox', async () => {
  await page.click('.addEntry');
  const textBox = await page.$('textarea');
  const textBoxExists = textBox !== null;
  expect(textBoxExists).toBe(true);
});
test('Entering data into text box and pressing enter should add an li element', async () => {
  await page.focus('textarea');
  await page.keyboard.type('Hi');
  await page.keyboard.press('Enter');
  const entry = await page.$('li');
  const b = await entry.getProperty('innerText');
  const entryContent = await b.jsonValue();
  expect(entryContent).toBe('Hi');
});

test('Clicking an entry div element should open up a textarea', async () => {
  await page.click('div');
  const textBox = await page.$('textarea');
  const textBoxExists = textBox !== null;
  expect(textBoxExists).toBe(true);
});
