beforeAll(async() => {
  await page.goto('http://127.0.0.1:5500/source/');
  await page.waitForTimeout(500);
});
test('Clicking add entry button should open up textBox', async() => {
  await page.click('.addEntry');
  let textBox = await page.$('textarea');
  let textBoxExists = textBox !== null;
  expect(textBoxExists).toBe(true);
});
test('Entering data into text box and pressing enter should add an li element', async () => {
  await page.focus('textarea');
  await page.keyboard.type('Hi');
  await page.keyboard.press('Enter');
  let entry = await page.$('li');
  let b = await entry.getProperty('innerText');
  let entryContent = await b.jsonValue();
  expect(entryContent).toBe('Hi');
});

test ('Clicking an entry div element should open up a textarea', async() => {
  await page.click('div');
  let textBox = await page.$('textarea');
  let textBoxExists = textBox !== null;
  expect(textBoxExists).toBe(true);
});
