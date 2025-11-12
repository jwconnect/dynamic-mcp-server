# 🚀 Dynamic MCP Server

**Node.js 기반의 동적 MCP(Model Context Protocol) 서버 시스템**

JSON 설정 파일을 통해 다양한 기능을 동적으로 추가/제거/수정할 수 있는 유연한 MCP 서버입니다. 웹 기반 관리 GUI를 제공하여 직관적인 서버 관리가 가능합니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## ✨ 주요 기능

- **🔄 동적 기능 관리**: JSON 설정 파일로 Tools, Resources, Prompts를 동적으로 관리
- **🔥 핫 리로딩**: 설정 파일 변경 시 서버 재시작 없이 자동 업데이트
- **🌐 HTTP Transport**: Streamable HTTP를 통한 웹 기반 MCP 통신
- **📊 관리 GUI**: 웹 브라우저에서 설정 편집, 로그 확인, 상태 모니터링
- **🔌 멀티 클라이언트 지원**: Claude Desktop, VS Code, Cursor 등 다양한 MCP 클라이언트와 호환
- **📝 자동 로깅**: Winston 기반의 구조화된 로그 시스템
- **⚡ 고성능**: Node.js 비동기 I/O를 활용한 효율적인 요청 처리

## 📋 시스템 요구사항

- **Node.js**: v18.0.0 이상 (v22.13.0 권장)
- **운영체제**: Linux, macOS, Windows
- **메모리**: 최소 512MB RAM

## 🚀 빠른 시작

### 1. 설치

```bash
# 리포지토리 클론
git clone https://github.com/YOUR_USERNAME/dynamic-mcp-server.git
cd dynamic-mcp-server

# 의존성 설치
yarn install
# 또는
npm install
```

### 2. 서버 실행

```bash
# 프로덕션 모드
npm start

# 개발 모드 (nodemon 사용)
npm run dev
```

서버가 시작되면 다음 URL에서 접근할 수 있습니다:

- **관리 UI**: http://localhost:3000
- **MCP 엔드포인트**: http://localhost:3000/mcp
- **Health Check**: http://localhost:3000/health

## 📖 사용 방법

### MCP 클라이언트 연결

#### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` 파일에 다음을 추가:

```json
{
  "mcpServers": {
    "dynamic-mcp": {
      "url": "http://localhost:3000/mcp",
      "transport": "http"
    }
  }
}
```

#### Claude Code (CLI)

```bash
claude mcp add --transport http dynamic-mcp http://localhost:3000/mcp
```

#### VS Code

```bash
code --add-mcp '{"name":"dynamic-mcp","type":"http","url":"http://localhost:3000/mcp"}'
```

#### MCP Inspector (테스트용)

```bash
npx @modelcontextprotocol/inspector
```

그 다음 `http://localhost:3000/mcp`에 연결하세요.

### 설정 파일 구조

`config.json` 파일은 다음과 같은 구조를 가집니다:

```json
{
  "global": {
    "port": 3000,
    "host": "0.0.0.0",
    "logLevel": "info"
  },
  "servers": [
    {
      "name": "demo-server",
      "version": "1.0.0",
      "description": "데모 MCP 서버",
      "enabled": true,
      "tools": [
        {
          "name": "add",
          "title": "덧셈 계산기",
          "description": "두 숫자를 더합니다",
          "inputSchema": {
            "a": { "type": "number", "description": "첫 번째 숫자" },
            "b": { "type": "number", "description": "두 번째 숫자" }
          },
          "outputSchema": {
            "result": { "type": "number", "description": "덧셈 결과" }
          },
          "handler": {
            "path": "handlers/calculator.js",
            "function": "add"
          }
        }
      ],
      "resources": [],
      "prompts": []
    }
  ]
}
```

### 커스텀 핸들러 작성

`server/handlers/` 디렉토리에 새로운 핸들러 파일을 작성하고, `config.json`에서 참조하세요.

```javascript
// server/handlers/my-handler.js
export async function myFunction({ param1, param2 }) {
  // 비즈니스 로직 구현
  const result = param1 + param2;
  
  return {
    result: result
  };
}
```

## 🏗️ 프로젝트 구조

```
dynamic-mcp-server/
├── server/                  # 백엔드 서버
│   ├── api/                 # REST API 컨트롤러
│   ├── mcp/                 # MCP 핵심 로직
│   │   └── server-manager.js
│   ├── handlers/            # 동적 기능 핸들러
│   ├── middleware/          # Express 미들웨어
│   ├── app.js               # Express 앱 설정
│   ├── index.js             # 서버 시작점
│   └── logger.js            # 로깅 유틸리티
├── client/                  # 프론트엔드 GUI
│   └── public/
│       ├── index.html
│       ├── style.css
│       └── app.js
├── logs/                    # 로그 파일
├── config.json              # 설정 파일
├── package.json
└── README.md
```

## 🔧 API 문서

### REST API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/config` | 현재 설정 조회 |
| `POST` | `/api/config` | 설정 업데이트 |
| `GET` | `/api/status` | 서버 상태 조회 |
| `GET` | `/api/logs` | 로그 조회 |
| `DELETE` | `/api/logs` | 로그 삭제 |
| `GET` | `/health` | Health Check |

### MCP 프로토콜

| 경로 | 설명 |
|------|------|
| `/mcp` | 기본 MCP 엔드포인트 |
| `/mcp/:serverName` | 특정 서버 지정 엔드포인트 |

## 🧪 테스트

```bash
# 서버 시작
npm start

# 다른 터미널에서 Health Check
curl http://localhost:3000/health

# Status API 테스트
curl http://localhost:3000/api/status
```

## 📝 로깅

로그는 `logs/` 디렉토리에 저장됩니다:

- `combined.log`: 모든 로그
- `error.log`: 에러 로그만

로그 레벨은 `config.json`의 `global.logLevel`에서 설정할 수 있습니다.

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP 프로토콜 및 SDK 제공
- [Anthropic](https://www.anthropic.com/) - Claude 및 MCP 생태계 구축

## 📞 문의

프로젝트에 대한 질문이나 제안이 있으시면 [Issues](https://github.com/YOUR_USERNAME/dynamic-mcp-server/issues)를 통해 연락주세요.

---

**Made with ❤️ by Manus AI**
