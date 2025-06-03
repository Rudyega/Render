import User from '../models/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import { sendEmail } from '../utils/sendEmail'

//  Регистрация
export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body

  const existing = await User.findOne({ email })
  if (existing) {
    res.status(400).json({ error: 'Пользователь уже существует' })
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1d' })

  const user = await User.create({
    username,
    email,
    password: hashed,
    verificationToken,
    verified: false,
  })

  const verifyLink = `http://localhost:3000/verify?token=${verificationToken}`
  const html = `
    <h2>Добро пожаловать в BiscuitBoard!</h2>
    <p>Нажмите на кнопку ниже, чтобы подтвердить ваш email:</p>
    <a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background:#facc15;color:black;text-decoration:none;border-radius:5px;font-weight:bold;">
      Подтвердить Email
    </a>
    <p>Если вы не регистрировались — просто проигнорируйте это письмо.</p>`

  await sendEmail(email, 'Подтверждение регистрации', html)

  res.status(201).json({ message: 'Письмо отправлено. Подтвердите email.' })
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user || !user.password) {
      console.warn("[LOGIN] Пользователь не найден или отсутствует пароль:", email);
      res.status(401).json({ error: 'Неверный email или пароль' })
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      console.warn("[LOGIN] Неверный пароль для:", email);
      res.status(401).json({ error: 'Неверный email или пароль' })
      return
    }
    
    if (!user.verified) {
      console.warn("[LOGIN] Email не подтверждён:", email);
      res.status(403).json({ error: 'EMAIL_NOT_VERIFIED' })
      return
    }

     console.log("[LOGIN] Успешный вход. Отправляем user:", {
      id: user._id,
      username: user.username,
      email: user.email,
    });

    res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
      },
      verified: user.verified,
    })
  } catch (err) {
    console.error('[LOGIN ERROR]', err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

//  Сброс пароля — 
/*export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params
  const { newPassword } = req.body

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const user = await User.findById(decoded.userId)

    if (!user) {
      res.status(404).json({ error: 'Пользователь не найден' })
      return
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    user.password = hashed
    await user.save()

    res.json({ message: 'Пароль успешно сброшен' })
  } catch {
    res.status(400).json({ error: 'Неверный или истёкший токен' })
  }
}

//  Запрос на сброс пароля 
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user || !user.password) {
    res.status(400).json({ error: 'Сброс пароля невозможен для этого аккаунта' })
    return
  }

  const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '15m' })

  const link = `http://localhost:3000/reset-password/${resetToken}`
  const html = `<p>Нажмите, чтобы сбросить пароль:</p><a href="${link}">${link}</a>`

  await sendEmail(email, 'Сброс пароля', html)

  res.json({ message: 'Ссылка на сброс пароля отправлена на почту' })
}
*/