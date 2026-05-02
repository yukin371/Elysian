import { createApp } from "vue"

import App from "./App.vue"
import { exampleAppRouter } from "./router/app-router"
import "./style.css"

const app = createApp(App)

app.use(exampleAppRouter)

void exampleAppRouter.isReady().then(() => {
  app.mount("#app")
})
