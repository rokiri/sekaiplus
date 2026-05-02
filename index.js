import express from 'express'

const UPSTREAM = 'https://sonolus.sekai.best'

const app = express()

app.use('/sonolus', async (req, res) => {
    // Intercept engine pjsekai → arahkan ke engine kamu sendiri
    if (req.path === '/engines/pjsekai') {
        // nanti isi dengan engine data kamu
        res.json({ message: 'custom engine here' })
        return
    }

    const url = `${UPSTREAM}/sonolus${req.path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`
    const response = await fetch(url)
    const data = await response.text()
    res.status(response.status)
    res.set('Content-Type', response.headers.get('Content-Type'))
    res.send(data)
})

app.listen(3000, () => {
    console.log('Server jalan di http://localhost:3000')
})