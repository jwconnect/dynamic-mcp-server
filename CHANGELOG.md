# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-12

### Added
- **핸들러 자동 스캔**: `handlers/` 디렉토리의 모든 JavaScript 파일을 자동으로 스캔하여 export된 함수 감지
- **메타데이터 자동 추출**: JSDoc 주석에서 `@title`, `@description`, `@category` 자동 파싱
- **드래그 앤 드롭 UI**: 핸들러를 마우스로 드래그하여 서버 간 이동 가능
- **멀티 서버 관리**: 여러 MCP 서버를 동시에 생성/관리/삭제
- **핸들러 테스트 기능**: 웹 GUI에서 직접 핸들러 함수를 실행하고 결과 확인
- **자동 그룹화**: 파일별, 카테고리별로 핸들러를 자동 그룹화
- **사용 여부 토글**: 체크박스로 핸들러 활성화/비활성화
- **공학 계산기 핸들러**: sqrt, power, ln, log10, sin, cos, tan, factorial 함수 추가
- **서버 관리 API**: `/api/servers` 엔드포인트 추가
- **핸들러 관리 API**: `/api/handlers` 엔드포인트 추가
- **현대적 UI/UX**: 반응형 디자인, 모달, 토스트 알림 등

### Changed
- **프론트엔드 전면 개편**: 기존 단순 UI에서 고급 관리 대시보드로 업그레이드
- **CSS 스타일 개선**: 그라데이션, 애니메이션, 카드 레이아웃 적용
- **API 구조 개선**: 컨트롤러별로 파일 분리 및 RESTful 설계

### Fixed
- 핸들러 동적 로딩 시 캐싱 문제 해결 (타임스탬프 쿼리 파라미터 추가)

## [1.0.0] - 2025-11-12

### Added
- 초기 릴리스
- JSON 설정 파일 기반 동적 MCP 서버 시스템
- 핫 리로딩 기능 (Chokidar)
- HTTP Transport 지원
- 기본 관리 GUI (설정 편집, 로그 뷰어, 상태 모니터링)
- Winston 기반 로깅 시스템
- 계산기 핸들러 (add, multiply)
- 인사말 리소스 핸들러
- REST API (config, logs, status)
- Health Check 엔드포인트
- MIT 라이선스
- 상세한 README 및 문서

[2.0.0]: https://github.com/jwconnect/dynamic-mcp-server/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/jwconnect/dynamic-mcp-server/releases/tag/v1.0.0
