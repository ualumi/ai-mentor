/*import jwt from "jsonwebtoken";

const SSO_SECRET = "secret"; // должен совпадать с тем, что на тесте бекенда
const TEST_EMAIL = "test_71c139@example.com";

export function generateTestSSOToken() {
  const payload = {
    iss: "theory_platform",
    aud: "practice_platform",
    sub: "42",
    email: TEST_EMAIL,
    username: "test_user",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300, // 5 минут
  };

  return jwt.sign(payload, SSO_SECRET, { algorithm: "HS256" });
}*/

// src/utils/sso.js
// sso.js
// ❌ Никаких внешних библиотек, только Web Crypto API
// sso.js
export async function generateTestSSOToken() {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: "theory_platform",
    aud: "practice_platform",
    sub: "42",
    email: "test_71c139@example.com",
    username: "test_user",
    iat: now,
    exp: now + 300,
  };

  const base64url = (str) =>
    btoa(str)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  // 🔹 Подпись HMAC-SHA256 с секретом
  const secret = "supersecret"; // должен совпадать с SSO_SECRET на сервере
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureArrayBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(data)
  );

  // конвертируем в base64url
  const signatureBase64 = btoa(
    String.fromCharCode(...new Uint8Array(signatureArrayBuffer))
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const token = `${data}.${signatureBase64}`;
  console.log("token:", token);
  return token;
}

// Base64URL кодирование
{/*function base64urlEncode(str) {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Base64URL из Uint8Array
function base64urlEncodeBytes(bytes) {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// SSO_SECRET должен совпадать с тем, что на бекенде
const SSO_SECRET = "secret";

export async function generateTestSSOToken() {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: "theory_platform",
    aud: "practice_platform",
    sub: "42",
    email: "test_71c139@example.com",
    username: "test_user",
    iat: now,
    exp: now + 300, // 5 минут
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;

  // 🔹 HS256 подпись через Web Crypto API
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SSO_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );

  const signature = base64urlEncodeBytes(new Uint8Array(signatureBytes));

  return `${message}.${signature}`;
}*/}