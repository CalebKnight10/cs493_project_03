const { Router } = require('express')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')
const { User, UserClientFields } = require('../models/user')

const reqAuthentication = require("../lib/authenticate");


const router = Router()

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', async function (req, res) {
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', async function (req, res) {
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId }})
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', async function (req, res) {
  const userId = req.params.userId
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
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
  const jwt = req.jwt
  if (!jwt.admin && Number(jwt.id) !== Number(userId)) {
    res.status(403).json({
      error: `${jwt.id} isn't authorized to access ${userId}.`
    })
    return
  }
  const user = await User.findByPk(userId)
  if (user) {
    res.status(200).json(user)
  } else {
    next()
  }
});

module.exports = router