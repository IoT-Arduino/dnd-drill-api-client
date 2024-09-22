import { useLayoutEffect, useState, useEffect } from 'react'
import { IonToast } from '@ionic/react'
import { isDesktop } from 'react-device-detect'
import { IoAlertCircleOutline } from 'react-icons/io5'

import { ColumnContainer } from './ColumnContainer'
import styles from './MainBoard.module.scss'
import { TabHeader } from './utilParts/TabHeader'
import { Column, DrillContent, Id } from './../types/types'
import { useStorage } from '../hooks/useStorage'

import { useAuth } from '@clerk/clerk-react';

const API_URL = 'http://localhost:8787'; // HonoのAPIサーバーのURL

const PresetColumns: Column[] = [
  {
    id: 'drill',
    title: '今日のドリル'
  },
  {
    id: 'stock',
    title: 'ドリルストック'
  }
]

export const MainBoard = () => {
  const [columns] = useState<Column[]>(PresetColumns)
  const [isToastOpen, setIsTostOpen] = useState(false)


  const [data, setData] = useState(null);
  const { getToken } = useAuth();

  // API related
  useEffect(() => {

    const fetchData = async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/protected`, {
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${token}`,
          'content-type':'application/json'
        },
        credentials:"include" // include, same-origin, omit
      });
      const data = await response.json();
      setData(data);

    }

    fetchData();
  }, []);





  // storage related
  const {
    drills,
    createDrillOnStorage,
    deleteDrillOnStorage,
    updateDrillOnStorage,
    updateDrillColumnIdOnStorage,
    updateDrillStatusOnStorage,
    moveDrillsOnSubmit,
    submitButtonEnabled,
    setSubmitButtonEnabled,
    saveTodaysDrill
  } = useStorage()

  const [widthSmall, setWidthSmall] = useState(false)
  useLayoutEffect(() => {
    const updateSize = (): void => {
      setWidthSmall(window.innerWidth < 768)
    }

    window.addEventListener('resize', updateSize)
    updateSize()

    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const dateInfo = new Date()
  const today = `${dateInfo.getFullYear()}年${dateInfo.getMonth() + 1}月${dateInfo.getDate()}日`
  const drillItemsCheckedFiltered = drills.filter((drill) => drill.columnId === 'drill' && drill.status === true)
  const drillItemsChecked = drillItemsCheckedFiltered.map((item) => ({ id: item.id, content: item.content }))

  const createDrill = async (columnId: Id, content: DrillContent) => {
    await createDrillOnStorage(columnId, content)
  }

  const deleteDrill = async (id: Id) => {
    await deleteDrillOnStorage(id)
  }

  const updateDrill = async (id: Id, content: DrillContent) => {
    await updateDrillOnStorage(id, content)
  }

  const updateDrillColumnId = async (id: Id, columnId: string) => {
    await updateDrillColumnIdOnStorage(id, columnId)
  }

  const updateDrillStatus = async (id: Id, status: boolean) => {
    await updateDrillStatusOnStorage(id, status)
  }

  const submitDrill = (todayMemo: string) => {
    // チェック済みのドリル項目を送信する
    const submitObject = {
      date: today,
      memo: todayMemo,
      drillItemsChecked
    }
    // console.log(submitObject)
    saveTodaysDrill(submitObject)
    setIsTostOpen(true)

    setSubmitButtonEnabled(false)
    moveDrillsOnSubmit()
  }

  return (
    <>
      <TabHeader />
      {/* PC で画面幅が小さいときのwarning */}
      {widthSmall && isDesktop && (
        <p className={styles['small-warning']}>
          <span className={styles['small-warning-icon']}>
            <IoAlertCircleOutline />
          </span>
          画面幅を広げてください
        </p>
      )}

      <div className={isDesktop ? `${styles['main-wrapper']} ${styles['desktop']}` : styles['main-wrapper']}>
        {columns.map((col) => {
          return (
            <ColumnContainer
              key={col.id}
              column={col}
              drills={drills.filter((drill) => drill.columnId === col.id)}
              createDrill={createDrill}
              deleteDrill={deleteDrill}
              updateDrill={updateDrill}
              updateDrillStatus={updateDrillStatus}
              submitButtonEnabled={submitButtonEnabled}
              updateDrillColumnId={updateDrillColumnId}
              submitDrill={submitDrill}
            />
          )
        })}
      </div>

      <IonToast
        color="light"
        isOpen={isToastOpen}
        message="今日のドリルを履歴に保存しました"
        onDidDismiss={() => setIsTostOpen(false)}
        duration={3000}
        className={styles['main-toast']}
      ></IonToast>
    </>
  )
}
