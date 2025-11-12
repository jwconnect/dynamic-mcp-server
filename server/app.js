import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import logger from './logger.js';
import * as configController from './api/config.controller.js';
import * as logsController from './api/logs.controller.js';
import * as handlersController from './api/handlers.controller.js';
import * as serversController from './api/servers.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Express 애플리케이션 생성 및 설정
 * @param {MCPServerManager} serverManager - MCP 서버 매니저 인스턴스
 * @returns {Express} Express 앱 인스턴스
 */
export function createApp(serverManager) {
  const app = express();

  // 미들웨어 설정
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 서버 매니저를 앱에 저장
  app.set('serverManager', serverManager);

  // 정적 파일 서빙 (프론트엔드)
  app.use(express.static(path.join(__dirname, '../client/public')));

  // 관리 API 라우트
  app.get('/api/config', configController.getConfig);
  app.post('/api/config', configController.updateConfig);
  app.get('/api/status', configController.getStatus);
  app.get('/api/logs', logsController.getLogs);
  app.delete('/api/logs', logsController.clearLogs);

  // 핸들러 API 라우트
  app.get('/api/handlers/scan', handlersController.scanHandlers);
  app.post('/api/handlers/test', handlersController.testHandler);
  app.post('/api/handlers/move', handlersController.moveHandler);
  app.post('/api/handlers/toggle', handlersController.toggleHandler);

  // 서버 API 라우트
  app.get('/api/servers', serversController.getServers);
  app.get('/api/servers/:name', serversController.getServer);
  app.post('/api/servers', serversController.createServer);
  app.put('/api/servers/:name', serversController.updateServer);
  app.delete('/api/servers/:name', serversController.deleteServer);
  app.post('/api/servers/:name/toggle', serversController.toggleServer);

  // MCP 프로토콜 엔드포인트
  app.post('/mcp', async (req, res) => {
    try {
      // 기본 서버 사용 (첫 번째 활성화된 서버)
      const serverNames = serverManager.getAllServerNames();
      if (serverNames.length === 0) {
        return res.status(503).json({
          error: 'No MCP servers available'
        });
      }

      const serverName = serverNames[0];
      const mcpServer = serverManager.getServer(serverName);

      if (!mcpServer) {
        return res.status(404).json({
          error: `MCP server '${serverName}' not found`
        });
      }

      // StreamableHTTPServerTransport 생성
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
      });

      // 응답 종료 시 transport 정리
      res.on('close', () => {
        transport.close();
      });

      // MCP 서버와 transport 연결
      await mcpServer.connect(transport);

      // 요청 처리
      await transport.handleRequest(req, res, req.body);

      logger.info('MCP request handled', {
        server: serverName,
        method: req.body?.method
      });
    } catch (error) {
      logger.error('MCP request error', { error: error.message });
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal server error'
        });
      }
    }
  });

  // 특정 서버 지정 엔드포인트 (선택적)
  app.post('/mcp/:serverName', async (req, res) => {
    try {
      const { serverName } = req.params;
      const mcpServer = serverManager.getServer(serverName);

      if (!mcpServer) {
        return res.status(404).json({
          error: `MCP server '${serverName}' not found`
        });
      }

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
      });

      res.on('close', () => {
        transport.close();
      });

      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);

      logger.info('MCP request handled', {
        server: serverName,
        method: req.body?.method
      });
    } catch (error) {
      logger.error('MCP request error', { error: error.message });
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal server error'
        });
      }
    }
  });

  // 헬스 체크 엔드포인트
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // 404 핸들러
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not found'
    });
  });

  // 에러 핸들러
  app.use((err, req, res, next) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({
      error: 'Internal server error'
    });
  });

  return app;
}
