
const Boom = require('boom')
const logger = require('../config/logger')
const express = require('express')

const router = express.Router()

router.post('/', (req, res) => {

    const url = req.body.url

    return res.send(url)
})

module.exports = router
