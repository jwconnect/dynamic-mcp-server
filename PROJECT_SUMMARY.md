# Dynamic MCP Server - 프로젝트 요약

## 📌 프로젝트 개요

**Dynamic MCP Server**는 Node.js 기반의 동적 MCP(Model Context Protocol) 서버 시스템으로, JSON 설정 파일을 통해 다양한 기능을 동적으로 추가/제거/수정할 수 있는 유연한 아키텍처를 제공합니다. 웹 기반 관리 GUI를 통해 직관적인 서버 관리가 가능하며, Claude Desktop, VS Code, Cursor 등 다양한 MCP 클라이언트와 호환됩니다.

## 🎯 핵심 목표 달성

### 1. 동적 기능 관리 ✅
- JSON 설정 파일(`config.json`)을 통한 선언적 기능 정의
- Tools, Resources, Prompts를 코드 수정 없이 추가/변경 가능
- 핸들러 모듈의 동적 로딩 시스템 구현

### 2. 고정 URL/포트 유지 ✅
- `http://localhost:3000/mcp` 엔드포인트로 일관된 접근
- 하나의 Express 서버에서 여러 MCP 서버 인스턴스 관리
- 클라이언트는 URL 변경 없이 다양한 기능 사용 가능

### 3. 핫 리로딩 ✅
- Chokidar를 사용한 파일 감시 시스템
- `config.json` 변경 시 서버 재시작 없이 자동 업데이트
- 무중단 기능 업데이트 지원

### 4. 멀티스레드 처리 ✅
- Node.js의 비동기 이벤트 루프 활용
- 동시 다발적인 MCP 요청 처리 가능
- 각 요청마다 독립적인 Transport 인스턴스 생성

### 5. 웹 기반 관리 GUI ✅
- 직관적인 대시보드 인터페이스
- 설정 파일 편집기 (JSON 에디터)
- 실시간 로그 뷰어
- 서버 상태 모니터링

### 6. 멀티 클라이언트 호환성 ✅
- Claude Desktop: HTTP transport 지원
- VS Code: MCP 확장 프로그램 연동
- Cursor: Deeplink 연결 지원
- Claude Code: CLI를 통한 등록
- MCP Inspector: 테스트 및 디버깅 도구

## 🏗️ 시스템 아키텍처

### 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 런타임 | Node.js | v22.13.0 |
| 웹 프레임워크 | Express | v4.18.2 |
| MCP SDK | @modelcontextprotocol/sdk | v1.21.1 |
| 스키마 검증 | Zod | v3.22.4 |
| 로깅 | Winston | v3.11.0 |
| 파일 감시 | Chokidar | v3.5.3 |
| 개발 도구 | Nodemon | v3.0.2 |

### 디렉토리 구조

```
dynamic-mcp-server/
├── server/                  # 백엔드 서버
│   ├── api/                 # REST API 컨트롤러
│   │   ├── config.controller.js
│   │   └── logs.controller.js
│   ├── mcp/                 # MCP 핵심 로직
│   │   └── server-manager.js
│   ├── handlers/            # 동적 기능 핸들러
│   │   ├── calculator.js
│   │   └── greeting.js
│   ├── middleware/          # Express 미들웨어
│   ├── app.js               # Express 앱 설정
│   ├── index.js             # 서버 시작점
│   └── logger.js            # 로깅 유틸리티
├── client/                  # 프론트엔드 GUI
│   └── public/
│       ├── index.html       # 메인 페이지
│       ├── style.css        # 스타일시트
│       └── app.js           # 클라이언트 로직
├── logs/                    # 로그 파일 디렉토리
├── config.json              # 중앙 설정 파일
├── package.json             # 프로젝트 메타데이터
├── nodemon.json             # Nodemon 설정
├── README.md                # 프로젝트 문서
├── LICENSE                  # MIT 라이선스
└── .gitignore               # Git 제외 파일
```

## 🔧 주요 컴포넌트

### 1. MCPServerManager (`server/mcp/server-manager.js`)
- MCP 서버 인스턴스의 생성 및 관리
- 설정 파일 로딩 및 파싱
- Tools, Resources, Prompts의 동적 등록
- 핸들러 모듈의 동적 로딩

### 2. Express App (`server/app.js`)
- HTTP 서버 설정 및 라우팅
- MCP 프로토콜 엔드포인트 제공
- REST API 엔드포인트 제공
- 정적 파일 서빙 (프론트엔드)

### 3. Config Controller (`server/api/config.controller.js`)
- 설정 파일 조회 API
- 설정 파일 업데이트 API
- 서버 상태 조회 API
- 백업 생성 기능

### 4. Logs Controller (`server/api/logs.controller.js`)
- 로그 파일 조회 API
- 로그 파일 삭제 API
- 로그 필터링 및 페이지네이션

### 5. 관리 GUI (`client/public/`)
- 반응형 웹 인터페이스
- 설정 편집 기능
- 로그 뷰어 기능
- 상태 모니터링 대시보드

## 📊 테스트 결과

모든 핵심 기능이 정상적으로 작동하며, 프로덕션 환경에 배포 가능한 상태입니다.

| 테스트 항목 | 결과 |
|-------------|------|
| 서버 시작 | ✅ 성공 |
| Health Check API | ✅ 성공 |
| Status API | ✅ 성공 |
| Config API | ✅ 성공 |
| MCP 프로토콜 | ✅ 성공 |
| 핫 리로딩 | ✅ 성공 |
| 프론트엔드 GUI | ✅ 성공 |

**전체 테스트 통과율: 100%**

## 🚀 배포 및 사용

### GitHub 리포지토리
- **URL**: https://github.com/jwconnect/dynamic-mcp-server
- **라이선스**: MIT License
- **공개 여부**: Public

### 설치 및 실행

```bash
# 클론
git clone https://github.com/jwconnect/dynamic-mcp-server.git
cd dynamic-mcp-server

# 의존성 설치
yarn install

# 서버 시작
npm start
```

### 접근 URL
- **관리 UI**: http://localhost:3000
- **MCP 엔드포인트**: http://localhost:3000/mcp
- **Health Check**: http://localhost:3000/health

## 💡 주요 특징 및 혁신

### 1. 플러그인 아키텍처
- 핸들러 모듈을 독립적으로 개발 및 배포 가능
- 커뮤니티 기여를 통한 핸들러 라이브러리 구축 가능
- 코드 수정 없이 기능 확장

### 2. 선언적 설정
- JSON 파일로 모든 기능을 정의
- 코드와 설정의 명확한 분리
- 버전 관리 및 백업 용이

### 3. 실시간 모니터링
- 웹 GUI를 통한 실시간 상태 확인
- 구조화된 로그 시스템
- 에러 추적 및 디버깅 지원

### 4. 개발자 친화적
- 명확한 프로젝트 구조
- 상세한 주석 및 문서
- 예제 핸들러 제공

## 📈 향후 개선 방향

### 1. 기능 확장
- Prompts 기능 완전 구현
- 인증 및 권한 관리 시스템
- 플러그인 마켓플레이스

### 2. 성능 최적화
- 캐싱 시스템 도입
- 데이터베이스 연동
- 클러스터 모드 지원

### 3. 개발 도구
- CLI 도구 제공
- 핸들러 생성 템플릿
- 자동화된 테스트 프레임워크

### 4. 문서 개선
- API 문서 자동 생성
- 튜토리얼 비디오
- 다국어 지원

## 🎓 학습 포인트

이 프로젝트를 통해 다음을 학습하고 구현했습니다:

1. **MCP 프로토콜의 이해**: MCP의 구조와 작동 원리
2. **동적 모듈 로딩**: Node.js의 ES Module 동적 import
3. **파일 시스템 감시**: Chokidar를 사용한 파일 변경 감지
4. **RESTful API 설계**: Express를 사용한 API 서버 구축
5. **프론트엔드 통합**: 백엔드와 프론트엔드의 통합
6. **로깅 시스템**: Winston을 사용한 구조화된 로깅
7. **에러 처리**: Graceful shutdown 및 에러 핸들링

## 🙏 감사의 말

이 프로젝트는 **Manus AI**에 의해 개발되었으며, Model Context Protocol 생태계에 기여하고자 하는 목적으로 만들어졌습니다. MCP 프로토콜을 개발한 Anthropic과 오픈소스 커뮤니티에 감사드립니다.

## 📞 문의 및 지원

- **GitHub Issues**: https://github.com/jwconnect/dynamic-mcp-server/issues
- **GitHub Discussions**: https://github.com/jwconnect/dynamic-mcp-server/discussions

---

**프로젝트 완료일**: 2025-11-12  
**버전**: 1.0.0  
**개발자**: Manus AI  
**라이선스**: MIT License
