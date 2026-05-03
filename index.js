import express from 'express'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'

const UPSTREAM = 'https://sonolus.sekai.best'
const PORT = process.env.PORT || 3000
const app = express()

app.use('/engine', express.static('./engine'))

const hashFile = (path) => {
    const buf = readFileSync(path)
    return createHash('sha1').update(buf).digest('hex')
}

const fixEngine = (engine, base) => {
    if (!engine) return
    engine.source = ''
    engine.name = 'sekaiplus'
    engine.title = 'SekaiPlus'
    // Biarkan skin/background/effect/particle dari sekai.best
    // hanya ganti engine data files
    engine.playData = { hash: hashFile('./engine/EnginePlayData'), url: `${base}/engine/EnginePlayData` }
    engine.watchData = { hash: hashFile('./engine/EngineWatchData'), url: `${base}/engine/EngineWatchData` }
    engine.previewData = { hash: hashFile('./engine/EnginePreviewData'), url: `${base}/engine/EnginePreviewData` }
    engine.tutorialData = { hash: hashFile('./engine/EngineTutorialData'), url: `${base}/engine/EngineTutorialData` }
    engine.configuration = { hash: hashFile('./engine/EngineConfiguration'), url: `${base}/engine/EngineConfiguration` }
    engine.thumbnail = { hash: hashFile('./engine/thumbnail.png'), url: `${base}/engine/thumbnail.png` }
}

// 1. Server info
app.get('/sonolus/info', async (req, res) => {
    const response = await fetch(`${UPSTREAM}/sonolus/info`)
    const data = await response.json()
    data.title = 'SekaiPlus'
    data.description = 'Project Sekai engine powered by SekaiPlus'
    res.json(data)
})

// 2. Intercept engine sekaiplus
app.get('/sonolus/engines/sekaiplus', async (req, res) => {
    const base = `https://${req.get('host')}`
    const upstream = await fetch(`${UPSTREAM}/sonolus/engines/next-sekai`)
    const data = await upstream.json()
    fixEngine(data.item, base)
    res.json(data)
})

// 3. Intercept level list
app.get('/sonolus/levels/list', async (req, res) => {
    const qs = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''
    const url = `${UPSTREAM}/sonolus/levels/list${qs}`
    const response = await fetch(url)
    const data = await response.json()
    const base = `https://${req.get('host')}`
    for (const item of data.items) fixEngine(item.engine, base)
    res.json(data)
})

// 4. Intercept level detail
app.get('/sonolus/levels/:name', async (req, res) => {
    const url = `${UPSTREAM}/sonolus/levels/${req.params.name}`
    const response = await fetch(url)
    const data = await response.json()
    const base = `https://${req.get('host')}`
    fixEngine(data.item?.engine, base)
    if (data.sections) {
        for (const section of data.sections) {
            for (const item of section.items || []) fixEngine(item.engine, base)
        }
    }
    res.json(data)
})

// 5. Proxy level data (binary) - tanpa converter
app.get('/sonolus/levels/:name/data', async (req, res) => {
    const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : ''
    const url = `${UPSTREAM}/sonolus/levels/${req.params.name}/data${qs}`
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    res.status(response.status)
    res.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream')
    res.send(Buffer.from(buffer))
})
// 6. Proxy repository (binary)
app.use('/sonolus/repository', async (req, res) => {
    const url = `${UPSTREAM}/sonolus/repository${req.path}`
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    res.status(response.status)
    res.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream')
    res.send(Buffer.from(buffer))
})

// 7. Proxy semua request lain
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