import 'dotenv/config'
import app from './api/index.js'

const PORT = process.env.PORT || 8088

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
