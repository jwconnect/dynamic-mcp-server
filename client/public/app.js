// API 기본 URL
const API_BASE = '';

// DOM 요소
const elements = {
  // 상태
  serverStatus: document.getElementById('server-status'),
  serverUptime: document.getElementById('server-uptime'),
  activeServers: document.getElementById('active-servers'),
  totalServers: document.getElementById('total-servers'),
  refreshStatusBtn: document.getElementById('refresh-status-btn'),

  // 탭
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),

  // 설정
  configEditor: document.getElementById('config-editor'),
  loadConfigBtn: document.getElementById('load-config-btn'),
  saveConfigBtn: document.getElementById('save-config-btn'),

  // 로그
  logsContainer: document.getElementById('logs-container'),
  logTypeSelect: document.getElementById('log-type-select'),
  refreshLogsBtn: document.getElementById('refresh-logs-btn'),
  clearLogsBtn: document.getElementById('clear-logs-btn'),

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

// API 호출 함수
async function fetchStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/status`);
    const data = await response.json();

    if (data.success) {
      elements.serverStatus.textContent = '🟢 실행 중';
      elements.serverUptime.textContent = formatUptime(data.data.uptime);
      elements.activeServers.textContent = data.data.enabledServers;
      elements.totalServers.textContent = data.data.totalServers;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    elements.serverStatus.textContent = '🔴 오류';
    showToast('서버 상태를 가져올 수 없습니다: ' + error.message, 'error');
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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    const data = await response.json();

    if (data.success) {
      showToast('설정이 저장되었습니다. 서버가 재로딩됩니다.', 'success');
      setTimeout(() => {
        fetchStatus();
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
        elements.logsContainer.innerHTML =
          '<p class="placeholder">로그가 없습니다</p>';
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

        // 스크롤을 맨 아래로
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

// 이벤트 리스너
elements.refreshStatusBtn.addEventListener('click', fetchStatus);
elements.loadConfigBtn.addEventListener('click', loadConfig);
elements.saveConfigBtn.addEventListener('click', saveConfig);
elements.refreshLogsBtn.addEventListener('click', loadLogs);
elements.clearLogsBtn.addEventListener('click', clearLogs);
elements.logTypeSelect.addEventListener('change', loadLogs);

// 탭 전환
elements.tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;

    // 모든 탭 비활성화
    elements.tabBtns.forEach((b) => b.classList.remove('active'));
    elements.tabContents.forEach((c) => c.classList.remove('active'));

    // 선택한 탭 활성화
    btn.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // 로그 탭이 활성화되면 로그 로드
    if (tabName === 'logs') {
      loadLogs();
    }
  });
});

// 초기 로드
window.addEventListener('DOMContentLoaded', () => {
  fetchStatus();
  loadConfig();

  // 30초마다 상태 자동 갱신
  setInterval(fetchStatus, 30000);
});
