import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
import logger from './logger.js';
import MCPServerManager from './mcp/server-manager.js';
import { createApp } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 설정 파일 경로
const CONFIG_PATH = path.resolve(__dirname, '../config.json');

// MCP 서버 매니저 인스턴스
const serverManager = new MCPServerManager();

// Express 앱 생성
let app;
let server;

/**
 * 서버 초기화 및 시작
 */
async function startServer() {
  try {
    // 설정 파일 로드
    await serverManager.loadConfig(CONFIG_PATH);

    // Express 앱 생성
    app = createApp(serverManager);

    // 포트 설정
    const port = serverManager.getConfig()?.global?.port || 3000;
    const host = serverManager.getConfig()?.global?.host || '0.0.0.0';

    // 서버 시작
    server = app.listen(port, host, () => {
      logger.info(`🚀 Dynamic MCP Server started`, {
        port,
        host,
        url: `http://localhost:${port}`
      });
      logger.info(`📊 Admin UI: http://localhost:${port}`);
      logger.info(`🔌 MCP Endpoint: http://localhost:${port}/mcp`);
      logger.info(`💚 Health Check: http://localhost:${port}/health`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use`);
      } else {
        logger.error('Server error', { error: error.message });
      }
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

/**
 * 설정 파일 핫 리로딩 설정
 */
function setupHotReload() {
  const watcher = chokidar.watch(CONFIG_PATH, {
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('change', async (filePath) => {
    logger.info('Configuration file changed, reloading...', { filePath });
    try {
      await serverManager.loadConfig(CONFIG_PATH);
      logger.info('Configuration reloaded successfully');
    } catch (error) {
      logger.error('Failed to reload configuration', { error: error.message });
    }
  });

  logger.info('Hot reload enabled for config.json');
}

/**
 * Graceful shutdown 처리
 */
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`);

    if (server) {
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // 10초 후 강제 종료
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * 메인 실행 함수
 */
async function main() {
  logger.info('Starting Dynamic MCP Server...');

  // 서버 시작
  await startServer();

  // 핫 리로딩 설정
  setupHotReload();

  // Graceful shutdown 설정
  setupGracefulShutdown();
}

// 프로그램 시작
main().catch((error) => {
  logger.error('Fatal error', { error: error.message, stack: error.stack });
  process.exit(1);
});
