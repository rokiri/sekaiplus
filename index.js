import express from 'express'

const UPSTREAM = 'https://sonolus.sekai.best'
const PORT = process.env.PORT || 3000
const app = express()

// 1. Server info
app.get('/sonolus/info', async (req, res) => {
    const response = await fetch(`${UPSTREAM}/sonolus/info`)
    const data = await response.json()
    data.title = 'SekaiPlus'
    data.description = 'Project Sekai powered by SekaiPlus'
    res.json(data)
})

// 2. Proxy level data (binary)
app.get('/sonolus/levels/:name/data', async (req, res) => {
    const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : ''
    const url = `${UPSTREAM}/sonolus/levels/${req.params.name}/data${qs}`
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    res.status(response.status)
    res.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream')
    res.send(Buffer.from(buffer))
})

// 3. Proxy repository (binary)
app.use('/sonolus/repository', async (req, res) => {
    const url = `${UPSTREAM}/sonolus/repository${req.path}`
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    res.status(response.status)
    res.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream')
    res.send(Buffer.from(buffer))
})

// 4. Proxy semua request lain
app.use('/sonolus', async (req, res) => {
    const qs = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''
    const url = `${UPSTREAM}/sonolus${req.path}${qs}`
    const response = await fetch(url)
    const data = await response.text()
    res.status(response.status)
    res.set('Content-Type', response.headers.get('Content-Type'))
    res.send(data)
})

app.listen(PORT, () => {
    console.log(`Server jalan di port ${PORT}`)
})