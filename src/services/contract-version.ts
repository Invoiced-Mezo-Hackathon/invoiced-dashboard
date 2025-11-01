// Contract Version Service
// Tracks contract deployments and automatically resets MATS when contracts change

import { MEZO_CONTRACTS } from '@/lib/mezo';

const STORAGE_KEY = 'contract_deployment_version';

interface DeploymentVersion {
  vault: string;
  invoice: string;
  musd: string;
  timestamp: number;
  version: string; // Hash of contract addresses
}

/**
 * Generate a version hash from contract addresses
 */
function generateVersionHash(vault: string, invoice: string, musd: string): string {
  const combined = `${vault}-${invoice}-${musd}`;
  // Simple hash function (in production, use a proper crypto hash)
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Get current deployment version from contract addresses
 */
export function getCurrentDeploymentVersion(): DeploymentVersion {
  return {
    vault: MEZO_CONTRACTS.MEZO_VAULT,
    invoice: MEZO_CONTRACTS.INVOICE_CONTRACT,
    musd: MEZO_CONTRACTS.MUSD_TOKEN,
    timestamp: Date.now(),
    version: generateVersionHash(
      MEZO_CONTRACTS.MEZO_VAULT,
      MEZO_CONTRACTS.INVOICE_CONTRACT,
      MEZO_CONTRACTS.MUSD_TOKEN
    ),
  };
}

/**
 * Get stored deployment version (last known contracts)
 */
export function getStoredDeploymentVersion(): DeploymentVersion | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Save current deployment version
 */
export function saveDeploymentVersion(version: DeploymentVersion): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(version));
  } catch (error) {
    console.error('Failed to save deployment version:', error);
  }
}

/**
 * Check if contracts have changed since last deployment
 */
export function hasContractsChanged(): boolean {
  const current = getCurrentDeploymentVersion();
  const stored = getStoredDeploymentVersion();
  
  if (!stored) {
    // No stored version means first time or cleared - consider it changed
    return true;
  }
  
  // Check if any contract address changed
  return (
    current.vault !== stored.vault ||
    current.invoice !== stored.invoice ||
    current.musd !== stored.musd ||
    current.version !== stored.version
  );
}

/**
 * Update stored deployment version to current contracts
 */
export function updateDeploymentVersion(): void {
  const current = getCurrentDeploymentVersion();
  saveDeploymentVersion(current);
}

