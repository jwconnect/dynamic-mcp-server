_# 동적 MCP 서버 시스템 - 아키텍처 설계

## 1. 시스템 아키텍처

본 시스템은 **모듈형 마이크로서비스 아키텍처**를 기반으로 하며, 백엔드와 프론트엔드를 명확히 분리하여 독립적인 개발과 배포를 지원합니다. 백엔드는 Node.js와 Express를 사용하여 동적 MCP 서버 기능을 제공하고, 프론트엔드는 웹 기반 관리 GUI를 제공합니다.

### 1.1. 아키텍처 다이어그램

```mmd
graph TD
    subgraph "User Interface"
        A[Web Browser - Admin UI] --> B{Express.js Server}
        C[MCP Clients] --> B
    end

    subgraph "Backend Server (Node.js)"
        B -- "/mcp" --> D[MCP Router]
        B -- "/api" --> E[Admin API Router]
        B -- "/" --> F[Static File Server]
    end

    subgraph "MCP Core"
        D --> G[MCP Server Manager]
        G -- "Reads" --> H(config.json)
        G -- "Creates/Manages" --> I[MCP Server Instances]
        I -- "Executes" --> J[Dynamic Tool Handlers]
    end

    subgraph "Admin Core"
        E --> K[Config Controller]
        K -- "Reads/Writes" --> H
        E --> L[Log Controller]
        L -- "Reads" --> M[Log Files]
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
```

### 1.2. 컴포넌트 설명

| 컴포넌트 | 설명 |
| --- | --- |
| **Web Browser - Admin UI** | 프론트엔드 애플리케이션으로, 사용자가 MCP 서버 설정을 관리하고 모니터링합니다. | 
| **MCP Clients** | Claude, VS Code 등 MCP 프로토콜을 지원하는 외부 클라이언트입니다. | 
| **Express.js Server** | 백엔드의 메인 진입점으로, 라우팅 및 미들웨어 관리를 담당합니다. | 
| **MCP Router** | `/mcp` 경로로 들어오는 모든 MCP 관련 요청을 처리하여 `MCP Server Manager`로 전달합니다. | 
| **Admin API Router** | `/api` 경로로 들어오는 관리 UI용 REST API 요청을 처리합니다. | 
| **Static File Server** | 빌드된 프론트엔드 정적 파일(HTML, CSS, JS)을 서빙합니다. | 
| **MCP Server Manager** | `config.json`을 읽어 MCP 서버 인스턴스를 동적으로 생성, 관리, 업데이트하는 핵심 컴포넌트입니다. | 
| **MCP Server Instances** | `@modelcontextprotocol/sdk`를 사용하여 생성된 개별 MCP 서버 인스턴스입니다. | 
| **Dynamic Tool Handlers** | `config.json`에 정의된 실제 기능 로직을 담고 있는 모듈입니다. | 
| **Config Controller** | 관리 UI에서 설정 파일을 읽고 쓰는 API를 제공합니다. | 
| **Log Controller** | 서버 로그를 조회하는 API를 제공합니다. | 
| **config.json** | 전체 시스템의 동작을 정의하는 중앙 설정 파일입니다. | 

## 2. 디렉토리 구조

프로젝트의 확장성과 유지보수성을 고려하여 다음과 같은 디렉토리 구조를 제안합니다.

```
dynamic-mcp-server/
├── server/                  # 백엔드 서버 소스코드
│   ├── api/                  # 관리 API 라우터 및 컨트롤러
│   │   ├── config.controller.js
│   │   └── logs.controller.js
│   ├── mcp/                  # MCP 핵심 로직
│   │   ├── server-manager.js # MCP 서버 인스턴스 관리자
│   │   └── tool-loader.js    # 동적 핸들러 로더
│   ├── handlers/             # 사용자가 정의하는 동적 기능 핸들러
│   │   └── weather.js
│   ├── middleware/           # Express 미들웨어
│   ├── app.js                # Express 앱 설정
│   └── index.js              # 서버 시작점
├── client/                  # 프론트엔드 (React/Vue) 소스코드
│   ├── public/
│   └── src/
├── logs/                    # 서버 로그 파일
├── config.json              # 중앙 설정 파일
├── package.json
└── nodemon.json
```

## 3. 데이터 모델 상세

### 3.1. `config.json` 스키마

`config.json` 파일은 시스템의 모든 동작을 정의하는 핵심 파일입니다. 각 속성에 대한 상세 설명은 다음과 같습니다.

```json
{
  "global": {
    "port": 3000,
    "host": "0.0.0.0",
    "logLevel": "info"
  },
  "servers": [
    {
      "name": "weather-server",
      "version": "1.0.0",
      "description": "날씨 정보 제공 서버",
      "enabled": true,
      "transport": "http", // "http" or "stdio"
      "tools": [
        {
          "name": "get-weather",
          "title": "날씨 조회",
          "description": "도시별 현재 날씨를 조회합니다.",
          "inputSchema": {
            "city": { "type": "string", "description": "도시 이름 (예: Seoul)" }
          },
          "outputSchema": {
            "temperature": { "type": "number" },
            "condition": { "type": "string" }
          },
          "handler": {
            "path": "handlers/weather.js",
            "function": "getWeather"
          }
        }
      ],
      "resources": [],
      "prompts": []
    }
  ]
}
```

- **global**: 서버 전역 설정 (포트, 호스트 등)
- **servers**: 관리할 MCP 서버 목록 (배열)
- **servers[].name**: MCP 서버의 고유 이름 (URL 경로에 사용 가능)
- **servers[].transport**: 통신 방식 (`http` 또는 `stdio`)
- **servers[].tools**: 해당 서버가 제공할 도구 목록
- **tools[].handler**: 실제 로직을 담고 있는 파일 경로와 함수 이름

## 4. 핵심 로직 흐름

### 4.1. 서버 시작 및 동적 로딩

```mmd
sequenceDiagram
    participant User
    participant Node.js
    participant MCP_Manager
    participant MCP_Instance

    User->>Node.js: `npm start` 실행
    Node.js->>MCP_Manager: 초기화 및 `config.json` 로드
    MCP_Manager->>MCP_Manager: 설정 파일 파싱 및 유효성 검사
    loop for each server in config
        MCP_Manager->>MCP_Instance: MCP 서버 인스턴스 생성
        MCP_Manager->>MCP_Instance: Tool, Resource, Prompt 등록
    end
    MCP_Manager-->>Node.js: 초기화 완료
    Node.js-->>User: 서버 시작 완료 로그 출력
```

### 4.2. 설정 변경 및 핫 리로딩

```mmd
sequenceDiagram
    participant User
    participant FS_Watcher
    participant MCP_Manager

    User->>FS_Watcher: `config.json` 파일 수정
    FS_Watcher->>MCP_Manager: 파일 변경 이벤트 전송
    MCP_Manager->>MCP_Manager: 기존 MCP 인스턴스 모두 제거
    MCP_Manager->>MCP_Manager: `config.json` 다시 로드
    loop for each server in new config
        MCP_Manager->>MCP_Manager: 신규 MCP 인스턴스 생성 및 등록
    end
    MCP_Manager-->>User: 핫 리로딩 완료 로그 출력
```

## 5. API 설계 (프론트엔드-백엔드)

관리 GUI를 위한 REST API 명세입니다.

| 메서드 | 경로 | 설명 | 요청 본문 | 응답 본문 |
| --- | --- | --- | --- | --- |
| `GET` | `/api/config` | 현재 `config.json` 내용을 조회합니다. | - | `config.json` 객체 |
| `POST` | `/api/config` | `config.json` 내용을 업데이트합니다. | `config.json` 객체 | `{ "success": true }` |
| `GET` | `/api/logs` | 서버 로그를 조회합니다. | - | `{ "logs": [...] }` |
| `GET` | `/api/status` | 서버 및 MCP 인스턴스 상태를 조회합니다. | - | `{ "status": "running", ... }` |

## 6. 기술 스택

| 구분 | 기술 | 사유 |
| --- | --- | --- |
| **백엔드** | Node.js, Express | 비동기 I/O, 방대한 npm 생태계, 빠른 개발 속도 |
| **MCP SDK** | `@modelcontextprotocol/sdk` | 공식 TypeScript/JavaScript SDK |
| **프론트엔드** | React (Vite) | 컴포넌트 기반, 풍부한 라이브러리, 빠른 개발 환경 |
| **설정 검증** | Zod | 스키마 기반의 강력한 타입 검증 |
| **프로세스 관리** | Nodemon | 개발 시 코드 변경 감지 및 자동 재시작 |
| **파일 감시** | Chokidar | `config.json` 핫 리로딩을 위한 안정적인 파일 감시 |

이 설계 문서는 프로젝트의 청사진 역할을 하며, 이후 개발 단계에서 구체적인 구현의 기반이 될 것입니다.
_
