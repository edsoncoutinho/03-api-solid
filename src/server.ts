import { app } from './app'
import { env } from './env'

app.listen({
  host: '0.0.0.0',
  port: env.PORT
}).then(() => {
  console.log('\u{1F680} HTTP Server Running!')
}).catch((error) => {
  console.error('\u{1F6A8} Error starting server:', error)
})
