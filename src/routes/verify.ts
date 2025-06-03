import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const router = express.Router()

router.get('/:token', async (req: Request<{ token: string }>, res: Response): Promise<void> => {
  const { token } = req.params

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string }

    const user = await User.findOne({ email: decoded.email })

    if (!user) {
      res.status(404).json({ error: 'Пользователь не найден' })
      return
    }

    if (user.verified) {
      res.status(400).json({ error: 'Пользователь уже подтверждён' })
      return
    }

    user.verified = true
    user.verificationToken = undefined
    await user.save()

    res.status(200).json({ message: 'Email подтверждён' })
  } catch (err) {
    console.error('[VERIFY ERROR]', err)
    res.status(400).json({ error: 'Неверный или просроченный токен' })
  }
})

export default router
