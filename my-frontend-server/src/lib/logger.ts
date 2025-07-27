export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

// 환경에 따른 기본 로그 레벨 설정
const DEFAULT_LOG_LEVEL: LogLevel = 
  process.env.NODE_ENV === 'production' ? 'error' : 'debug';

// 로컬 스토리지에서 로그 레벨 가져오기
const getLogLevel = (): LogLevel => {
  try {
    const storedLevel = localStorage.getItem('log_level');
    return (storedLevel as LogLevel) || DEFAULT_LOG_LEVEL;
  } catch (error) {
    // 오류 상황에서 기본값 반환 (error 변수 사용)
    console.warn('로그 레벨을 로드하는 중 오류 발생:', error);
    return DEFAULT_LOG_LEVEL;
  }
};

// 로그 레벨 우선순위 (낮을수록 중요)
export const LOG_PRIORITIES: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2, 
  debug: 3,
  trace: 4
};

// 콘텍스트 로거 생성 함수
export const createLogger = (context: string) => {
  const shouldLog = (level: LogLevel): boolean => {
    const currentLevel = getLogLevel();
    return LOG_PRIORITIES[level] <= LOG_PRIORITIES[currentLevel];
  };

  const formatMessage = (message: string): string => {
    return `[${context}] ${message}`;
  };

  return {
    error: (message: string, ...data: unknown[]) => {
      if (shouldLog('error')) {
        console.error(formatMessage(message), ...data);
      }
    },
    warn: (message: string, ...data: unknown[]) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage(message), ...data);
      }
    },
    info: (message: string, ...data: unknown[]) => {
      if (shouldLog('info')) {
        console.info(formatMessage(message), ...data);
      }
    },
    debug: (message: string, ...data: unknown[]) => {
      if (shouldLog('debug')) {
        console.debug(formatMessage(message), ...data);
      }
    },
    trace: (message: string, ...data: unknown[]) => {
      if (shouldLog('trace')) {
        console.log(formatMessage(message), ...data);
      }
    },
    group: (title: string, fn: () => void) => {
      if (shouldLog('debug')) {
        console.group(formatMessage(title));
        try {
          fn();
        } finally {
          console.groupEnd();
        }
      } else {
        fn();
      }
    },
    // 실행 시간 측정 유틸리티 추가
    logTiming: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
      if (shouldLog('debug')) {
        const start = performance.now();
        try {
          const result = await fn();
          const duration = Math.round(performance.now() - start);
          console.log(formatMessage(`${name} 완료 (${duration}ms)`));
          return result;
        } catch (error) {
          const duration = Math.round(performance.now() - start);
          console.error(formatMessage(`${name} 실패 (${duration}ms)`), error);
          throw error;
        }
      } else {
        return fn();
      }
    }
  };
};

declare global {
  interface Window {
    setLogLevel: (level: LogLevel) => void;
  }
}

// 개발자 도구에서 로그 레벨 변경을 위한 전역 함수
if (typeof window !== 'undefined') {
  window.setLogLevel = (level: LogLevel) => {
    if (LOG_PRIORITIES[level] !== undefined) {
      localStorage.setItem('log_level', level);
      console.log(`로그 레벨이 '${level}'로 변경되었습니다.`);
    } else {
      console.error(`유효하지 않은 로그 레벨: ${level}`);
    }
  };
}

// 기본 로거
export const logger = createLogger('App');