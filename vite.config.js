import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-upload-image',
      configureServer(server) {
        server.middlewares.use('/api/upload-image', (req, res, next) => {
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => {
              body += chunk
            })
            req.on('end', () => {
              try {
                const { filename, base64Data } = JSON.parse(body)
                if (!base64Data) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ error: 'No image data provided' }))
                  return
                }

                const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
                const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(base64Data, 'base64')
                const targetDir = path.resolve(process.cwd(), 'public/images/products')
                if (!fs.existsSync(targetDir)) {
                  fs.mkdirSync(targetDir, { recursive: true })
                }

                // Create a clean, unique filename
                const originalName = filename || 'custom_product.jpg'
                const ext = path.extname(originalName) || '.jpg'
                const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_')
                const finalFilename = `prod_${Date.now()}_${baseName}${ext}`
                const destPath = path.join(targetDir, finalFilename)

                fs.writeFileSync(destPath, buffer)

                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                  success: true,
                  filename: finalFilename,
                  url: `/images/products/${finalFilename}`
                }))
              } catch (err) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: err.message }))
              }
            })
          } else {
            next()
          }
        })
      }
    }
  ],
  server: {
    watch: {
      usePolling: true,
      interval: 100
    }
  }
})


