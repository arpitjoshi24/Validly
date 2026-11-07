const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'Admin@12345';

  const hash = await bcrypt.hash(password, 12);

  console.log('Password:', password);
  console.log('Hash:', hash);

  const isValid = await bcrypt.compare(password, hash);
  console.log('Verified:', isValid);
}

generateHash();