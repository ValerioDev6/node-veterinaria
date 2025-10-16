import { envs } from './config/envs'
import { AppRouter } from './core/routes'
import { Server } from './core/server'

;(() => {
  main()
})()

function main() {
  const server = new Server({
    port: envs.PORT,
    routes: AppRouter.routes,
  })
  server.start()
}
