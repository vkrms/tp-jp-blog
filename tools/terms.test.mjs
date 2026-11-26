// node --test tools/*.test.mjs — единый термин «updater» (tools/terms.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { replaceTerms } from './terms.mjs';

test('all forms of the old names become updater', () => {
  assert.deepEqual(replaceTerms('Агент-обновлятор и апдейтер; запуск апдейтера; агента-обновлятора; Обновлятор'),
    { text: 'Агент-updater и updater; запуск updater; агента-updater; Updater', count: 5 });
});

test('unrelated words are untouched', () => {
  assert.deepEqual(replaceTerms('обновление, обновлять, updater'), { text: 'обновление, обновлять, updater', count: 0 });
});
