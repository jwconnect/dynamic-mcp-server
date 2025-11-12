// API 기본 URL
const API_BASE = '';

// 전역 상태
const state = {
  servers: [],
  handlers: [],
  currentServer: null,
  currentHandler: null,
  groupBy: 'file'
};

// DOM 요소
const elements = {
  // 상태
  serverStatus: document.getElementById('server-status'),
  serverUptime: document.getElementById('server-uptime'),
  activeServers: document.getElementById('active-servers'),
  totalHandlers: document.getElementById('total-handlers'),
  refreshStatusBtn: document.getElementById('refresh-status-btn'),

  // 탭
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),

  // 서버 관리
  serversContainer: document.getElementById('servers-container'),
  createServerBtn: document.getElementById('create-server-btn'),

  // 핸들러 관리
  scanHandlersBtn: document.getElementById('scan-handlers-btn'),
  handlersList: document.getElementById('handlers-list'),
  serversDropzones: document.getElementById('servers-dropzones'),
  groupBySelect: document.getElementById('group-by-select'),

  // 설정
  configEditor: document.getElementById('config-editor'),
  loadConfigBtn: document.getElementById('load-config-btn'),
  saveConfigBtn: document.getElementById('save-config-btn'),

  // 로그
  logsContainer: document.getElementById('logs-container'),
  logTypeSelect: document.getElementById('log-type-select'),
  refreshLogsBtn: document.getElementById('refresh-logs-btn'),
  clearLogsBtn: document.getElementById('clear-logs-btn'),

  // 모달
  serverModal: document.getElementById('server-modal'),
  serverModalTitle: document.getElementById('server-modal-title'),
  serverName: document.getElementById('server-name'),
  serverVersion: document.getElementById('server-version'),
  serverDescription: document.getElementById('server-description'),
  serverModalSave: document.getElementById('server-modal-save'),
  serverModalCancel: document.getElementById('server-modal-cancel'),

  testModal: document.getElementById('test-modal'),
  testModalTitle: document.getElementById('test-modal-title'),
  testParams: document.getElementById('test-params'),
  testResult: document.getElementById('test-result'),
  testModalRun: document.getElementById('test-modal-run'),
  testModalClose: document.getElementById('test-modal-close'),

  // 토스트
  toast: document.getElementById('toast')
};

// 유틸리티 함수
function showToast(message, type = 'info') {
  elements.toast.textContent = message;
  elements.toast.className = `toast ${type} show`;

  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}시간 ${minutes}분 ${secs}초`;
}

function showModal(modal) {
  modal.classList.add('show');
}

function hideModal(modal) {
  modal.classList.remove('show');
}

// API 호출 함수
async function fetchStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/status`);
    const data = await response.json();

    if (data.success) {
      elements.serverStatus.textContent = '🟢 실행 중';
      elements.serverUptime.textContent = formatUptime(data.data.uptime);
      elements.activeServers.textContent = data.data.enabledServers;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    elements.serverStatus.textContent = '🔴 오류';
    showToast('서버 상태를 가져올 수 없습니다: ' + error.message, 'error');
  }
}

async function loadServers() {
  try {
    const response = await fetch(`${API_BASE}/api/servers`);
    const data = await response.json();

    if (data.success) {
      state.servers = data.data.servers;
      renderServers();
      renderServerDropzones();
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    showToast('서버 목록을 불러올 수 없습니다: ' + error.message, 'error');
  }
}

async function scanHandlers() {
  try {
    const response = await fetch(`${API_BASE}/api/handlers/scan`);
    const data = await response.json();

    if (data.success) {
      state.handlers = data.data.handlers;
      elements.totalHandlers.textContent = data.data.total;
      renderHandlers();
      showToast(`${data.data.total}개의 핸들러를 찾았습니다`, 'success');
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    showToast('핸들러 스캔 실패: ' + error.message, 'error');
  }
}

async function testHandler(handlerPath, funcName, params) {
  try {
    const response = await fetch(`${API_BASE}/api/handlers/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: handlerPath,
        function: funcName,
        params
      })
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        result: data.data.result,
        executionTime: data.data.executionTime
      };
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function createServer(name, version, description) {
  try {
    const response = await fetch(`${API_BASE}/api/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, version, description })
    });

    const data = await response.json();

    if (data.success) {
      showToast('서버가 생성되었습니다', 'success');
      loadServers();
      return true;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    showToast('서버 생성 실패: ' + error.message, 'error');
    return false;
  }
}

async function deleteServer(name) {
  if (!confirm(`정말로 "${name}" 서버를 삭제하시겠습니까?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/servers/${name}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showToast('서버가 삭제되었습니다', 'success');
      loadServers();
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    showToast('서버 삭제 실패: ' + error.message, 'error');
  }
}

async function toggleServer(name, enabled) {
  try {
    const response = await fetch(`${API_BASE}/api/servers/${name}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled })
    });

    const data = await response.json();

    if (data.success) {
      showToast(`서버가 ${enabled ? '활성화' : '비활성화'}되었습니다`, 'success');
      setTimeout(fetchStatus, 1000);
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    showToast('서버 토글 실패: ' + error.message, 'error');
  }
}

async function loadConfig() {
  try {
    const response = await fetch(`${API_BASE}/api/config`);
    const data = await response.json();

    if (data.success) {
      elements.configEditor.value = JSON.stringify(data.data, null, 2);
      showToast('설정 파일을 불러왔습니다', 'success');
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    showToast('설정 파일을 불러올 수 없습니다: ' + error.message, 'error');
  }
}

async function saveConfig() {
  try {
    const configText = elements.configEditor.value;
    const config = JSON.parse(configText);

    const response = await fetch(`${API_BASE}/api/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    const data = await response.json();

    if (data.success) {
      showToast('설정이 저장되었습니다. 서버가 재로딩됩니다.', 'success');
      setTimeout(() => {
        fetchStatus();
        loadServers();
      }, 2000);
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      showToast('JSON 형식이 올바르지 않습니다', 'error');
    } else {
      showToast('설정을 저장할 수 없습니다: ' + error.message, 'error');
    }
  }
}

async function loadLogs() {
  try {
    const logType = elements.logTypeSelect.value;
    const response = await fetch(`${API_BASE}/api/logs?type=${logType}&lines=100`);
    const data = await response.json();

    if (data.success) {
      if (data.data.logs.length === 0) {
        elements.logsContainer.innerHTML = '<p class="placeholder">로그가 없습니다</p>';
      } else {
        elements.logsContainer.innerHTML = data.data.logs
          .map((log) => {
            const level = log.level || 'info';
            const timestamp = log.timestamp || '';
            const message = log.message || JSON.stringify(log);

            return `
              <div class="log-entry ${level}">
                <span class="log-timestamp">${timestamp}</span>
                <span class="log-level">[${level}]</span>
                <span class="log-message">${message}</span>
              </div>
            `;
          })
          .join('');

        elements.logsContainer.scrollTop = elements.logsContainer.scrollHeight;
      }
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    showToast('로그를 불러올 수 없습니다: ' + error.message, 'error');
  }
}

async function clearLogs() {
  if (!confirm('정말로 로그를 삭제하시겠습니까?')) {
    return;
  }

  try {
    const logType = elements.logTypeSelect.value;
    const response = await fetch(`${API_BASE}/api/logs?type=${logType}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showToast('로그가 삭제되었습니다', 'success');
      loadLogs();
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    showToast('로그를 삭제할 수 없습니다: ' + error.message, 'error');
  }
}

// 렌더링 함수
function renderServers() {
  if (state.servers.length === 0) {
    elements.serversContainer.innerHTML = '<p class="placeholder">서버가 없습니다. "새 서버 생성" 버튼을 클릭하세요.</p>';
    return;
  }

  elements.serversContainer.innerHTML = state.servers
    .map(
      (server) => `
    <div class="server-card">
      <div class="server-card-header">
        <div class="server-card-title">${server.name}</div>
        <label class="server-card-toggle">
          <input type="checkbox" ${server.enabled ? 'checked' : ''} 
                 onchange="toggleServer('${server.name}', this.checked)">
          <span class="slider"></span>
        </label>
      </div>
      <div class="server-card-description">${server.description}</div>
      <div class="server-card-stats">
        <div class="server-card-stat">
          <span>🔧</span>
          <span>${server.toolsCount} Tools</span>
        </div>
        <div class="server-card-stat">
          <span>📦</span>
          <span>${server.resourcesCount} Resources</span>
        </div>
        <div class="server-card-stat">
          <span>💬</span>
          <span>${server.promptsCount} Prompts</span>
        </div>
      </div>
      <div class="server-card-actions">
        <button class="btn btn-danger btn-small" onclick="deleteServer('${server.name}')">
          🗑️ 삭제
        </button>
      </div>
    </div>
  `
    )
    .join('');
}

function renderHandlers() {
  const groupBy = state.groupBy;
  let grouped = {};

  if (groupBy === 'none') {
    grouped['모든 핸들러'] = state.handlers;
  } else if (groupBy === 'file') {
    state.handlers.forEach((handler) => {
      const key = handler.file;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(handler);
    });
  } else if (groupBy === 'category') {
    state.handlers.forEach((handler) => {
      const key = handler.category || '기타';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(handler);
    });
  }

  let html = '';
  for (const [group, handlers] of Object.entries(grouped)) {
    html += `<div style="grid-column: 1/-1; font-weight: 600; color: var(--primary-color); margin-top: 12px;">${group}</div>`;
    handlers.forEach((handler) => {
      html += `
        <div class="handler-item" draggable="true" data-handler-id="${handler.id}">
          <div class="handler-item-header">
            <div class="handler-item-title">${handler.title}</div>
            <div class="handler-item-badge">${handler.category}</div>
          </div>
          <div class="handler-item-description">${handler.description}</div>
          <div class="handler-item-meta">📁 ${handler.path} → ${handler.function}</div>
          <div class="handler-item-actions">
            <button class="btn btn-primary btn-small" onclick="openTestModal('${handler.id}')">
              ▶ 테스트
            </button>
          </div>
        </div>
      `;
    });
  }

  elements.handlersList.innerHTML = html || '<p class="placeholder">핸들러가 없습니다</p>';

  // 드래그 이벤트 추가
  document.querySelectorAll('.handler-item').forEach((item) => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
  });
}

function renderServerDropzones() {
  if (state.servers.length === 0) {
    elements.serversDropzones.innerHTML = '<p class="placeholder">서버가 없습니다</p>';
    return;
  }

  elements.serversDropzones.innerHTML = state.servers
    .map(
      (server) => `
    <div class="server-dropzone" data-server-name="${server.name}">
      <div class="server-dropzone-header">
        <div class="server-dropzone-title">${server.name}</div>
        <div class="server-dropzone-count">${server.toolsCount} 핸들러</div>
      </div>
      <div class="server-dropzone-handlers" id="dropzone-${server.name}">
        <p class="placeholder" style="padding: 20px;">핸들러를 여기로 드래그하세요</p>
      </div>
    </div>
  `
    )
    .join('');

  // 드롭존 이벤트 추가
  document.querySelectorAll('.server-dropzone').forEach((zone) => {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('drop', handleDrop);
    zone.addEventListener('dragleave', handleDragLeave);
  });
}

// 드래그 앤 드롭 핸들러
let draggedHandlerId = null;

function handleDragStart(e) {
  draggedHandlerId = e.target.dataset.handlerId;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

async function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  const targetServerName = e.currentTarget.dataset.serverName;
  if (!draggedHandlerId || !targetServerName) return;

  // TODO: 핸들러를 서버에 할당하는 API 호출
  showToast(`핸들러를 ${targetServerName}에 할당했습니다`, 'success');
  
  // 여기서는 config.json을 직접 수정하는 대신 API를 통해 처리해야 함
  console.log('Assign handler', draggedHandlerId, 'to', targetServerName);
}

// 모달 핸들러
function openCreateServerModal() {
  elements.serverModalTitle.textContent = '새 서버 생성';
  elements.serverName.value = '';
  elements.serverVersion.value = '1.0.0';
  elements.serverDescription.value = '';
  state.currentServer = null;
  showModal(elements.serverModal);
}

function openTestModal(handlerId) {
  const handler = state.handlers.find((h) => h.id === handlerId);
  if (!handler) return;

  state.currentHandler = handler;
  elements.testModalTitle.textContent = `테스트: ${handler.title}`;
  elements.testParams.value = JSON.stringify(handler.inputSchema, null, 2);
  elements.testResult.textContent = '테스트를 실행하려면 "실행" 버튼을 클릭하세요';
  showModal(elements.testModal);
}

async function runTest() {
  if (!state.currentHandler) return;

  try {
    const params = JSON.parse(elements.testParams.value);
    elements.testResult.textContent = '실행 중...';

    const result = await testHandler(
      state.currentHandler.path,
      state.currentHandler.function,
      params
    );

    if (result.success) {
      elements.testResult.textContent = JSON.stringify(
        {
          success: true,
          result: result.result,
          executionTime: `${result.executionTime}ms`
        },
        null,
        2
      );
    } else {
      elements.testResult.textContent = JSON.stringify(
        {
          success: false,
          error: result.error
        },
        null,
        2
      );
    }
  } catch (error) {
    elements.testResult.textContent = `JSON 파싱 오류: ${error.message}`;
  }
}

// 이벤트 리스너
elements.refreshStatusBtn.addEventListener('click', fetchStatus);
elements.createServerBtn.addEventListener('click', openCreateServerModal);
elements.scanHandlersBtn.addEventListener('click', scanHandlers);
elements.groupBySelect.addEventListener('change', (e) => {
  state.groupBy = e.target.value;
  renderHandlers();
});

elements.loadConfigBtn.addEventListener('click', loadConfig);
elements.saveConfigBtn.addEventListener('click', saveConfig);
elements.refreshLogsBtn.addEventListener('click', loadLogs);
elements.clearLogsBtn.addEventListener('click', clearLogs);
elements.logTypeSelect.addEventListener('change', loadLogs);

elements.serverModalSave.addEventListener('click', async () => {
  const name = elements.serverName.value.trim();
  const version = elements.serverVersion.value.trim();
  const description = elements.serverDescription.value.trim();

  if (!name) {
    showToast('서버 이름을 입력하세요', 'warning');
    return;
  }

  const success = await createServer(name, version, description);
  if (success) {
    hideModal(elements.serverModal);
  }
});

elements.serverModalCancel.addEventListener('click', () => {
  hideModal(elements.serverModal);
});

elements.testModalRun.addEventListener('click', runTest);
elements.testModalClose.addEventListener('click', () => {
  hideModal(elements.testModal);
});

// 모달 닫기 버튼
document.querySelectorAll('.modal-close').forEach((btn) => {
  btn.addEventListener('click', () => {
    hideModal(elements.serverModal);
    hideModal(elements.testModal);
  });
});

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (e) => {
  if (e.target === elements.serverModal) {
    hideModal(elements.serverModal);
  }
  if (e.target === elements.testModal) {
    hideModal(elements.testModal);
  }
});

// 탭 전환
elements.tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;

    elements.tabBtns.forEach((b) => b.classList.remove('active'));
    elements.tabContents.forEach((c) => c.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');

    if (tabName === 'logs') {
      loadLogs();
    } else if (tabName === 'servers') {
      loadServers();
    } else if (tabName === 'handlers') {
      loadServers();
    }
  });
});

// 초기 로드
window.addEventListener('DOMContentLoaded', () => {
  fetchStatus();
  loadServers();
  loadConfig();

  // 30초마다 상태 자동 갱신
  setInterval(fetchStatus, 30000);
});

// 전역 함수 (HTML onclick에서 사용)
window.toggleServer = toggleServer;
window.deleteServer = deleteServer;
window.openTestModal = openTestModal;
