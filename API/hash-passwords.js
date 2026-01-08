const bcrypt = require('bcrypt');

const passwords = [
  'admin123',
  'password123',
  'securepass',
  'azerty2025',
  'kamehameha',
  'mypassword'
];

async function hashAll() {
  for (const pwd of passwords) {
    const hash = await bcrypt.hash(pwd, 10);
    console.log(`'${pwd}' => '${hash}'`);
  }
}

hashAll();
