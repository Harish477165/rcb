import bcrypt from 'bcryptjs'
import { repository } from '../db/repository.js'
import { generateToken } from '../middleware/auth.js'

export const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body

      const existing = await repository.findUserByEmail(email)
      if (existing) {
        return res.status(409).json({ message: 'An account with this email address already exists.' })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const user = await repository.createUser({
        name,
        email,
        password: hashedPassword,
        role: 'customer',
      })

      const token = generateToken(user)
      res.status(201).json({
        message: 'Account created successfully',
        user,
        token,
      })
    } catch (err) {
      next(err)
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body

      const user = await repository.findUserByEmail(email)
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' })
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' })
      }

      const { password: _, ...safeUser } = user
      const token = generateToken(safeUser)

      res.json({
        message: 'Logged in successfully',
        user: safeUser,
        token,
      })
    } catch (err) {
      next(err)
    }
  },

  async getProfile(req, res) {
    res.json({ user: req.user })
  },

  async updateProfile(req, res, next) {
    try {
      const { name, phone, address } = req.body
      const updated = await repository.updateUser(req.user.id, {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      })
      res.json({ message: 'Profile updated', user: updated })
    } catch (err) {
      next(err)
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body
      const user = await repository.findUserByEmail(req.user.email)
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password.' })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)

      await repository.updateUser(user.id, { password: hashedPassword })
      res.json({ message: 'Password updated successfully' })
    } catch (err) {
      next(err)
    }
  },
}
