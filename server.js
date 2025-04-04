import fs from "fs";
import http from "http";
import https from "https";
import { parse } from "url";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // 개발 환경: HTTPS 서버 (로컬 인증서 사용)
  if (dev) {
    try {
      // mkcert로 발급받은 인증서 읽기
      const httpsOptions = {
        key: fs.readFileSync("./localhost+2-key.pem"),
        cert: fs.readFileSync("./localhost+2.pem"),
      };

      https
        .createServer(httpsOptions, (req, res) => {
          const parsedUrl = parse(req.url, true);
          handle(req, res, parsedUrl);
        })
        .listen(3000, (err) => {
          if (err) throw err;
          console.log("> HTTPS dev server running at https://localhost:3000");
        });
    } catch (err) {
      console.error("HTTPS 인증서를 찾을 수 없습니다. HTTP로 대체합니다.", err);
      // 인증서가 없으면 HTTP로 대체
      http
        .createServer((req, res) => {
          const parsedUrl = parse(req.url, true);
          handle(req, res, parsedUrl);
        })
        .listen(3000, (err) => {
          if (err) throw err;
          console.log("> HTTP dev server running at http://localhost:3000");
        });
    }
  } 
  // 프로덕션 환경: 일반 HTTP 서버 (프록시 뒤에서 실행되므로 HTTP만으로도 충분)
  else {
    http
      .createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      })
      .listen(3000, (err) => {
        if (err) throw err;
        console.log("> Production server running on port 3000");
      });
  }
});
