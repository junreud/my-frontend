import fs from "fs"
import https from "https"
import { parse } from "url"
import next from "next"

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

// mkcert로 발급받은 인증서 읽기
const httpsOptions = {
  key: fs.readFileSync("./localhost+2-key.pem"),
  cert: fs.readFileSync("./localhost+2.pem"),
}

app.prepare().then(() => {
  https
    .createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })
    .listen(3000, (err) => {
      if (err) throw err
      console.log("> HTTPS dev server running at https://localhost:3000")
    })
})
