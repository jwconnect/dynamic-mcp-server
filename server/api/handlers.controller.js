import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 핸들러 디렉토리에서 모든 핸들러 파일 스캔
 * GET /api/handlers/scan
 */
export async function scanHandlers(req, res) {
  try {
    const handlersDir = path.resolve(__dirname, '../handlers');
    const files = await fs.readdir(handlersDir);
    
    const handlers = [];

    for (const file of files) {
      if (!file.endsWith('.js')) continue;

      const filePath = path.join(handlersDir, file);
      const relativePath = `handlers/${file}`;

      try {
        // 모듈 동적 import
        const module = await import(`file://${filePath}`);
        
        // 모듈에서 export된 함수들 추출
        const functions = Object.keys(module).filter(
          key => typeof module[key] === 'function'
        );

        for (const funcName of functions) {
          const func = module[funcName];
          
          // 함수의 주석에서 메타데이터 추출
          const metadata = extractMetadata(func);

          handlers.push({
            id: `${file.replace('.js', '')}_${funcName}`,
            file: file,
            path: relativePath,
            function: funcName,
            title: metadata.title || funcName,
            description: metadata.description || '설명 없음',
            category: metadata.category || file.replace('.js', ''),
            inputSchema: metadata.inputSchema || {},
            outputSchema: metadata.outputSchema || {},
            enabled: false // 기본값
          });
        }
      } catch (error) {
        logger.error(`Failed to scan handler: ${file}`, { error: error.message });
      }
    }

    res.json({
      success: true,
      data: {
        handlers,
        total: handlers.length
      }
    });
  } catch (error) {
    logger.error('Failed to scan handlers', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to scan handlers'
    });
  }
}

/**
 * 함수의 주석에서 메타데이터 추출
 * JSDoc 형식의 주석을 파싱
 */
function extractMetadata(func) {
  const funcString = func.toString();
  const metadata = {
    title: '',
    description: '',
    category: '',
    inputSchema: {},
    outputSchema: {}
  };

  // JSDoc 주석 추출 (간단한 파싱)
  const commentMatch = funcString.match(/\/\*\*([\s\S]*?)\*\//);
  if (commentMatch) {
    const comment = commentMatch[1];
    
    // @title 추출
    const titleMatch = comment.match(/@title\s+(.+)/);
    if (titleMatch) metadata.title = titleMatch[1].trim();
    
    // @description 추출
    const descMatch = comment.match(/@description\s+(.+)/);
    if (descMatch) metadata.description = descMatch[1].trim();
    
    // @category 추출
    const categoryMatch = comment.match(/@category\s+(.+)/);
    if (categoryMatch) metadata.category = categoryMatch[1].trim();
  }

  // 함수 시그니처에서 파라미터 추출
  const paramsMatch = funcString.match(/\(\s*{\s*([^}]+)\s*}\s*\)/);
  if (paramsMatch) {
    const params = paramsMatch[1].split(',').map(p => p.trim());
    params.forEach(param => {
      metadata.inputSchema[param] = {
        type: 'any',
        description: ''
      };
    });
  }

  return metadata;
}

/**
 * 특정 핸들러 함수 테스트 실행
 * POST /api/handlers/test
 */
export async function testHandler(req, res) {
  try {
    const { path: handlerPath, function: funcName, params } = req.body;

    if (!handlerPath || !funcName) {
      return res.status(400).json({
        success: false,
        error: 'Handler path and function name are required'
      });
    }

    // 핸들러 로드
    const fullPath = path.resolve(__dirname, '..', handlerPath);
    const module = await import(`file://${fullPath}?t=${Date.now()}`);
    const handlerFunc = module[funcName];

    if (typeof handlerFunc !== 'function') {
      return res.status(404).json({
        success: false,
        error: `Function '${funcName}' not found in ${handlerPath}`
      });
    }

    // 함수 실행
    const startTime = Date.now();
    const result = await handlerFunc(params || {});
    const executionTime = Date.now() - startTime;

    logger.info('Handler test executed', {
      path: handlerPath,
      function: funcName,
      executionTime
    });

    res.json({
      success: true,
      data: {
        result,
        executionTime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Handler test failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * 서버 간 핸들러 이동
 * POST /api/handlers/move
 */
export async function moveHandler(req, res) {
  try {
    const { handlerId, fromServer, toServer } = req.body;

    if (!handlerId || !fromServer || !toServer) {
      return res.status(400).json({
        success: false,
        error: 'Handler ID, source server, and target server are required'
      });
    }

    // config.json 읽기
    const configPath = path.resolve(__dirname, '../../config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    // 소스 서버에서 핸들러 찾기
    const sourceServer = config.servers.find(s => s.name === fromServer);
    if (!sourceServer) {
      return res.status(404).json({
        success: false,
        error: `Source server '${fromServer}' not found`
      });
    }

    const handlerIndex = sourceServer.tools.findIndex(t => 
      `${t.handler.path.replace('handlers/', '').replace('.js', '')}_${t.handler.function}` === handlerId
    );

    if (handlerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Handler not found in source server'
      });
    }

    // 핸들러 추출
    const handler = sourceServer.tools.splice(handlerIndex, 1)[0];

    // 타겟 서버에 추가
    let targetServer = config.servers.find(s => s.name === toServer);
    if (!targetServer) {
      // 타겟 서버가 없으면 생성
      targetServer = {
        name: toServer,
        version: '1.0.0',
        description: `${toServer} MCP 서버`,
        enabled: true,
        tools: [],
        resources: [],
        prompts: []
      };
      config.servers.push(targetServer);
    }

    targetServer.tools.push(handler);

    // 설정 저장
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    logger.info('Handler moved', { handlerId, fromServer, toServer });

    res.json({
      success: true,
      message: 'Handler moved successfully'
    });
  } catch (error) {
    logger.error('Failed to move handler', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to move handler'
    });
  }
}

/**
 * 핸들러 사용 여부 토글
 * POST /api/handlers/toggle
 */
export async function toggleHandler(req, res) {
  try {
    const { serverName, handlerId, enabled } = req.body;

    const configPath = path.resolve(__dirname, '../../config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const server = config.servers.find(s => s.name === serverName);
    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }

    const tool = server.tools.find(t => 
      `${t.handler.path.replace('handlers/', '').replace('.js', '')}_${t.handler.function}` === handlerId
    );

    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Handler not found'
      });
    }

    tool.enabled = enabled;

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    res.json({
      success: true,
      message: 'Handler toggled successfully'
    });
  } catch (error) {
    logger.error('Failed to toggle handler', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to toggle handler'
    });
  }
}
