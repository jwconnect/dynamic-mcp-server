/**
 * 계산기 핸들러 모듈
 * 기본적인 산술 연산 기능 제공
 */

/**
 * 두 숫자를 더합니다
 * @param {object} params - 입력 파라미터
 * @param {number} params.a - 첫 번째 숫자
 * @param {number} params.b - 두 번째 숫자
 * @returns {object} 덧셈 결과
 */
export async function add({ a, b }) {
  return {
    result: a + b
  };
}

/**
 * 두 숫자를 곱합니다
 * @param {object} params - 입력 파라미터
 * @param {number} params.a - 첫 번째 숫자
 * @param {number} params.b - 두 번째 숫자
 * @returns {object} 곱셈 결과
 */
export async function multiply({ a, b }) {
  return {
    result: a * b
  };
}

/**
 * 두 숫자를 뺍니다
 * @param {object} params - 입력 파라미터
 * @param {number} params.a - 첫 번째 숫자
 * @param {number} params.b - 두 번째 숫자
 * @returns {object} 뺄셈 결과
 */
export async function subtract({ a, b }) {
  return {
    result: a - b
  };
}

/**
 * 두 숫자를 나눕니다
 * @param {object} params - 입력 파라미터
 * @param {number} params.a - 첫 번째 숫자 (분자)
 * @param {number} params.b - 두 번째 숫자 (분모)
 * @returns {object} 나눗셈 결과
 */
export async function divide({ a, b }) {
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return {
    result: a / b
  };
}
