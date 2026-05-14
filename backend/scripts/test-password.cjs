const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('Admin@fem', 10);
console.log(hash);
console.log('VALID:', bcrypt.compareSync('Admin@fem', hash));