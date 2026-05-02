import express from 'express'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'

const UPSTREAM = 'https://sonolus.sekai.best'
const PORT = process.env.PORT || 3000

const app = express()

// Serve engine files
app.use('/engine', express.static('./engine'))

// Helper hash file
const hashFile = (path) => {
    const buf = readFileSync(path)
    return createHash('sha1').update(buf).digest('hex')
}

// Intercept engine detail pjsekai
app.get('/sonolus/engines/pjsekai', async (req, res) => {
    const base = `${req.protocol}://${req.get('host')}`
    res.json({
        item: {
            name: 'pjsekai',
            version: 13,
            title: { en: 'Project Sekai' },
            subtitle: { en: 'Project Sekai: Colorful Stage!' },
            author: { en: 'Burrito + Nanashi' },
            tags: [],
            skin: '',
            background: '',
            effect: '',
            particle: '',
            thumbnail: { hash: hashFile('./engine/thumbnail.png'), url: `${base}/engine/thumbnail.png` },
            playData: { hash: hashFile('./engine/EnginePlayData'), url: `${base}/engine/EnginePlayData` },
            watchData: { hash: hashFile('./engine/EngineWatchData'), url: `${base}/engine/EngineWatchData` },
            previewData: { hash: hashFile('./engine/EnginePreviewData'), url: `${base}/engine/EnginePreviewData` },
            tutorialData: { hash: hashFile('./engine/EngineTutorialData'), url: `${base}/engine/EngineTutorialData` },
            configuration: { hash: hashFile('./engine/EngineConfiguration'), url: `${base}/engine/EngineConfiguration` },
        },
        description: '',
        recommended: []
    })
})

// Proxy semua request lain ke sekai.best
app.use('/sonolus', async (req, res) => {
    const url = `${UPSTREAM}/sonolus${req.path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`
    const response = await fetch(url)
    const data = await response.text()
    res.status(response.status)
    res.set('Content-Type', response.headers.get('Content-Type'))
    res.send(data)
})

app.listen(PORT, () => {
    console.log(`Server jalan di port ${PORT}`)
})