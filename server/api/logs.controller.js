import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 로그 파일 조회
 * GET /api/logs?type=combined&lines=100
 */
export async function getLogs(req, res) {
  try {
    const logType = req.query.type || 'combined'; // 'combined' or 'error'
    const lines = parseInt(req.query.lines) || 100;

    const logPath = path.resolve(__dirname, `../../logs/${logType}.log`);

    // 파일 존재 확인
    try {
      await fs.access(logPath);
    } catch {
      return res.json({
        success: true,
        data: {
          logs: [],
          message: 'Log file not found or empty'
        }
      });
    }

    const logContent = await fs.readFile(logPath, 'utf-8');
    const logLines = logContent.split('\n').filter((line) => line.trim());

    // 최근 N개 라인만 반환
    const recentLogs = logLines.slice(-lines);

    // JSON 파싱 시도
    const parsedLogs = recentLogs.map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { message: line };
      }
    });

    res.json({
      success: true,
      data: {
        logs: parsedLogs,
        total: parsedLogs.length
      }
    });
  } catch (error) {
    logger.error('Failed to read logs', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to read log file'
    });
  }
}

/**
 * 로그 파일 삭제
 * DELETE /api/logs?type=combined
 */
export async function clearLogs(req, res) {
  try {
    const logType = req.query.type || 'combined';
    const logPath = path.resolve(__dirname, `../../logs/${logType}.log`);

    await fs.writeFile(logPath, '');

    logger.info(`Log file cleared: ${logType}.log`);

    res.json({
      success: true,
      message: 'Log file cleared successfully'
    });
  } catch (error) {
    logger.error('Failed to clear logs', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to clear log file'
    });
  }
}
