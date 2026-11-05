import * as argon2 from 'argon2'
import { pool } from './db.js'
import type { RowDataPacket } from 'mysql2'
import express from "express";
import 'dotenv/config'
import session from 'express-session'

interface LoginUserRow extends RowDataPacket {
  id: number
  username: string
  password_hash: string
}

interface CurrentUserRow extends RowDataPacket {
  id: number
  username: string
  email: string
}

const sessionSecret = process.env.SESSION_SECRET

if (!sessionSecret) {
  throw new Error('缺少 SESSION_SECRET 配置')
}

const app = express()
// 中间件（请求到达路由的过程中，先执行的一段函数）
// req.body属性
app.use(express.json())
// req.session 属性
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // 本地用 http 就可以了，省去了https 需要的证书配置
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    }
  })
)

//注册路由
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

// 登录路由
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

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })

    // user 是登录时根据邮箱查询到的用户对象，id是注册时自增的
    req.session.userId = user.id
    // express-session 通常会在响应结束时自动保存修改过的会话。这里主动调用 save()，是为了确认保存成功后，再告诉前端登录成功。
    await new Promise<void>((resolve, reject) => {
      req.session.save(error => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })

    res.status(200).json({
      message: '登录成功'
    })
  } catch (err) {
    res.status(500).json({
      message: '登录失败, 请稍后重试'
    })
  }
})

app.get('/api/auth/me', async (req, res) => {
  try {
    const userId = req.session.userId
    if (!userId) {
      res.status(401).json({
        message: '尚未登录',
      })
      return
    }
    const [users] = await pool.execute<CurrentUserRow[]>(
      'select id, username, email from users where id = ?',
      [userId]
    )

    if (users.length === 0) {
      res.status(401).json({
        message: '登录已失效, 请重新登录'
      })
      return
    }

    res.status(200).json({
      user: users[0]
    })
  } catch (err) {
    res.status(500).json({
      message: '获取用户信息失败',
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
