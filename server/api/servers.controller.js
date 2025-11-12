import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 모든 MCP 서버 목록 조회
 * GET /api/servers
 */
export async function getServers(req, res) {
  try {
    const configPath = path.resolve(__dirname, '../../config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const servers = config.servers.map(server => ({
      name: server.name,
      version: server.version,
      description: server.description,
      enabled: server.enabled,
      toolsCount: server.tools?.length || 0,
      resourcesCount: server.resources?.length || 0,
      promptsCount: server.prompts?.length || 0
    }));

    res.json({
      success: true,
      data: {
        servers,
        total: servers.length
      }
    });
  } catch (error) {
    logger.error('Failed to get servers', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get servers'
    });
  }
}

/**
 * 특정 MCP 서버 상세 조회
 * GET /api/servers/:name
 */
export async function getServer(req, res) {
  try {
    const { name } = req.params;
    const configPath = path.resolve(__dirname, '../../config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const server = config.servers.find(s => s.name === name);
    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }

    res.json({
      success: true,
      data: server
    });
  } catch (error) {
    logger.error('Failed to get server', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get server'
    });
  }
}

/**
 * 새로운 MCP 서버 생성
 * POST /api/servers
 */
export async function createServer(req, res) {
  try {
    const { name, version, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Server name is required'
      });
    }

    const configPath = path.resolve(__dirname, '../../config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    // 중복 확인
    if (config.servers.find(s => s.name === name)) {
      return res.status(409).json({
        success: false,
        error: 'Server with this name already exists'
      });
    }

    // 새 서버 추가
    const newServer = {
      name,
      version: version || '1.0.0',
      description: description || `${name} MCP 서버`,
      enabled: true,
      tools: [],
      resources: [],
      prompts: []
    };

    config.servers.push(newServer);

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    logger.info('Server created', { name });

    res.json({
      success: true,
      data: newServer
    });
  } catch (error) {
    logger.error('Failed to create server', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to create server'
    });
  }
}

/**
 * MCP 서버 업데이트
 * PUT /api/servers/:name
 */
export async function updateServer(req, res) {
  try {
    const { name } = req.params;
    const updates = req.body;

    const configPath = path.resolve(__dirname, '../../config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const serverIndex = config.servers.findIndex(s => s.name === name);
    if (serverIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }

    // 서버 정보 업데이트
    config.servers[serverIndex] = {
      ...config.servers[serverIndex],
      ...updates,
      name // 이름은 변경 불가
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    logger.info('Server updated', { name });

    res.json({
      success: true,
      data: config.servers[serverIndex]
    });
  } catch (error) {
    logger.error('Failed to update server', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to update server'
    });
  }
}

/**
 * MCP 서버 삭제
 * DELETE /api/servers/:name
 */
export async function deleteServer(req, res) {
  try {
    const { name } = req.params;

    const configPath = path.resolve(__dirname, '../../config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const serverIndex = config.servers.findIndex(s => s.name === name);
    if (serverIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }

    config.servers.splice(serverIndex, 1);

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    logger.info('Server deleted', { name });

    res.json({
      success: true,
      message: 'Server deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete server', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to delete server'
    });
  }
}

/**
 * 서버 활성화/비활성화 토글
 * POST /api/servers/:name/toggle
 */
export async function toggleServer(req, res) {
  try {
    const { name } = req.params;
    const { enabled } = req.body;

    const configPath = path.resolve(__dirname, '../../config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const server = config.servers.find(s => s.name === name);
    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }

    server.enabled = enabled;

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    logger.info('Server toggled', { name, enabled });

    res.json({
      success: true,
      message: 'Server toggled successfully'
    });
  } catch (error) {
    logger.error('Failed to toggle server', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to toggle server'
    });
  }
}
