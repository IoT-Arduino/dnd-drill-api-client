import React, { useEffect, useState } from 'react';
// import { useStorage } from '../../hooks/useStorage'
import { useAuth } from '@clerk/clerk-react';

import { DrillHistoryItem } from '../../types/types'
import { API_BASE_URL } from '../../consts/const';

import { TabHeader } from '../utilParts/TabHeader'

import styles from './History.module.scss'

type DrillHistory = DrillHistoryItem[] | null;

type DrillItem = {
  text: string;
  url: string;
};

export const History = () => {
  // const { drillHistory } = useStorage()

  const [drillHistory, setDrillHistory] = useState<DrillHistory>(null);
  const { getToken } = useAuth();

  // const API_URL = 'http://localhost:8787'; // HonoのAPIサーバーのURL

  // API related
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${API_BASE_URL}/history`, {
        method: "GET",
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'content-type': 'application/json'
        },
        // credentials: "same-origin" // include, same-origin, omit　 --> コメントアウトしないとCORSエラーになる。
      });
      const data = await response.json();

      const parsedDrillHistory = data?.map((drill: { drills: unknown; }) => {
        const drills = JSON.parse(drill.drills as unknown as string) as DrillItem[];
        return {
          ...drill,
          drills
        };
      });

      setDrillHistory(parsedDrillHistory);
    }
    fetchData();
  }, []);

  return (
    <>
      <TabHeader />
      {drillHistory !== null ? (
        <div className={styles['history-wrapper']}>
          {drillHistory.length > 0 ? (
            drillHistory.map((drill) => (
              <React.Fragment key={drill.id}>
                <div className={styles['history-date']}>
                  {new Date(drill.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  }).replace(':', '時') + '分'}
                </div>
                <div className={styles['history-item']}>
                  <div className={styles['history-memo-title']}>今日のメモ：</div>
                  <p className={styles['history-memo-content']}>
                    {drill.memo}
                  </p>

                  <div className={styles['history-list']}>
                    <div className={styles['history-drill-title']}>今日実施したドリル</div>
                    {(drill.drills as unknown as DrillItem[]).map((drillItem, index) => (
                      <div key={index} className={styles['history-list-item']}>
                        <>
                          <span>{drillItem.text}</span>
                          <a href={drillItem.url}>Link</a>
                        </>
                      </div>
                    ))}
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <div className={styles['history-nodata']}>
              <p>
                履歴データは
                <br />
                まだ登録されていません。
              </p>
            </div>
          )
          }
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  )
}
