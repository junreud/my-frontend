// lib/performance.ts
import { trackEvent } from './analytics';

// Web Vitals 관련 타입 확장
declare global {
  interface Window {
    webVitals?: unknown;
    performanceMonitor?: PerformanceMonitor;
  }
  
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

// 특정 Performance Entry 타입들
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
}

interface ResourceTimingEntry extends PerformanceEntry {
  transferSize: number;
}

// Core Web Vitals 인터페이스
interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  url: string;
  timestamp: number;
}

// 성능 메트릭 인터페이스
/*
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType?: string;
  deviceMemory?: number;
}
*/

// 리소스 성능 정보
interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
  timestamp: number;
}

// 메모리 정보
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

// 인터랙션 정보
interface InteractionMetric {
  type: string;
  target: string;
  startTime: number;
  duration: number;
  timestamp: number;
}

// 성능 대시보드 데이터
export interface PerformanceDashboardData {
  webVitals: WebVital[];
  resources: ResourceTiming[];
  memory: MemoryInfo[];
  interactions: InteractionMetric[];
  pageLoadMetrics: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    timeToInteractive: number;
  };
  networkInfo: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
}

// Core Web Vitals 임계값
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

// 성능 등급 계산
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// 성능 데이터 저장소
class PerformanceDataStore {
  private static instance: PerformanceDataStore;
  private data: PerformanceDashboardData = {
    webVitals: [],
    resources: [],
    memory: [],
    interactions: [],
    pageLoadMetrics: {
      domContentLoaded: 0,
      loadComplete: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0,
    },
    networkInfo: {
      effectiveType: '',
      downlink: 0,
      rtt: 0,
      saveData: false,
    },
  };

  static getInstance(): PerformanceDataStore {
    if (!PerformanceDataStore.instance) {
      PerformanceDataStore.instance = new PerformanceDataStore();
    }
    return PerformanceDataStore.instance;
  }

  addWebVital(vital: WebVital) {
    this.data.webVitals.push(vital);
    this.data.webVitals = this.data.webVitals.slice(-100); // 최근 100개만 유지
  }

  addResource(resource: ResourceTiming) {
    this.data.resources.push(resource);
    this.data.resources = this.data.resources.slice(-200); // 최근 200개만 유지
  }

  addMemoryInfo(memory: MemoryInfo) {
    this.data.memory.push(memory);
    this.data.memory = this.data.memory.slice(-50); // 최근 50개만 유지
  }

  addInteraction(interaction: InteractionMetric) {
    this.data.interactions.push(interaction);
    this.data.interactions = this.data.interactions.slice(-100); // 최근 100개만 유지
  }

  updatePageLoadMetrics(metrics: Partial<PerformanceDashboardData['pageLoadMetrics']>) {
    this.data.pageLoadMetrics = { ...this.data.pageLoadMetrics, ...metrics };
  }

  updateNetworkInfo(info: Partial<PerformanceDashboardData['networkInfo']>) {
    this.data.networkInfo = { ...this.data.networkInfo, ...info };
  }

  getData(): PerformanceDashboardData {
    return { ...this.data };
  }

  clear() {
    this.data = {
      webVitals: [],
      resources: [],
      memory: [],
      interactions: [],
      pageLoadMetrics: {
        domContentLoaded: 0,
        loadComplete: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
        timeToInteractive: 0,
      },
      networkInfo: {
        effectiveType: '',
        downlink: 0,
        rtt: 0,
        saveData: false,
      },
    };
  }
}

// 성능 모니터링 클래스
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private dataStore: PerformanceDataStore;
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.dataStore = PerformanceDataStore.getInstance();
    this.initializeMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return;

    this.collectWebVitals();
    this.collectResourceTimings();
    this.collectMemoryInfo();
    this.collectInteractionMetrics();
    this.collectPageLoadMetrics();
    this.collectNetworkInfo();
  }

  // Web Vitals 수집 개선
  private collectWebVitals() {
    // Core Web Vitals 수집을 위한 웹 바이탈 라이브러리 사용
    if ('web-vitals' in window || typeof window.webVitals !== 'undefined') {
      // 실제 프로덕션에서는 web-vitals 라이브러리를 사용
      this.collectWebVitalsManually();
    } else {
      this.collectWebVitalsManually();
    }
  }

  private collectWebVitalsManually() {
    // CLS (Cumulative Layout Shift) 측정
    this.observeCLS();
    
    // FID (First Input Delay) 측정
    this.observeFID();
    
    // LCP (Largest Contentful Paint) 측정
    this.observeLCP();
    
    // FCP (First Contentful Paint) 측정
    this.observeFCP();
    
    // INP (Interaction to Next Paint) 측정
    this.observeINP();
  }

  private observeCLS() {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const clsEntry = entry as LayoutShiftEntry;
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
        }
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });
    this.observers.push(observer);

    // 페이지 언로드 시 CLS 값 전송
    window.addEventListener('beforeunload', () => {
      this.sendWebVital('CLS', clsValue);
    });
  }

  private observeFID() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as FirstInputEntry;
        const fidValue = fidEntry.processingStart - fidEntry.startTime;
        this.sendWebVital('FID', fidValue);
      }
    });
    observer.observe({ type: 'first-input', buffered: true });
    this.observers.push(observer);
  }

  private observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.sendWebVital('LCP', lastEntry.startTime);
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    this.observers.push(observer);
  }

  private observeFCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.sendWebVital('FCP', entry.startTime);
        }
      }
    });
    observer.observe({ type: 'paint', buffered: true });
    this.observers.push(observer);
  }

  private observeINP() {
    let longestInteraction = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as FirstInputEntry;
        const duration = eventEntry.processingEnd - eventEntry.startTime;
        if (duration > longestInteraction) {
          longestInteraction = duration;
          this.sendWebVital('INP', duration);
        }
      }
    });
    observer.observe({ type: 'event', buffered: true });
    this.observers.push(observer);
  }

  private sendWebVital(name: string, value: number) {
    const vital: WebVital = {
      name,
      value,
      rating: getRating(name, value),
      delta: value,
      id: `${name}-${Date.now()}`,
      url: window.location.href,
      timestamp: Date.now(),
    };

    this.dataStore.addWebVital(vital);
    
    // 분석 도구로 전송
    trackEvent('web_vital', name);
  }

  // 리소스 타이밍 수집
  private collectResourceTimings() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as ResourceTimingEntry;
        const resource: ResourceTiming = {
          name: entry.name,
          duration: entry.duration,
          size: resourceEntry.transferSize || 0,
          type: this.getResourceType(entry.name),
          timestamp: Date.now(),
        };
        this.dataStore.addResource(resource);
      }
    });
    observer.observe({ type: 'resource', buffered: true });
    this.observers.push(observer);
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js': return 'javascript';
      case 'css': return 'stylesheet';
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': return 'image';
      case 'woff': case 'woff2': case 'ttf': return 'font';
      default: return 'other';
    }
  }

  // 메모리 정보 수집
  private collectMemoryInfo() {
    const collectMemory = () => {
      if (performance.memory) {
        const memoryInfo: MemoryInfo = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now(),
        };
        this.dataStore.addMemoryInfo(memoryInfo);
      }
    };

    // 5초마다 메모리 정보 수집
    collectMemory();
    setInterval(collectMemory, 5000);
  }

  // 인터랙션 메트릭 수집
  private collectInteractionMetrics() {
    const events = ['click', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
          const duration = performance.now() - startTime;
          const interaction: InteractionMetric = {
            type: eventType,
            target: (event.target as Element)?.tagName || 'unknown',
            startTime,
            duration,
            timestamp: Date.now(),
          };
          this.dataStore.addInteraction(interaction);
        });
      });
    });
  }

  // 페이지 로드 메트릭 수집
  private collectPageLoadMetrics() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.dataStore.updatePageLoadMetrics({
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
        timeToInteractive: this.calculateTTI(),
      });
    });
  }

  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : 0;
  }

  private calculateTTI(): number {
    // TTI 계산 로직 (단순화된 버전)
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigation.domContentLoadedEventEnd;
  }

  // 네트워크 정보 수집
  private collectNetworkInfo() {
    if (navigator.connection) {
      const connection = navigator.connection;
      this.dataStore.updateNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      });
    }
  }

  // 성능 데이터 가져오기
  public getPerformanceData(): PerformanceDashboardData {
    return this.dataStore.getData();
  }

  // 성능 요약 정보
  public getPerformanceSummary() {
    const data = this.dataStore.getData();
    const webVitals = data.webVitals;
    
    const summary = {
      coreWebVitals: {
        cls: this.getLatestMetric(webVitals, 'CLS'),
        fid: this.getLatestMetric(webVitals, 'FID'),
        lcp: this.getLatestMetric(webVitals, 'LCP'),
        fcp: this.getLatestMetric(webVitals, 'FCP'),
        inp: this.getLatestMetric(webVitals, 'INP'),
      },
      resourceStats: {
        totalResources: data.resources.length,
        avgLoadTime: this.calculateAverage(data.resources.map(r => r.duration)),
        slowestResource: this.getSlowestResource(data.resources),
      },
      memoryStats: {
        current: data.memory[data.memory.length - 1],
        peak: this.getPeakMemory(data.memory),
      },
      interactionStats: {
        totalInteractions: data.interactions.length,
        avgResponseTime: this.calculateAverage(data.interactions.map(i => i.duration)),
        slowestInteraction: this.getSlowestInteraction(data.interactions),
      },
    };

    return summary;
  }

  private getLatestMetric(vitals: WebVital[], name: string): WebVital | null {
    return vitals.filter(v => v.name === name).pop() || null;
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private getSlowestResource(resources: ResourceTiming[]): ResourceTiming | null {
    if (resources.length === 0) return null;
    return resources.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
  }

  private getPeakMemory(memory: MemoryInfo[]): MemoryInfo | null {
    if (memory.length === 0) return null;
    return memory.reduce((peak, current) => 
      current.usedJSHeapSize > peak.usedJSHeapSize ? current : peak
    );
  }

  private getSlowestInteraction(interactions: InteractionMetric[]): InteractionMetric | null {
    if (interactions.length === 0) return null;
    return interactions.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
  }

  // 성능 모니터링 중지
  public stop() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  // 성능 데이터 내보내기
  public exportData(): string {
    return JSON.stringify(this.dataStore.getData(), null, 2);
  }

  // 성능 리포트 생성
  public generateReport(): string {
    const summary = this.getPerformanceSummary();
    
    return `
# 성능 모니터링 리포트
생성일: ${new Date().toLocaleString()}

## Core Web Vitals
- CLS: ${summary.coreWebVitals.cls?.value || 'N/A'} (${summary.coreWebVitals.cls?.rating || 'N/A'})
- FID: ${summary.coreWebVitals.fid?.value || 'N/A'}ms (${summary.coreWebVitals.fid?.rating || 'N/A'})
- LCP: ${summary.coreWebVitals.lcp?.value || 'N/A'}ms (${summary.coreWebVitals.lcp?.rating || 'N/A'})
- FCP: ${summary.coreWebVitals.fcp?.value || 'N/A'}ms (${summary.coreWebVitals.fcp?.rating || 'N/A'})
- INP: ${summary.coreWebVitals.inp?.value || 'N/A'}ms (${summary.coreWebVitals.inp?.rating || 'N/A'})

## 리소스 통계
- 총 리소스 수: ${summary.resourceStats.totalResources}
- 평균 로딩 시간: ${summary.resourceStats.avgLoadTime.toFixed(2)}ms
- 가장 느린 리소스: ${summary.resourceStats.slowestResource?.name || 'N/A'}

## 메모리 사용량
- 현재 사용량: ${((summary.memoryStats.current?.usedJSHeapSize || 0) / 1024 / 1024).toFixed(2)}MB
- 최대 사용량: ${((summary.memoryStats.peak?.usedJSHeapSize || 0) / 1024 / 1024).toFixed(2)}MB

## 인터랙션 통계
- 총 인터랙션 수: ${summary.interactionStats.totalInteractions}
- 평균 응답 시간: ${summary.interactionStats.avgResponseTime.toFixed(2)}ms
- 가장 느린 인터랙션: ${summary.interactionStats.slowestInteraction?.type || 'N/A'}
    `;
  }
}

// 전역 성능 모니터링 초기화
export const initializePerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    const monitor = PerformanceMonitor.getInstance();
    
    // 전역 객체에 성능 모니터 등록
    window.performanceMonitor = monitor;
    
    return monitor;
  }
  return null;
};

// 성능 모니터링 데이터 가져오기
export const getPerformanceData = (): PerformanceDashboardData | null => {
  if (typeof window !== 'undefined' && window.performanceMonitor) {
    return window.performanceMonitor.getPerformanceData();
  }
  return null;
};

// 성능 요약 정보 가져오기
export const getPerformanceSummary = () => {
  if (typeof window !== 'undefined' && window.performanceMonitor) {
    return window.performanceMonitor.getPerformanceSummary();
  }
  return null;
};
