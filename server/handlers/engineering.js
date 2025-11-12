/**
 * 공학 계산기 핸들러 모듈
 * 고급 수학 및 공학 계산 기능 제공
 * @category engineering
 */

/**
 * 제곱근 계산
 * @title 제곱근
 * @description 숫자의 제곱근을 계산합니다
 * @category engineering
 * @param {object} params - 입력 파라미터
 * @param {number} params.value - 제곱근을 구할 숫자
 * @returns {object} 제곱근 결과
 */
export async function sqrt({ value }) {
  if (value < 0) {
    throw new Error('Cannot calculate square root of negative number');
  }
  return {
    result: Math.sqrt(value)
  };
}

/**
 * 거듭제곱 계산
 * @title 거듭제곱
 * @description 밑수를 지수만큼 거듭제곱합니다
 * @category engineering
 * @param {object} params - 입력 파라미터
 * @param {number} params.base - 밑수
 * @param {number} params.exponent - 지수
 * @returns {object} 거듭제곱 결과
 */
export async function power({ base, exponent }) {
  return {
    result: Math.pow(base, exponent)
  };
}

/**
 * 로그 계산 (자연로그)
 * @title 자연로그
 * @description 숫자의 자연로그를 계산합니다
 * @category engineering
 * @param {object} params - 입력 파라미터
 * @param {number} params.value - 로그를 구할 숫자
 * @returns {object} 로그 결과
 */
export async function ln({ value }) {
  if (value <= 0) {
    throw new Error('Logarithm undefined for non-positive numbers');
  }
  return {
    result: Math.log(value)
  };
}

/**
 * 상용로그 계산 (밑이 10인 로그)
 * @title 상용로그
 * @description 숫자의 상용로그를 계산합니다
 * @category engineering
 * @param {object} params - 입력 파라미터
 * @param {number} params.value - 로그를 구할 숫자
 * @returns {object} 로그 결과
 */
export async function log10({ value }) {
  if (value <= 0) {
    throw new Error('Logarithm undefined for non-positive numbers');
  }
  return {
    result: Math.log10(value)
  };
}

/**
 * 사인 계산 (라디안)
 * @title 사인
 * @description 각도(라디안)의 사인 값을 계산합니다
 * @category engineering
 * @param {object} params - 입력 파라미터
 * @param {number} params.angle - 각도 (라디안)
 * @returns {object} 사인 값
 */
export async function sin({ angle }) {
  return {
    result: Math.sin(angle)
  };
}

/**
 * 코사인 계산 (라디안)
 * @title 코사인
 * @description 각도(라디안)의 코사인 값을 계산합니다
 * @category engineering
 * @param {object} params - 입력 파라미터
 * @param {number} params.angle - 각도 (라디안)
 * @returns {object} 코사인 값
 */
export async function cos({ angle }) {
  return {
    result: Math.cos(angle)
  };
}

/**
 * 탄젠트 계산 (라디안)
 * @title 탄젠트
 * @description 각도(라디안)의 탄젠트 값을 계산합니다
 * @category engineering
 * @param {object} params - 입력 파라미터
 * @param {number} params.angle - 각도 (라디안)
 * @returns {object} 탄젠트 값
 */
export async function tan({ angle }) {
  return {
    result: Math.tan(angle)
  };
}

/**
 * 팩토리얼 계산
 * @title 팩토리얼
 * @description 양의 정수의 팩토리얼을 계산합니다
 * @category engineering
 * @param {object} params - 입력 파라미터
 * @param {number} params.n - 팩토리얼을 구할 숫자
 * @returns {object} 팩토리얼 결과
 */
export async function factorial({ n }) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Factorial is only defined for non-negative integers');
  }
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  
  return {
    result
  };
}
