import * as argon2 from 'argon2'

const passwordHash = await argon2.hash('study123')

console.log(passwordHash)

const matched = await argon2.verify(passwordHash, 'study12')
console.log(matched);
