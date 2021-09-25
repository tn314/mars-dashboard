require('dotenv').config()
const API_BASE_URL = 'https://api.nasa.gov'
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`${API_BASE_URL}/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rovers', async (req, res) => {
    try {
        let rovers = await fetch(`${API_BASE_URL}/mars-photos/api/v1/rovers?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send( rovers )
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rovers/:rover/photos/:max_date', async (req, res) => {
    const roverSlug = req.params.rover;
    const roverMaxDate = req.params.max_date;

    try {
        let rover = await fetch(`${API_BASE_URL}/mars-photos/api/v1/rovers/${roverSlug}/photos?earth_date=${roverMaxDate}&page=1&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send( rover )
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))