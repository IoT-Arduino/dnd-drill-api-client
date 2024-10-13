import { useState, useEffect, useCallback } from 'react';
import { Id, Drill, TodaysDrill, DrillContent, DrillWithoutId } from './../types/types';
import { SAVE_DRILLS_LENGTH, API_BASE_URL } from '../consts/const';
import { useAuth } from '@clerk/clerk-react';

export const useDrillsApi = () => {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [drillHistory, setDrillHistory] = useState<TodaysDrill[]>([]);
  const [submitButtonEnabled, setSubmitButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getToken } = useAuth();

  const convertStatusToBoolean = (status: number): boolean => status === 1 ? true : false;
  const convertStatusToNumber = (status: boolean): number => status ? 1 : 0;

  const convertApiDrillToLocalFormat = (apiDrill: any): Drill => ({
    ...apiDrill,
    status: convertStatusToBoolean(apiDrill.status),
    content: {
      url: apiDrill.url,
      text: apiDrill.content
    }
  });

  const convertLocalDrillToApiFormat = (localDrill: DrillWithoutId): any => ({
    ...localDrill,
    url: localDrill.content.url,
    content: localDrill.content.text,
    status: convertStatusToNumber(localDrill.status)
  });

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    const defaultOptions: RequestInit = {
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    };
    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }, [getToken]);

  const fetchDrills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/drills`);
      const convertedData = data.map(convertApiDrillToLocalFormat);
      setDrills(convertedData);
    } catch (error) {
      setError('Failed to fetch drills');
      console.error('Error fetching drills:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/history`);
      setDrillHistory(data);
    } catch (error) {
      setError('Failed to fetch history');
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchDrills();
    fetchHistory();
  }, [fetchDrills, fetchHistory]);

  const createDrillOnApi = async (columnId: Id, drillContent: DrillContent) => {
    setIsLoading(true);
    setError(null);
    try {
      const newDrill: DrillWithoutId = {
        columnId,
        content: drillContent,
        status: false
      };

      const apiDrill = convertLocalDrillToApiFormat(newDrill);

      const response = await fetchWithAuth(`${API_BASE_URL}/drills`, {
        method: 'POST',
        body: JSON.stringify(apiDrill)
      });
      // const createdDrill = await response.json();
      // サーバーから返された情報を使用してローカルの状態を更新
      setDrills([convertApiDrillToLocalFormat(response), ...drills]);

    } catch (error: any) {
      setError('Failed to create drill');
      console.error('Error creating drill:', error.message, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDrillOnApi = async (id: Id) => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`${API_BASE_URL}/drills/${id}`, {
        method: 'DELETE'
      });
      const newDrills = drills.filter((drill) => drill.id !== id);
      setDrills(newDrills);
    } catch (error) {
      setError('Failed to delete drill');
      console.error('Error deleting drill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDrillOnApi = async (id: Id, content: DrillContent) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUpdateContent = {
        url: content.url,
        content: content.text
      };
      console.log("api update", apiUpdateContent)
      await fetchWithAuth(`${API_BASE_URL}/drills/${id}`, {
        method: 'PUT',
        body: JSON.stringify(apiUpdateContent)
      });
      const newDrills = drills.map((drill) => {
        if (drill.id !== id) return drill;
        return { ...drill, content };
      });
      setDrills(newDrills);
    } catch (error) {
      setError('Failed to update drill');
      console.error('Error updating drill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDrillColumnIdOnApi = async (id: Id, columnId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`${API_BASE_URL}/drills/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ columnId, status: convertStatusToNumber(false) })
      });
      const newDrills = drills.map((drill) => {
        if (drill.id !== id) return drill;
        return { ...drill, columnId, status: false };
      });
      const isAnyDrillActive = newDrills.some((drill) => drill.status);
      setSubmitButtonEnabled(isAnyDrillActive);
      setDrills(newDrills);
    } catch (error) {
      setError('Failed to update drill column ID');
      console.error('Error updating drill column ID:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDrillStatusOnApi = async (id: Id, status: boolean) : Promise<boolean>=> {

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/drills/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: convertStatusToNumber(status) })
      });

      const newDrills = drills.map((drill: Drill) => {
        if (drill.id !== id) return drill;
        return { ...drill, status };
      });
      const isAnyDrillActive = newDrills.some((drill: Drill) => drill.status);
      setSubmitButtonEnabled(isAnyDrillActive);
      setDrills(newDrills);
      // 更新された状態を返す
      return convertStatusToBoolean(response.status);

    } catch (error) {
      setError('Failed to update drill status');
      console.error('Error updating drill status:', error);
      // エラーの場合は元の状態を返す
      return !status;
    } finally {
      setIsLoading(false);
    }
  };

  const moveDrillsOnSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedDrills = await Promise.all(drills.map(async (drill) => {
        if (drill.columnId === 'drill') {
          await fetchWithAuth(`${API_BASE_URL}/drills/${drill.id}`, {
            method: 'PUT',
            body: JSON.stringify({ columnId: 'stock', status: convertStatusToNumber(false) })
          });
          return { ...drill, columnId: 'stock', status: false };
        }
        return drill;
      }));
      setDrills(updatedDrills);
    } catch (error) {
      setError('Failed to move drills on submit');
      console.error('Error moving drills on submit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTodaysDrill = async (drill: TodaysDrill) => {
    console.log("saveTodaysDrill", drill)
    setIsLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`${API_BASE_URL}/history`, {
        method: 'POST',
        body: JSON.stringify(drill)
      });
      const newDrillHistory = [drill, ...drillHistory];
      if (newDrillHistory.length > SAVE_DRILLS_LENGTH) {
        newDrillHistory.pop();
      }
      setDrillHistory(newDrillHistory);
    } catch (error) {
      setError('Failed to save today\'s drill');
      console.error('Error saving today\'s drill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    drills,
    drillHistory,
    isLoading,
    error,
    submitButtonEnabled,
    setSubmitButtonEnabled,
    createDrillOnApi,
    deleteDrillOnApi,
    updateDrillOnApi,
    updateDrillColumnIdOnApi,
    updateDrillStatusOnApi,
    moveDrillsOnSubmit,
    saveTodaysDrill,
    fetchDrills,
    fetchHistory
  };
};