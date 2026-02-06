/**
 * Domain Models / Entities
 * Following: Domain-Driven Design (DDD)
 * Represents core business concepts independent of technology
 */

import { UpdateStrategy } from '../types';

/**
 * Domain Entity: DetectionResult
 * Represents language detection results for a project
 */
export interface DetectionResult {
  readonly language: string;
  readonly detected: boolean;
  readonly projectRoot: string;
  readonly detectedAt: Date;
}

/**
 * Domain Entity: UpdateResult
 * Represents the outcome of a dependency update operation
 */
export interface UpdateOutcome {
  readonly language: string;
  readonly success: boolean;
  readonly updatedCount: number;
  readonly failedCount: number;
  readonly duration: number; // milliseconds
  readonly message?: string;
  readonly details?: Record<string, any>;
}

/**
 * Domain Entity: TestResult
 * Represents test execution outcome
 */
export interface TestOutcome {
  readonly language: string;
  readonly passed: boolean;
  readonly output: string;
  readonly duration: number; // milliseconds
  readonly failedTests?: string[];
}

/**
 * Domain Entity: AuditResult
 * Represents security audit outcome
 */
export interface AuditOutcome {
  readonly language: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  readonly vulnerabilities: {
    readonly critical: number;
    readonly high: number;
    readonly medium: number;
    readonly low: number;
  };
  readonly details?: string;
  readonly duration: number; // milliseconds
}

/**
 * Domain Entity: ExecutionContext
 * Represents the context of a dependency update execution
 */
export interface ExecutionContext {
  readonly strategy: UpdateStrategy;
  readonly languages: string[];
  readonly runTests: boolean;
  readonly runAudit: boolean;
  readonly autoCommit: boolean;
  readonly createPR: boolean;
  readonly dryRun: boolean;
  readonly parallelExecution: boolean;
  readonly startedAt: Date;
  readonly projectRoot: string;
}

/**
 * Domain Entity: ExecutionReport
 * Represents the complete report of an execution
 */
export interface ExecutionReport {
  readonly context: ExecutionContext;
  readonly detections: DetectionResult[];
  readonly updates: UpdateOutcome[];
  readonly tests: TestOutcome[];
  readonly audits: AuditOutcome[];
  readonly gitCommitSha?: string;
  readonly pullRequestUrl?: string;
  readonly completedAt: Date;
  readonly durationMs: number;
  readonly success: boolean;
}

/**
 * Domain Value Object: LanguageConfig
 * Represents configuration for a specific language
 */
export interface LanguageConfiguration {
  readonly name: string;
  readonly enabled: boolean;
  readonly priority: number;
  readonly timeout: number;
  readonly retries: number;
}

/**
 * Domain Value Object: GitConfig
 * Represents Git-related configuration
 */
export interface GitConfiguration {
  readonly author: string;
  readonly email: string;
  readonly branchPrefix: string;
  readonly commitPrefix: string;
  readonly createBranch: boolean;
  readonly autoCommit: boolean;
  readonly createPullRequest: boolean;
  readonly strictMode: boolean;
}

/**
 * Domain Value Object: Vulnerability
 * Represents a single vulnerability
 */
export interface Vulnerability {
  readonly id: string;
  readonly package: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly description: string;
  readonly fixedVersion?: string;
  readonly affectedVersions: string[];
}

/**
 * Domain Entity: LanguageHandler
 * Base interface for language handlers - defines the contract
 */
export interface ILanguageHandler {
  readonly name: string;
  readonly enabled: boolean;

  detect(): Promise<DetectionResult>;
  update(strategy: UpdateStrategy): Promise<UpdateOutcome>;
  test(): Promise<TestOutcome>;
  audit(): Promise<AuditOutcome>;
  changelog(): Promise<string>;
}

/**
 * Domain Entity: DependencyService
 * Base interface for dependency management service
 */
export interface IDependencyService {
  detectLanguages(): Promise<DetectionResult[]>;
  updateDependencies(strategy: UpdateStrategy, languages?: string[]): Promise<UpdateOutcome[]>;
  testDependencies(languages?: string[]): Promise<TestOutcome[]>;
  auditDependencies(languages?: string[]): Promise<AuditOutcome[]>;
  generateReport(context: ExecutionContext): Promise<ExecutionReport>;
}
