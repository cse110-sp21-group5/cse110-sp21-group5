beforeAll(async () => {
  await page.goto('https://cse110-sp21-group5.github.io/cse110-sp21-group5/source/');
  await page.waitForTimeout(500);
});
test('Clicking add entry button should open up textBox', async () => {
  await page.click('.addEntry');
  const textBox = await page.$('textarea');
  const textBoxExists = textBox !== null;
  expect(textBoxExists).toBe(true);
});
test('Entering new date data into text box and pressing enter should add a section element', async () => {
  await page.focus('textarea');
  await page.keyboard.type('Hi');
  await page.keyboard.press('Enter');
  const entry = await page.$('section');
  const secExists = (entry !== null);
  expect(secExists).toBeTruthy();
});
test('Entering new date data into text box and pressing enter should have current date as title', async () => {
  const title = await page.$('h3');
  const b = await title.getProperty('textContent');
  const titleContent = await b.jsonValue();
  const date = new Date().toLocaleDateString();
  expect(titleContent).toBe(date);
});

test('Clicking add entry button and typing text should create an li element with appropriate text', async () => {
  let entry = await page.$('div > li');
  const b = await entry.getProperty('textContent');
  const entryContent = await b.jsonValue();
  expect(entryContent).toBe('Hi');
});
test('Going to future tab should open new page', async () => {
  await page.click('a + a');
  let entry = await page.$('div > li');
  let noEntries = (entry === null);
  expect(noEntries).toBeTruthy();
});

test('Clicking add entry button should open up textBox in future tab', async () => {
  await page.click('.addEntry');
  const textBox = await page.$('textarea');
  const textBoxExists = textBox !== null;
  expect(textBoxExists).toBe(true);
});

test('Clicking add entry button should open up date selector in future tab', async () => {
  const date = await page.$('[type=date]');
  const dateExists = (date !== null);
  expect(dateExists).toBe(true);
});

test('Entering new date data into text box and pressing enter should add a section element for future tab', async () => {
  await page.keyboard.type('Hello');
  await page.type('[type=date]', '06-15-2021');
  await page.focus('textarea');
  await page.keyboard.press('Enter');
  const entry = await page.$('section');
  const secExists = (entry !== null);
  expect(secExists).toBeTruthy();
}, 20000);

test('Entering new date data into text box and pressing enter should have title as "Month Year"', async () => {
  const title = await page.$('h3');
  const date = 'June 2021';
  const b = await title.getProperty('textContent');
  const titleContent = await b.jsonValue();
  expect(titleContent).toBe(date);
}, 20000);

test('Clicking add entry button and typing text should create an li element with appropriate text in future tab', async () => {
  let entry = await page.$('div > li');
  const b = await entry.getProperty('textContent');
  const entryContent = await b.jsonValue();
  expect(entryContent).toBe('Hello');
});


test('Adding entry with date after the first should create an entry after', async () => {
  await page.click('.addEntry');
  await page.keyboard.type('Yo');
  await page.type('[type=date]', '08-15-2021');
  await page.focus('textarea');
  await page.keyboard.press('Enter');
  let entry = await page.$('section + section > div > li');
  const b = await entry.getProperty('textContent');
  const entryContent = await b.jsonValue();
  expect(entryContent).toBe('Yo');
}, 20000);

test('Adding entry with date between the first and second should create an entry between them', async () => {
  await page.click('.addEntry');
  await page.keyboard.type('No');
  await page.type('[type=date]', '07-15-2021');
  await page.focus('textarea');
  await page.keyboard.press('Enter');
  let entry = await page.$('section + section > div > li');
  const b = await entry.getProperty('textContent');
  const entryContent = await b.jsonValue();
  expect(entryContent).toBe('No');
}, 20000);


test('Going to daily log should have elements saved', async () => {
  await page.click('a');
  let entry = await page.$('div > li');
  const b = await entry.getProperty('textContent');
  const entryContent = await b.jsonValue();
  expect(entryContent).toBe('Hi');
});

test('Going back to future log should have elements saved', async () => {
  await page.click('a + a');
  let entry = await page.$('div > li');
  const b = await entry.getProperty('textContent');
  const entryContent = await b.jsonValue();
  expect(entryContent).toBe('Hello');
});
