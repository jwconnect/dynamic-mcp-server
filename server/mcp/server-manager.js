import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MCP 서버 인스턴스를 동적으로 관리하는 클래스
 */
class MCPServerManager {
  constructor() {
    this.servers = new Map(); // serverName -> McpServer 인스턴스
    this.config = null;
  }

  /**
   * 설정 파일을 로드하고 모든 MCP 서버를 초기화
   * @param {string} configPath - config.json 파일 경로
   */
  async loadConfig(configPath) {
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      this.config = JSON.parse(configContent);
      logger.info('Configuration loaded successfully', { configPath });

      // 기존 서버 모두 제거
      this.servers.clear();

      // 새로운 서버 인스턴스 생성
      for (const serverConfig of this.config.servers) {
        if (serverConfig.enabled) {
          await this.createServer(serverConfig);
        }
      }

      logger.info(`Initialized ${this.servers.size} MCP server(s)`);
    } catch (error) {
      logger.error('Failed to load configuration', { error: error.message });
      throw error;
    }
  }

  /**
   * 개별 MCP 서버 인스턴스 생성 및 등록
   * @param {object} serverConfig - 서버 설정 객체
   */
  async createServer(serverConfig) {
    try {
      const server = new McpServer({
        name: serverConfig.name,
        version: serverConfig.version || '1.0.0'
      });

      // Tools 등록
      if (serverConfig.tools && serverConfig.tools.length > 0) {
        for (const tool of serverConfig.tools) {
          await this.registerTool(server, tool);
        }
      }

      // Resources 등록
      if (serverConfig.resources && serverConfig.resources.length > 0) {
        for (const resource of serverConfig.resources) {
          await this.registerResource(server, resource);
        }
      }

      // Prompts 등록
      if (serverConfig.prompts && serverConfig.prompts.length > 0) {
        for (const prompt of serverConfig.prompts) {
          await this.registerPrompt(server, prompt);
        }
      }

      this.servers.set(serverConfig.name, server);
      logger.info(`MCP server created: ${serverConfig.name}`, {
        tools: serverConfig.tools?.length || 0,
        resources: serverConfig.resources?.length || 0,
        prompts: serverConfig.prompts?.length || 0
      });
    } catch (error) {
      logger.error(`Failed to create server: ${serverConfig.name}`, {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Tool을 MCP 서버에 동적으로 등록
   * @param {McpServer} server - MCP 서버 인스턴스
   * @param {object} toolConfig - Tool 설정 객체
   */
  async registerTool(server, toolConfig) {
    try {
      // 핸들러 함수 동적 로드
      const handlerPath = path.resolve(
        __dirname,
        '..',
        toolConfig.handler.path
      );
      const handlerModule = await import(`file://${handlerPath}`);
      const handlerFunction = handlerModule[toolConfig.handler.function];

      if (typeof handlerFunction !== 'function') {
        throw new Error(
          `Handler function '${toolConfig.handler.function}' not found in ${toolConfig.handler.path}`
        );
      }

      // Zod 스키마 생성
      const inputSchema = this.createZodSchema(toolConfig.inputSchema);
      const outputSchema = toolConfig.outputSchema
        ? this.createZodSchema(toolConfig.outputSchema)
        : undefined;

      // Tool 등록
      server.registerTool(
        toolConfig.name,
        {
          title: toolConfig.title,
          description: toolConfig.description,
          inputSchema,
          outputSchema
        },
        async (params) => {
          try {
            const result = await handlerFunction(params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result)
                }
              ],
              structuredContent: result
            };
          } catch (error) {
            logger.error(`Tool execution error: ${toolConfig.name}`, {
              error: error.message,
              params
            });
            throw error;
          }
        }
      );

      logger.info(`Tool registered: ${toolConfig.name}`);
    } catch (error) {
      logger.error(`Failed to register tool: ${toolConfig.name}`, {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Resource를 MCP 서버에 동적으로 등록
   * @param {McpServer} server - MCP 서버 인스턴스
   * @param {object} resourceConfig - Resource 설정 객체
   */
  async registerResource(server, resourceConfig) {
    try {
      // 핸들러 함수 동적 로드
      const handlerPath = path.resolve(
        __dirname,
        '..',
        resourceConfig.handler.path
      );
      const handlerModule = await import(`file://${handlerPath}`);
      const handlerFunction = handlerModule[resourceConfig.handler.function];

      if (typeof handlerFunction !== 'function') {
        throw new Error(
          `Handler function '${resourceConfig.handler.function}' not found in ${resourceConfig.handler.path}`
        );
      }

      // ResourceTemplate 생성
      const template = new ResourceTemplate(resourceConfig.uri, {
        list: undefined
      });

      // Resource 등록
      server.registerResource(
        resourceConfig.name,
        template,
        {
          title: resourceConfig.title,
          description: resourceConfig.description
        },
        async (uri, params) => {
          try {
            const result = await handlerFunction(uri, params);
            return {
              contents: [
                {
                  uri: uri.href,
                  text: result
                }
              ]
            };
          } catch (error) {
            logger.error(`Resource execution error: ${resourceConfig.name}`, {
              error: error.message,
              uri: uri.href,
              params
            });
            throw error;
          }
        }
      );

      logger.info(`Resource registered: ${resourceConfig.name}`);
    } catch (error) {
      logger.error(`Failed to register resource: ${resourceConfig.name}`, {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Prompt를 MCP 서버에 동적으로 등록
   * @param {McpServer} server - MCP 서버 인스턴스
   * @param {object} promptConfig - Prompt 설정 객체
   */
  async registerPrompt(server, promptConfig) {
    try {
      // Prompt 등록 로직 (필요시 구현)
      logger.info(`Prompt registered: ${promptConfig.name}`);
    } catch (error) {
      logger.error(`Failed to register prompt: ${promptConfig.name}`, {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * JSON 스키마를 Zod 스키마로 변환
   * @param {object} jsonSchema - JSON 스키마 객체
   * @returns {object} Zod 스키마 객체
   */
  createZodSchema(jsonSchema) {
    const schema = {};
    for (const [key, value] of Object.entries(jsonSchema)) {
      switch (value.type) {
        case 'string':
          schema[key] = z.string().describe(value.description || '');
          break;
        case 'number':
          schema[key] = z.number().describe(value.description || '');
          break;
        case 'boolean':
          schema[key] = z.boolean().describe(value.description || '');
          break;
        case 'array':
          schema[key] = z.array(z.any()).describe(value.description || '');
          break;
        case 'object':
          schema[key] = z.object({}).describe(value.description || '');
          break;
        default:
          schema[key] = z.any().describe(value.description || '');
      }
    }
    return schema;
  }

  /**
   * 서버 이름으로 MCP 서버 인스턴스 가져오기
   * @param {string} serverName - 서버 이름
   * @returns {McpServer|null} MCP 서버 인스턴스
   */
  getServer(serverName) {
    return this.servers.get(serverName) || null;
  }

  /**
   * 모든 서버 목록 가져오기
   * @returns {Array} 서버 이름 배열
   */
  getAllServerNames() {
    return Array.from(this.servers.keys());
  }

  /**
   * 현재 설정 가져오기
   * @returns {object} 설정 객체
   */
  getConfig() {
    return this.config;
  }
}

export default MCPServerManager;
