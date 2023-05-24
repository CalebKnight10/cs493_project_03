const { Router } = require('express')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')
const { User } = require('../models/user')

const reqAuthentication = require('../lib/auth')


const router = Router()

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', reqAuthentication, async function (req, res) {
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  if (req.jwt.admin || Number(req.jwt.id) === Number(userId)) {
    res.status(200).json({
      businesses: userBusinesses
    })
  }
  else{
    res.status(403).json({
      error: `${req.jwt.id} isn't authorized to access ${userId}'s businesses.`
    })
    return
  }
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', reqAuthentication, async function (req, res) {
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId }})
  if (req.jwt.admin || Number(req.jwt.id) === Number(userId)) {
    res.status(200).json({
      reviews: userReviews
    })
  }
  else {
    res.status(403).json({
      error: `${jwt.id} isn't authorized to access ${userId}'s reviews.`
    })
  }
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', async function (req, res) {
  const userId = req.params.userId
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  if (req.jwt.admin || Number(req.jwt.id) === Number(userId)) {
    res.status(200).json({
      photos: userPhotos
    })
  }
  else {
    res.status(403).json({
      error: `${jwt.id} isn't authorized to access ${userId}'s reviews.`
    })
  }
})

// Route to login a user
router.post('/login', async function (req, res, next) {
  const { email, password } = req.body
    const user = await User.findOne({ where: { email: email }})
    if (user) {
      if (user.validPassword(password)) {
        // Respond with a JWT token
        const token = user.genToken()
        res.status(200).json({ token: token })
      } else {
        res.status(401).json(['Invalid email'])
      }
    } else {
      res.status(401).json(['Invalid password'])
    }
  });

// Get a userId
router.get('/:userId', reqAuthentication, async function (req, res, next) {
  const userId = req.params.userId
  const user = await User.findByPk(userId)
  if (req.jwt.admin || Number(req.jwt.id) === Number(userId)) {
    if (user) {
      res.status(200).json(user)
    } else {
      next()
    }
  }
  else {
    res.status(403).json({
      error: `${jwt.id} isn't authorized to access ${userId}.`
    })
    return
  }
});

// Create a new user
router.post('/', async function (req, res, next) {
  if (!admin(req) && req.body.admin) {
    res.status(403).json({
      error: `Only admins can create admins.`
    })
    return
  }
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map(e => e.message)
      res.status(400).json(messages)
    } else {
      next(err)
    }
  }
})

function authorized(req) {
  const authHeader = req.headers.authorization
  const auth = authHeader && authHeader.split(' ')[1]
  if (!auth) {
    return false
  }
  try {
    req.auth = jsonwebtoken.verify(auth, process.env.JWT_SECRET)
    return true
  }
  catch (e) {
    return false
  }
}

function admin(req) {
  return authorized(req) && req.jwt.admin
}

module.exports = router