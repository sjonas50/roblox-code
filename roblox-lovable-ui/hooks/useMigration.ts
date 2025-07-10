"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StorageAdapter } from '@/services/storageAdapter';

export function useMigration() {
  const { user } = useAuth();
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle');

  useEffect(() => {
    if (user && migrationStatus === 'idle') {
      performMigration();
    }
  }, [user, migrationStatus]);

  const performMigration = async () => {
    try {
      setMigrationStatus('pending');
      
      // Check if migration is needed
      const hasMigrated = localStorage.getItem(`migration_completed_${user?.id}`);
      if (hasMigrated) {
        setMigrationStatus('completed');
        return;
      }

      // Perform migration
      const success = await StorageAdapter.migrateToDatabase();
      
      if (success) {
        // Mark migration as complete for this user
        localStorage.setItem(`migration_completed_${user?.id}`, 'true');
        setMigrationStatus('completed');
      } else {
        setMigrationStatus('failed');
      }
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationStatus('failed');
    }
  };

  return { migrationStatus };
}