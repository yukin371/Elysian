<script>
import { useAppBootstrap } from "./app/bootstrap/use-app-bootstrap"

export default {
  async onLaunch() {
    await useAppBootstrap()
  },
  onShow() {
    console.log("[elysian:uniapp] show")
  },
  onHide() {
    console.log("[elysian:uniapp] hide")
  },
}
</script>

<style>
page {
  background: #f4f7fb;
  color: #142033;
  font-family:
    "Segoe UI",
    "PingFang SC",
    "Microsoft YaHei",
    sans-serif;
}
</style>
