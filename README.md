# 🚀 Dynamic MCP Server v2.0

**Node.js 기반의 고급 동적 MCP(Model Context Protocol) 서버 시스템**

JSON 설정 파일을 통해 다양한 기능을 동적으로 추가/제거/수정할 수 있는 유연한 MCP 서버입니다. 드래그 앤 드롭 기반의 직관적인 웹 GUI를 제공하여 멀티 서버 관리, 핸들러 자동 스캔, 실시간 테스트 등을 지원합니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## ✨ 주요 기능 (v2.0 신규 추가)

### 🆕 v2.0 업데이트
- **🔍 핸들러 자동 스캔**: `handlers/` 디렉토리의 모든 함수를 자동으로 감지하고 메타데이터 추출
- **🎯 드래그 앤 드롭**: 핸들러를 마우스로 드래그하여 서버 간 이동
- **🖥️ 멀티 서버 관리**: 여러 MCP 서버를 한 곳에서 생성/관리 (계산기1, 공학계산기2 등)
- **✅ 사용 여부 체크**: 각 핸들러의 활성화/비활성화를 체크박스로 간편하게 제어
- **▶️ 테스트 버튼**: 웹 GUI에서 직접 핸들러 함수를 테스트하고 결과 확인
- **📂 자동 그룹화**: 파일별, 카테고리별로 핸들러를 자동 그룹화
- **🎨 개선된 UI/UX**: 현대적이고 반응형 디자인의 관리 대시보드

### 기존 기능
- **🔄 동적 기능 관리**: JSON 설정 파일로 Tools, Resources, Prompts 관리
- **🔥 핫 리로딩**: 설정 파일 변경 시 서버 재시작 없이 자동 업데이트
- **🌐 HTTP Transport**: Streamable HTTP를 통한 웹 기반 MCP 통신
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
git clone https://github.com/jwconnect/dynamic-mcp-server.git
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

### 웹 GUI 사용하기

#### 1. 서버 관리
1. 웹 브라우저에서 `http://localhost:3000` 접속
2. "서버 관리" 탭에서 "새 서버 생성" 버튼 클릭
3. 서버 이름, 버전, 설명 입력
4. 생성된 서버는 토글 스위치로 활성화/비활성화 가능

#### 2. 핸들러 스캔 및 관리
1. "핸들러 관리" 탭으로 이동
2. "핸들러 스캔" 버튼 클릭하여 모든 핸들러 자동 감지
3. 그룹화 옵션 선택 (파일별, 카테고리별, 그룹화 안 함)
4. 핸들러를 드래그하여 원하는 서버로 이동
5. 체크박스로 핸들러 활성화/비활성화
6. "테스트" 버튼으로 핸들러 실행 결과 확인

#### 3. 핸들러 테스트
1. 핸들러 카드의 "테스트" 버튼 클릭
2. 입력 파라미터를 JSON 형식으로 입력
3. "실행" 버튼 클릭하여 결과 확인
4. 실행 시간 및 반환 값 표시

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

### 커스텀 핸들러 작성

`server/handlers/` 디렉토리에 새로운 핸들러 파일을 작성하세요:

```javascript
/**
 * @title 내 계산기
 * @description 두 숫자를 더합니다
 * @category calculator
 */
export async function myAdd({ a, b }) {
  return {
    result: a + b
  };
}

/**
 * @title 내 곱셈
 * @description 두 숫자를 곱합니다
 * @category calculator
 */
export async function myMultiply({ a, b }) {
  return {
    result: a * b
  };
}
```

파일을 저장한 후 웹 GUI에서 "핸들러 스캔" 버튼을 클릭하면 자동으로 감지됩니다!

## 🏗️ 프로젝트 구조

```
dynamic-mcp-server/
├── server/                  # 백엔드 서버
│   ├── api/                 # REST API 컨트롤러
│   │   ├── config.controller.js
│   │   ├── logs.controller.js
│   │   ├── handlers.controller.js  # 🆕 핸들러 관리 API
│   │   └── servers.controller.js   # 🆕 서버 관리 API
│   ├── mcp/                 # MCP 핵심 로직
│   │   └── server-manager.js
│   ├── handlers/            # 동적 기능 핸들러
│   │   ├── calculator.js
│   │   ├── engineering.js   # 🆕 공학 계산기
│   │   └── greeting.js
│   ├── middleware/          # Express 미들웨어
│   ├── app.js               # Express 앱 설정
│   ├── index.js             # 서버 시작점
│   └── logger.js            # 로깅 유틸리티
├── client/                  # 프론트엔드 GUI
│   └── public/
│       ├── index.html       # 🆕 개편된 UI
│       ├── style.css        # 🆕 현대적 디자인
│       └── app.js           # 🆕 드래그 앤 드롭 로직
├── logs/                    # 로그 파일
├── config.json              # 설정 파일
├── package.json
└── README.md
```

## 🔧 API 문서

### REST API

#### 서버 관리
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/servers` | 모든 서버 목록 조회 |
| `GET` | `/api/servers/:name` | 특정 서버 상세 조회 |
| `POST` | `/api/servers` | 새 서버 생성 |
| `PUT` | `/api/servers/:name` | 서버 정보 업데이트 |
| `DELETE` | `/api/servers/:name` | 서버 삭제 |
| `POST` | `/api/servers/:name/toggle` | 서버 활성화/비활성화 |

#### 핸들러 관리
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/handlers/scan` | 모든 핸들러 스캔 |
| `POST` | `/api/handlers/test` | 핸들러 테스트 실행 |
| `POST` | `/api/handlers/move` | 핸들러 서버 간 이동 |
| `POST` | `/api/handlers/toggle` | 핸들러 활성화/비활성화 |

#### 설정 및 로그
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

### API 테스트

```bash
# Health Check
curl http://localhost:3000/health

# 핸들러 스캔
curl http://localhost:3000/api/handlers/scan

# 핸들러 테스트
curl -X POST http://localhost:3000/api/handlers/test \
  -H "Content-Type: application/json" \
  -d '{"path":"handlers/calculator.js","function":"add","params":{"a":5,"b":3}}'

# 서버 생성
curl -X POST http://localhost:3000/api/servers \
  -H "Content-Type: application/json" \
  -d '{"name":"my-server","version":"1.0.0","description":"My MCP Server"}'
```

## 📝 로깅

로그는 `logs/` 디렉토리에 저장됩니다:

- `combined.log`: 모든 로그
- `error.log`: 에러 로그만

로그 레벨은 `config.json`의 `global.logLevel`에서 설정할 수 있습니다.

## 🎓 예제: 멀티 서버 구성

### 시나리오: 계산기 서버와 공학 계산기 서버 분리

1. **웹 GUI에서 서버 생성**
   - "서버 관리" 탭 → "새 서버 생성"
   - 서버 1: `basic-calculator` (기본 계산기)
   - 서버 2: `engineering-calculator` (공학 계산기)

2. **핸들러 스캔 및 할당**
   - "핸들러 관리" 탭 → "핸들러 스캔"
   - `add`, `multiply` → `basic-calculator`로 드래그
   - `sqrt`, `power`, `sin`, `cos` → `engineering-calculator`로 드래그

3. **클라이언트 연결**
   ```json
   {
     "mcpServers": {
       "basic-calc": {
         "url": "http://localhost:3000/mcp/basic-calculator",
         "transport": "http"
       },
       "engineering-calc": {
         "url": "http://localhost:3000/mcp/engineering-calculator",
         "transport": "http"
       }
     }
   }
   ```

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

프로젝트에 대한 질문이나 제안이 있으시면 [Issues](https://github.com/jwconnect/dynamic-mcp-server/issues)를 통해 연락주세요.

## 📊 버전 히스토리

### v2.0.0 (2025-11-12)
- 🆕 핸들러 자동 스캔 기능
- 🆕 드래그 앤 드롭 UI
- 🆕 멀티 서버 관리
- 🆕 핸들러 테스트 기능
- 🆕 자동 그룹화
- 🎨 UI/UX 대폭 개선

### v1.0.0 (2025-11-12)
- ✨ 초기 릴리스
- 🔄 동적 MCP 서버 시스템
- 🔥 핫 리로딩
- 📊 기본 관리 GUI

---

**Made with ❤️ by Manus AI**
