/**
 * DES (Data Encryption Standard) - Full Implementation
 * Tanpa library eksternal — logika DES murni dari scratch
 * Implementasi mencakup: PC-1, PC-2, Key Schedule, IP, 16 Round Feistel, IP-1
 */

// ============================================================
// TABEL-TABEL PERMUTASI DES
// ============================================================

const PC1 = [
  57,49,41,33,25,17, 9,
   1,58,50,42,34,26,18,
  10, 2,59,51,43,35,27,
  19,11, 3,60,52,44,36,
  63,55,47,39,31,23,15,
   7,62,54,46,38,30,22,
  14, 6,61,53,45,37,29,
  21,13, 5,28,20,12, 4
];

const PC2 = [
  14,17,11,24, 1, 5,
   3,28,15, 6,21,10,
  23,19,12, 4,26, 8,
  16, 7,27,20,13, 2,
  41,52,31,37,47,55,
  30,40,51,45,33,48,
  44,49,39,56,34,53,
  46,42,50,36,29,32
];

const SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];

const IP = [
  58,50,42,34,26,18,10, 2,
  60,52,44,36,28,20,12, 4,
  62,54,46,38,30,22,14, 6,
  64,56,48,40,32,24,16, 8,
  57,49,41,33,25,17, 9, 1,
  59,51,43,35,27,19,11, 3,
  61,53,45,37,29,21,13, 5,
  63,55,47,39,31,23,15, 7
];

const IP_INV = [
  40, 8,48,16,56,24,64,32,
  39, 7,47,15,55,23,63,31,
  38, 6,46,14,54,22,62,30,
  37, 5,45,13,53,21,61,29,
  36, 4,44,12,52,20,60,28,
  35, 3,43,11,51,19,59,27,
  34, 2,42,10,50,18,58,26,
  33, 1,41, 9,49,17,57,25
];

const E = [
  32, 1, 2, 3, 4, 5,
   4, 5, 6, 7, 8, 9,
   8, 9,10,11,12,13,
  12,13,14,15,16,17,
  16,17,18,19,20,21,
  20,21,22,23,24,25,
  24,25,26,27,28,29,
  28,29,30,31,32, 1
];

const P = [
  16, 7,20,21,
  29,12,28,17,
   1,15,23,26,
   5,18,31,10,
   2, 8,24,14,
  32,27, 3, 9,
  19,13,30, 6,
  22,11, 4,25
];

const SBOX = [
  // S1
  [
    [14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],
    [0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],
    [4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],
    [15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]
  ],
  // S2
  [
    [15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],
    [3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],
    [0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],
    [13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]
  ],
  // S3
  [
    [10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],
    [13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],
    [13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],
    [1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]
  ],
  // S4
  [
    [7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],
    [13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],
    [10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],
    [3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]
  ],
  // S5
  [
    [2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],
    [14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],
    [4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],
    [11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]
  ],
  // S6
  [
    [12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],
    [10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],
    [9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],
    [4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]
  ],
  // S7
  [
    [4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],
    [13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],
    [1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],
    [6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]
  ],
  // S8
  [
    [13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],
    [1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],
    [7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],
    [2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]
  ]
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function hexToBin(hex) {
  return hex.split('').map(h => parseInt(h,16).toString(2).padStart(4,'0')).join('');
}

function binToHex(bin) {
  let hex = '';
  for (let i = 0; i < bin.length; i += 4) {
    hex += parseInt(bin.substr(i,4), 2).toString(16).toUpperCase();
  }
  return hex;
}

function permute(bits, table) {
  return table.map(pos => bits[pos - 1]);
}

function xor(a, b) {
  return a.map((bit, i) => bit ^ b[i]);
}

function leftShift(arr, n) {
  return [...arr.slice(n), ...arr.slice(0, n)];
}

function sBoxLookup(sixBits, sboxIndex) {
  const row = (sixBits[0] << 1) | sixBits[5];
  const col = (sixBits[1] << 3) | (sixBits[2] << 2) | (sixBits[3] << 1) | sixBits[4];
  const val = SBOX[sboxIndex][row][col];
  return [
    (val >> 3) & 1,
    (val >> 2) & 1,
    (val >> 1) & 1,
    val & 1
  ];
}

function strToBitArray(str) {
  // accepts binary string or hex
  str = str.replace(/\s/g,'');
  if (/^[01]+$/.test(str)) {
    return str.split('').map(Number);
  } else {
    return hexToBin(str).split('').map(Number);
  }
}

function bitArrayToHex(bits) {
  return binToHex(bits.join(''));
}

function bitArrayToBin(bits) {
  return bits.join('');
}

// ============================================================
// KEY SCHEDULE
// ============================================================

function generateKeySchedule(keyBits) {
  const steps = [];

  // PC-1
  const keyPC1 = permute(keyBits, PC1);
  const C0 = keyPC1.slice(0, 28);
  const D0 = keyPC1.slice(28, 56);

  steps.push({
    step: 'PC-1',
    input: [...keyBits],
    output: [...keyPC1],
    C: [...C0],
    D: [...D0]
  });

  let C = [...C0];
  let D = [...D0];
  const subkeys = [];
  const roundDetails = [];

  for (let i = 0; i < 16; i++) {
    const shift = SHIFTS[i];
    C = leftShift(C, shift);
    D = leftShift(D, shift);
    const CD = [...C, ...D];
    const Ki = permute(CD, PC2);
    subkeys.push(Ki);
    roundDetails.push({
      round: i + 1,
      shift,
      C: [...C],
      D: [...D],
      CD: [...CD],
      Ki: [...Ki]
    });
  }

  return { keyPC1, C0, D0, subkeys, roundDetails };
}

// ============================================================
// FEISTEL FUNCTION
// ============================================================

function feistelF(R, Ki) {
  // Expansion E
  const RE = permute(R, E);

  // XOR with subkey
  const xored = xor(RE, Ki);

  // S-Box substitution
  const sboxDetail = [];
  let sboxOut = [];
  for (let i = 0; i < 8; i++) {
    const sixBits = xored.slice(i * 6, i * 6 + 6);
    const row = (sixBits[0] << 1) | sixBits[5];
    const col = (sixBits[1] << 3) | (sixBits[2] << 2) | (sixBits[3] << 1) | sixBits[4];
    const fourBits = sBoxLookup(sixBits, i);
    sboxOut = [...sboxOut, ...fourBits];
    sboxDetail.push({
      sbox: i + 1,
      input: [...sixBits],
      row,
      col,
      value: SBOX[i][row][col],
      output: [...fourBits]
    });
  }

  // Permutation P
  const fOut = permute(sboxOut, P);

  return { RE, xored, sboxDetail, sboxOut, fOut };
}

// ============================================================
// DES MAIN
// ============================================================

function des(inputBits, keyBits, mode) {
  const log = { mode, steps: [] };

  // Key Schedule
  const ks = generateKeySchedule(keyBits);
  log.keySchedule = ks;

  const subkeys = mode === 'decrypt' ? [...ks.subkeys].reverse() : [...ks.subkeys];

  // Initial Permutation
  const IP_out = permute(inputBits, IP);
  let L = IP_out.slice(0, 32);
  let R = IP_out.slice(32, 64);

  log.IP = { input: [...inputBits], output: [...IP_out], L: [...L], R: [...R] };
  log.rounds = [];

  // 16 Rounds
  for (let i = 0; i < 16; i++) {
    const Ki = subkeys[i];
    const fDetail = feistelF(R, Ki);
    const newR = xor(L, fDetail.fOut);
    const newL = [...R];

    log.rounds.push({
      round: i + 1,
      L_in: [...L],
      R_in: [...R],
      Ki: [...Ki],
      expansion: [...fDetail.RE],
      xorResult: [...fDetail.xored],
      sboxDetail: fDetail.sboxDetail,
      sboxOut: [...fDetail.sboxOut],
      fOut: [...fDetail.fOut],
      L_out: [...newL],
      R_out: [...newR]
    });

    L = newL;
    R = newR;
  }

  // Pre-output (swap: R || L)
  const preOutput = [...R, ...L];
  const output = permute(preOutput, IP_INV);

  log.preOutput = [...preOutput];
  log.IP_INV = { input: [...preOutput], output: [...output] };
  log.output = output;

  return log;
}

// ============================================================
// PUBLIC API
// ============================================================

function runDES(plaintextInput, keyInput, mode) {
  // Normalize inputs
  let pt = plaintextInput.replace(/\s/g,'').toUpperCase();
  let k  = keyInput.replace(/\s/g,'').toUpperCase();

  // Convert hex to binary if needed
  let ptBin = /^[01]+$/.test(pt) ? pt : hexToBin(pt);
  let kBin  = /^[01]+$/.test(k)  ? k  : hexToBin(k);

  if (ptBin.length !== 64) throw new Error(`Plaintext/Ciphertext harus 64-bit. Diterima: ${ptBin.length} bit.`);
  if (kBin.length  !== 64) throw new Error(`Kunci harus 64-bit. Diterima: ${kBin.length} bit.`);

  const inputBits = ptBin.split('').map(Number);
  const keyBits   = kBin.split('').map(Number);

  const result = des(inputBits, keyBits, mode);

  return {
    inputBin:  ptBin,
    inputHex:  binToHex(ptBin),
    keyBin:    kBin,
    keyHex:    binToHex(kBin),
    outputBin: result.output.join(''),
    outputHex: bitArrayToHex(result.output),
    log: result
  };
}
