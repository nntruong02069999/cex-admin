import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { 
  GameCategory, 
  CommissionMatrix, 
  CommissionEditCell,
  ApiError
} from './types';
import { getCommissionRates, updateCommissionRates } from '../../services/comission-rate';

export const useCommissionRates = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gameCategories, setGameCategories] = useState<GameCategory[]>([]);
  const [commissionMatrix, setCommissionMatrix] = useState<CommissionMatrix>({});
  const [editingCells, setEditingCells] = useState<Set<string>>(new Set());
  const [pendingChanges, setPendingChanges] = useState<Map<string, CommissionEditCell>>(new Map());

  // Extract dynamic levels from commission matrix
  const dynamicLevels = useMemo(() => {
    const agencyLevels = new Set<string>();
    const subordinateLevels = new Set<string>();

    // Extract levels from all game types in the commission matrix
    Object.values(commissionMatrix).forEach(gameTypeMatrix => {
      Object.keys(gameTypeMatrix).forEach(agencyLevel => {
        agencyLevels.add(agencyLevel);
        Object.keys(gameTypeMatrix[agencyLevel]).forEach(subLevel => {
          subordinateLevels.add(subLevel);
        });
      });
    });

    // Sort levels for consistent display
    const sortedAgencyLevels = Array.from(agencyLevels).sort((a, b) => {
      // Extract numeric part for proper sorting (L0, L1, L2, etc.)
      const aNum = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const bNum = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return aNum - bNum;
    });

    const sortedSubordinateLevels = Array.from(subordinateLevels).sort((a, b) => {
      // Numeric sort for subordinate levels
      const aNum = parseInt(a, 10) || 0;
      const bNum = parseInt(b, 10) || 0;
      return aNum - bNum;
    });

    return {
      agencyLevels: sortedAgencyLevels,
      subordinateLevels: sortedSubordinateLevels
    };
  }, [commissionMatrix]);

  // Load commission rates data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCommissionRates();
      
      if ('code' in result) {
        setGameCategories(result.data.gameCategories);
        setCommissionMatrix(result.data.commissionMatrix);
      } else {
        message.error((result as ApiError).message || 'Failed to load commission rates');
      }
    } catch (error) {
      message.error('Error loading commission rates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get cell key for tracking edits
  const getCellKey = (gameTypeCode: string, agencyLevel: string, subLevel: string) => {
    return `${gameTypeCode}-${agencyLevel}-${subLevel}`;
  };

  // Start editing a cell
  const startEditing = (gameTypeCode: string, agencyLevel: string, subLevel: string) => {
    const cellKey = getCellKey(gameTypeCode, agencyLevel, subLevel);
    setEditingCells(prev => new Set([...prev, cellKey]));
  };

  // Stop editing a cell (keep pending changes)
  const stopEditing = (gameTypeCode: string, agencyLevel: string, subLevel: string) => {
    const cellKey = getCellKey(gameTypeCode, agencyLevel, subLevel);
    setEditingCells(prev => {
      const newSet = new Set(prev);
      newSet.delete(cellKey);
      return newSet;
    });
  };

  // Cancel editing a cell (remove pending changes)
  const cancelEditing = (gameTypeCode: string, agencyLevel: string, subLevel: string) => {
    const cellKey = getCellKey(gameTypeCode, agencyLevel, subLevel);
    setEditingCells(prev => {
      const newSet = new Set(prev);
      newSet.delete(cellKey);
      return newSet;
    });
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.delete(cellKey);
      return newMap;
    });
  };

  // Update cell value
  const updateCellValue = (
    gameTypeCode: string, 
    agencyLevel: string, 
    subLevel: string, 
    value: number
  ) => {
    const cellKey = getCellKey(gameTypeCode, agencyLevel, subLevel);
    setPendingChanges(prev => new Map(prev.set(cellKey, {
      gameTypeCode,
      agencyLevel,
      subordinateLevel: subLevel,
      value
    })));
  };

  // Get current value for a cell (including pending changes)
  const getCellValue = (gameTypeCode: string, agencyLevel: string, subLevel: string): number => {
    const cellKey = getCellKey(gameTypeCode, agencyLevel, subLevel);
    const pendingChange = pendingChanges.get(cellKey);
    
    if (pendingChange) {
      return pendingChange.value;
    }
    
    return commissionMatrix[gameTypeCode]?.[agencyLevel]?.[subLevel] || 0;
  };

  // Check if cell is being edited
  const isCellEditing = (gameTypeCode: string, agencyLevel: string, subLevel: string): boolean => {
    const cellKey = getCellKey(gameTypeCode, agencyLevel, subLevel);
    return editingCells.has(cellKey);
  };

  // Save changes for a specific game type
  const saveChanges = async (gameTypeCode: string) => {
    const gameChanges = Array.from(pendingChanges.values())
      .filter(change => change.gameTypeCode === gameTypeCode);
    
    if (gameChanges.length === 0) {
      message.warning('No changes to save');
      return;
    }

    setSaving(true);
    try {
      // Build the commission matrix for this game type
      const gameMatrix: Record<string, Record<string, number>> = {};
      
      // Start with existing data
      const existingMatrix = commissionMatrix[gameTypeCode] || {};
      for (const agencyLevel in existingMatrix) {
        gameMatrix[agencyLevel] = { ...existingMatrix[agencyLevel] };
      }
      
      // Apply pending changes
      gameChanges.forEach(change => {
        if (!gameMatrix[change.agencyLevel]) {
          gameMatrix[change.agencyLevel] = {};
        }
        gameMatrix[change.agencyLevel][change.subordinateLevel] = change.value;
      });

      const result = await updateCommissionRates({
        gameTypeCode,
        commissionMatrix: gameMatrix
      });

      if ('code' in result) {
        message.success('Commission rates updated successfully');
        
        // Update local state
        setCommissionMatrix(prev => ({
          ...prev,
          [gameTypeCode]: gameMatrix
        }));
        
        // Clear pending changes and editing state for this game type
        const newPendingChanges = new Map(pendingChanges);
        const newEditingCells = new Set(editingCells);
        
        gameChanges.forEach(change => {
          const cellKey = getCellKey(change.gameTypeCode, change.agencyLevel, change.subordinateLevel);
          newPendingChanges.delete(cellKey);
          newEditingCells.delete(cellKey);
        });
        
        setPendingChanges(newPendingChanges);
        setEditingCells(newEditingCells);
        
      } else {
        message.error((result as ApiError).message || 'Failed to update commission rates');
      }
    } catch (error) {
      message.error('Error updating commission rates');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Check if there are pending changes for a game type
  const hasPendingChanges = (gameTypeCode: string): boolean => {
    return Array.from(pendingChanges.values()).some(change => change.gameTypeCode === gameTypeCode);
  };

  return {
    loading,
    saving,
    gameCategories,
    commissionMatrix,
    agencyLevels: dynamicLevels.agencyLevels,
    subordinateLevels: dynamicLevels.subordinateLevels,
    loadData,
    startEditing,
    stopEditing,
    cancelEditing,
    updateCellValue,
    getCellValue,
    isCellEditing,
    saveChanges,
    hasPendingChanges
  };
}; 