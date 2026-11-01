import * as argon2 from 'argon2'
import { pool } from './db.js'

try {
  const passwordHash = await argon2.hash('study123')

  const [res] = await pool.execute(
    'insert into users (username, email, password_hash) values (?, ?, ?)',
    ['练习用户', 'practice@qq.com', passwordHash]
  )

  console.log(res);

} catch (err) {
  console.error('数据库查询失败', err)
} finally {
  await pool.end()
}