export function sha1(str: string): string {
  function rotate_left(n: number, s: number) {
    return (n << s) | (n >>> (32 - s));
  }
  function cvt_hex(val: number) {
    let str = '';
    let i;
    let v;
    for (i = 7; i >= 0; i--) {
      v = (val >>> (i * 4)) & 0x0f;
      str += v.toString(16).toUpperCase();
    }
    return str;
  }
  let blockstart;
  let i, j;
  const W = new Array(80);
  let H0 = 0x67452301;
  let H1 = 0xEFCDAB89;
  let H2 = 0x98BADCFE;
  let H3 = 0x10325476;
  let H4 = 0xC3D2E1F0;
  let A, B, C, D, E;
  let str2 = unescape(encodeURIComponent(str));
  const strLen = str2.length;
  const wordArray = [];
  for (i = 0; i < strLen - 3; i += 4) {
    j = (str2.charCodeAt(i) << 24) | (str2.charCodeAt(i + 1) << 16) |
      (str2.charCodeAt(i + 2) << 8) | (str2.charCodeAt(i + 3));
    wordArray.push(j);
  }
  let remainder = strLen % 4;
  let last = 0;
  if (remainder === 0) {
    last = 0x080000000;
  } else if (remainder === 1) {
    last = (str2.charCodeAt(strLen - 1) << 24) | 0x0800000;
  } else if (remainder === 2) {
    last = (str2.charCodeAt(strLen - 2) << 24) | (str2.charCodeAt(strLen - 1) << 16) | 0x08000;
  } else if (remainder === 3) {
    last = (str2.charCodeAt(strLen - 3) << 24) | (str2.charCodeAt(strLen - 2) << 16) | (str2.charCodeAt(strLen - 1) << 8) | 0x80;
  }
  wordArray.push(last);
  while ((wordArray.length % 16) !== 14) wordArray.push(0);
  wordArray.push(strLen >>> 29);
  wordArray.push((strLen << 3) & 0x0ffffffff);
  for (blockstart = 0; blockstart < wordArray.length; blockstart += 16) {
    for (i = 0; i < 16; i++) W[i] = wordArray[blockstart + i];
    for (i = 16; i < 80; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
    A = H0;
    B = H1;
    C = H2;
    D = H3;
    E = H4;
    for (i = 0; i < 80; i++) {
      let temp;
      if (i < 20) {
        temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
      } else if (i < 40) {
        temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
      } else if (i < 60) {
        temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
      } else {
        temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
      }
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }
    H0 = (H0 + A) & 0x0ffffffff;
    H1 = (H1 + B) & 0x0ffffffff;
    H2 = (H2 + C) & 0x0ffffffff;
    H3 = (H3 + D) & 0x0ffffffff;
    H4 = (H4 + E) & 0x0ffffffff;
  }
  let temp2 = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
  return temp2.toLowerCase();
} 