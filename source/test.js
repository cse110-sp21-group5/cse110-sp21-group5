/**
 * @jest-environment jsdom
 */

import { capitalizeFirstLetter, tagGet } from './scripts.js';
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(2, 1)).toBe(3);
});

test('capitalize on empty string', () => {
  expect(capitalizeFirstLetter('')).toBe('');
});

test('capitalize on single letter', () => {
  expect(capitalizeFirstLetter('a')).toBe('A');
});

test('capitalize first letter of string', () => {
  expect(capitalizeFirstLetter('first letter capital')).toBe('First letter capital');
});

test('no tags from tagless string', () => {
  expect(tagGet('this string has no tags')).toBe(null);
});

test('tags from string with tags', () => {
  expect(tagGet('this string has tags #tag, tagtwo, tagthree')).toBe(['tag', 'tagtwo', 'tagthree']);
});

test('tags with lots of whitespace', () => {
  expect(tagGet('lots of whitespace #                    whitespace')).toBe(['whitespace']);
});
