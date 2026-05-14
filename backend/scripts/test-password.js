const bcrypt = require('bcryptjs');

const password = 'Admin@fem';

const hash = bcrypt.hashSync(password, 10);
console.log('HASH:', hash);

const valid = bcrypt.compareSync(password, hash);
console.log('VALID:', valid);