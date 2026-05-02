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

// 1. Server info
app.get('/sonolus/info', async (req, res) => {
    const response = await fetch(`${UPSTREAM}/sonolus/info`)
    const data = await response.json()
    data.title = 'SekaiPlus'
    data.description = 'Project Sekai engine powered by SekaiPlus'
    res.json(data)
})

// 2. Intercept engine next-sekai
app.get('/sonolus/engines/next-sekai', async (req, res) => {
    const base = `https://${req.get('host')}`
    res.json({
        item: {
            name: 'next-sekai',
            version: 13,
            title: { en: 'SekaiPlus' },
            subtitle: { en: 'Project Sekai: Colorful Stage!' },
            author: { en: 'SekaiPlus' },
            tags: [],
            skin: 'next-sekai-01',
            background: 'next-sekai',
            effect: 'next-sekai-01',
            particle: 'next-sekai',
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

// 3. Intercept level list - hapus source engine
app.get('/sonolus/levels/list', async (req, res) => {
    const qs = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''
    const url = `${UPSTREAM}/sonolus/levels/list${qs}`
    const response = await fetch(url)
    const data = await response.json()
    for (const item of data.items) {
        if (item.engine) item.engine.source = ''
    }
    res.json(data)
})

// 4. Intercept level detail - hapus source engine semua
app.get('/sonolus/levels/:name', async (req, res) => {
    const url = `${UPSTREAM}/sonolus/levels/${req.params.name}`
    const response = await fetch(url)
    const data = await response.json()
    
    // Hapus source di level utama
    if (data.item?.engine) data.item.engine.source = ''
    
    // Hapus source di semua sections
    if (data.sections) {
        for (const section of data.sections) {
            if (section.items) {
                for (const item of section.items) {
                    if (item.engine) item.engine.source = ''
                }
            }
        }
    }
    
    res.json(data)
})

// 5. Proxy level data (binary)
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