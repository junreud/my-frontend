import fs from "fs";
import http from "http";
import https from "https";
import { parse } from "url";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// 포트 설정: 명령어 인자 > 환경 변수 > 기본값(3000)
const args = process.argv.slice(2);
const portArg = args.find(arg => arg.startsWith('-p') || arg.startsWith('--port'));
let PORT = 3000;

if (portArg) {
  if (portArg.includes('=')) {
    PORT = parseInt(portArg.split('=')[1]);
  } else {
    const portIndex = args.indexOf(portArg);
    PORT = parseInt(args[portIndex + 1]);
  }
} else if (process.env.PORT) {
  PORT = parseInt(process.env.PORT);
}

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
        .listen(PORT, (err) => {
          if (err) throw err;
          console.log(`> HTTPS dev server running at https://localhost:${PORT}`);
        });
    } catch (err) {
      console.error("HTTPS 인증서를 찾을 수 없습니다. HTTP로 대체합니다.", err);
      // 인증서가 없으면 HTTP로 대체
      http
        .createServer((req, res) => {
          const parsedUrl = parse(req.url, true);
          handle(req, res, parsedUrl);
        })
        .listen(PORT, (err) => {
          if (err) throw err;
          console.log(`> HTTP dev server running at http://localhost:${PORT}`);
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
      .listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Production server running on port ${PORT}`);
      });
  }
});
