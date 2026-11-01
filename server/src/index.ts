import * as argon2 from 'argon2'
import { pool } from './db.js'
import type { RowDataPacket } from 'mysql2'
import express from "express";

interface LoginUserRow extends RowDataPacket {
  id: number
  username: string
  password_hash: string
}

const app = express()
app.use(express.json())

app.post('/api/auth/register', async (req, res) => {
  const { nickname, email, password } = req.body ?? {}

  if (
    typeof nickname !== 'string' ||
    typeof password !== 'string' ||
    typeof email !== 'string'
  ) {
    res.status(400).json({
      message: '昵称, 邮箱, 密码都应为字符串',
    })
    return
  }

  const trimmedNickname = nickname.trim()
  if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
    res.status(400).json({
      message: '昵称需要为 2～20 个字符',
    })
    return
  }

  const trimmedEmail = email.trim()
  const emailIsValid = /^[^\s@]+@[^\s@]+$/.test(trimmedEmail) && trimmedEmail.length <= 254
  if (!emailIsValid) {
    res.status(400).json({
      message: '邮箱格式不正确',
    })
    return
  }


  if (password.length < 6 || password.length > 20) {
    res.status(400).json({
      message: '密码需要为 6~20 个字符',
    })
    return
  }

  try {
    const passwordHash = await argon2.hash(password)
    await pool.execute(
      'insert into users (username, email, password_hash) values (?, ?, ?)',
      [trimmedNickname, trimmedEmail, passwordHash]
    )

    res.status(201).json({
      message: '注册成功'
    })
  } catch (err) {
    if (
      err instanceof Error &&
      'code' in err &&
      err.code === 'ER_DUP_ENTRY'
    ) {
      res.status(409).json({
        message: '该邮箱已注册',
      })
      return
    }

    res.status(500).json({
      message: '注册失败, 请稍后重试',
    })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (
    typeof password !== 'string' ||
    typeof email !== 'string'
  ) {
    res.status(400).json({
      message: '邮箱, 密码都应为字符串',
    })
    return
  }

  const trimmedEmail = email.trim()
  const emailIsValid =
    /^[^\s@]+@[^\s@]+$/.test(trimmedEmail) &&
    trimmedEmail.length <= 254
  if (!emailIsValid) {
    res.status(400).json({
      message: '邮箱格式错误',
    })
    return
  }
  if (password.length === 0) {
    res.status(400).json({
      message: '密码不能为空',
    })
    return
  }

  try {
    const [users] = await pool.execute<LoginUserRow[]>(
      'select id, username, password_hash from users where email = ?',
      [trimmedEmail]
    )

    if (users.length === 0) {
      res.status(401).json({
        message: '邮箱或密码错误'
      })
      return
    }

    const user = users[0]
    const passwordMatches = await argon2.verify(
      user.password_hash,
      password
    )
    if (!passwordMatches) {
      res.status(401).json({
        message: '邮箱或密码错误'
      })
      return
    }

    res.status(501).json({
      message: '密码校验通过,逻辑尚未完成'
    })
  } catch (err) {
    res.status(500).json({
      message: '登录失败, 请稍后重试'
    })
  }
})

app.use((req, res) => {
  res.status(404).json({
    message: '接口不存在',
  })
})

app.listen(3000, () => {
  console.log('服务已启动');
})
