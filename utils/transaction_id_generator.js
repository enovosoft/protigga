const { customAlphabet } = require('nanoid');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const generateTransactionId = customAlphabet(alphabet, 6);

function transaction_id_generator() {
  return `TXN${generateTransactionId()}`;
}

module.exports = transaction_id_generator;
