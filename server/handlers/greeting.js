/**
 * 인사말 리소스 핸들러 모듈
 * 동적으로 인사말을 생성합니다
 */

/**
 * 이름을 받아 인사말을 생성합니다
 * @param {URL} uri - 리소스 URI
 * @param {object} params - URI 파라미터
 * @param {string} params.name - 인사할 이름
 * @returns {string} 인사말 텍스트
 */
export async function getGreeting(uri, { name }) {
  const greetings = [
    `안녕하세요, ${name}님! 오늘도 좋은 하루 되세요! 😊`,
    `Hello, ${name}! Welcome to the dynamic MCP server!`,
    `${name}님, 반갑습니다! 무엇을 도와드릴까요?`,
    `Greetings, ${name}! How can I assist you today?`
  ];

  // 랜덤 인사말 선택
  const randomGreeting =
    greetings[Math.floor(Math.random() * greetings.length)];

  return randomGreeting;
}
