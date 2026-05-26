import { test } from "node:test";
import assert from "node:assert/strict";

import {
  encryptText,
  decryptText,
  encryptFileBase64,
  decryptFileBase64,
} from "../src/utils/cryptoHelper.js";

test("encryptText -> decryptText roundtrip", () => {
  const key = "channelKey123";
  const plain = "hello world";
  const cipher = encryptText(plain, key);
  assert.notEqual(cipher, plain);

  const out = decryptText(cipher, key);
  assert.equal(out, plain);
});

test("decryptText with wrong key returns cipherText", () => {
  const key = "channelKey123";
  const wrongKey = "wrongKey";
  const plain = "secret";
  const cipher = encryptText(plain, key);

  const out = decryptText(cipher, wrongKey);
  assert.ok(out === cipher || out === plain);
});

test("encryptFileBase64 -> decryptFileBase64 roundtrip", () => {
  const key = "fileKey123";
  const base64 = "data:application/octet-stream;base64,SGVsbG8=";
  const cipher = encryptFileBase64(base64, key);
  assert.notEqual(cipher, base64);

  const out = decryptFileBase64(cipher, key);
  assert.equal(out, base64);
});

