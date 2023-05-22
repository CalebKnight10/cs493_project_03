const { Router } = require('express')
const { ValidationError } = require('sequelize')

const { Photo, PhotoClientFields } = require('../models/photo')

const reqAuthentication = require('../lib/auth')

const router = Router()

/*
 * Route to create a new photo.
 */
router.post('/', reqAuthentication, async function (req, res, next) {
  if(req.jwt.admin || Number(req.jwt.id) === Number(req.body.userId)) {
    try {
      const photo = await Photo.create(req.body, PhotoClientFields)
      res.status(201).send({ id: photo.id })
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.message })
      } else {
        throw e
      }
    }
  }
  else {
    res.status(403).send({
      error: `${req.jwt.id} isn't authorized to create a photo for ${req.body.userId}.`
    })
  }
})

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoId', async function (req, res, next) {
  const photoId = req.params.photoId
  const photo = await Photo.findByPk(photoId)
  if (photo) {
    res.status(200).send(photo)
  } else {
    next()
  }
})

/*
 * Route to update a photo.
 */
router.patch('/:photoId', reqAuthentication, owned, async function (req, res, next) {
  const photoId = req.params.photoId
  /*
   * Update photo without allowing client to update businessId or userId.
   */
  const result = await Photo.update(req.body, {
    where: { id: photoId },
    fields: PhotoClientFields.filter(
      field => field !== 'businessId' && field !== 'userId'
    )
  })
  if (result[0] > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

/*
 * Route to delete a photo.
 */
router.delete('/:photoId', async function (req, res, next) {
  const photoId = req.params.photoId
  const result = await Photo.destroy({ where: { id: photoId }})
  if (result > 0) {
    res.status(204).send()
  } else {
    next()
  }
})


function owned (req, res, next) {
  const photoId = req.params.photoId
  if (req.jwt.admin) {
    return next()
  }
  Photo.findByPk(photoId).then(photo => {
    if (photo.userId === req.jwt.id) {
      next()
    } else {
      res.status(403).send({
        error: `${req.jwt.id} isn't authorized to update photo ${photoId}.`
      })
    }
  })
}

module.exports = router
