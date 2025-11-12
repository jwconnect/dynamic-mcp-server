import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 설정 파일 조회
 * GET /api/config
 */
export async function getConfig(req, res) {
  try {
    const configPath = path.resolve(__dirname, '../../config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Failed to read config', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to read configuration file'
    });
  }
}

/**
 * 설정 파일 업데이트
 * POST /api/config
 */
export async function updateConfig(req, res) {
  try {
    const newConfig = req.body;

    // 기본 유효성 검사
    if (!newConfig.global || !newConfig.servers) {
      return res.status(400).json({
        success: false,
        error: 'Invalid configuration format'
      });
    }

    const configPath = path.resolve(__dirname, '../../config.json');

    // 백업 생성
    const backupPath = path.resolve(
      __dirname,
      `../../config.backup.${Date.now()}.json`
    );
    const currentConfig = await fs.readFile(configPath, 'utf-8');
    await fs.writeFile(backupPath, currentConfig);

    // 새 설정 저장
    await fs.writeFile(
      configPath,
      JSON.stringify(newConfig, null, 2),
      'utf-8'
    );

    logger.info('Configuration updated successfully', { backupPath });

    res.json({
      success: true,
      message: 'Configuration updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update config', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration file'
    });
  }
}

/**
 * 서버 상태 조회
 * GET /api/status
 */
export async function getStatus(req, res) {
  try {
    const serverManager = req.app.get('serverManager');
    const config = serverManager.getConfig();
    const serverNames = serverManager.getAllServerNames();

    res.json({
      success: true,
      data: {
        status: 'running',
        uptime: process.uptime(),
        servers: serverNames,
        totalServers: serverNames.length,
        enabledServers: config?.servers?.filter((s) => s.enabled).length || 0
      }
    });
  } catch (error) {
    logger.error('Failed to get status', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get server status'
    });
  }
}
