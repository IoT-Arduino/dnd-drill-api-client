import { useState, useRef, useEffect } from 'react'
import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel } from '@ionic/react'
import {
  archive,
  trash,
  pencilOutline,
  checkmarkDoneCircleOutline,
  arrowUndoCircleOutline,
  globeOutline
} from 'ionicons/icons'
// for edit modal
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'

import { Drill, Id, DrillContent } from './../types/types'
import styles from './DrillCard.module.scss'
import { MAX_TEXT_LENGTH } from '../consts/const'

type Props = {
  drill: Drill
  deleteDrill: (id: Id) => void
  updateDrill: (id: Id, content: DrillContent) => void
  updateDrillStatus: (id: Id, status: boolean) => boolean
  columnId?: 'drill' | 'stock'
  updateDrillColumnId: (id: Id, columnId: string) => void
}

export const DrillCard = ({
  drill,
  deleteDrill,
  updateDrill,
  updateDrillStatus,
  columnId,
  updateDrillColumnId
}: Props) => {
  const [drillComplete, setDrillComplete] = useState<boolean>(drill.status)
  const [editDrillContent, setEditDrillContent] = useState<DrillContent>(drill.content)
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)

  const [validated, setValidated] = useState(false)

  const moveToColumnId = columnId === 'stock' ? 'drill' : 'stock'
  const slideRef = useRef<HTMLIonItemSlidingElement>(null)

  const closeSlidingItem = () => {
    slideRef.current?.close()
  }

  const editSubmit = (e: any) => {
    const form = e.currentTarget
    if (form.checkValidity() === false) {
      e.preventDefault()
      e.stopPropagation()
    }
    setValidated(true)

    updateDrill(drill.id, editDrillContent)
    setOpenEditDialog(false)
  }

  return (
    <>
      <IonItemSliding ref={slideRef} className={styles['drill-item']}>
        {columnId === 'stock' ? (
          <IonItemOptions side="start">
            <IonItemOption
              onClick={() => {
                setOpenEditDialog(true)
                closeSlidingItem()
              }}
            >
              <IonIcon slot="start" icon={pencilOutline}></IonIcon>
              編集
            </IonItemOption>
            <IonItemOption
              color="danger"
              onClick={() => {
                deleteDrill(drill.id)
                closeSlidingItem()
              }}
            >
              <IonIcon slot="start" icon={trash}></IonIcon>
              削除
            </IonItemOption>
          </IonItemOptions>
        ) : null}

        {columnId === 'drill' && drillComplete ? (
          <IonItemOptions side="start">
            <IonItemOption
              color="success"
              onClick={() => {
                updateDrillStatus(drill.id, false)
                setDrillComplete(false)
                closeSlidingItem()
              }}
            >
              <IonIcon slot="start" icon={arrowUndoCircleOutline}></IonIcon>
              UnCheck
            </IonItemOption>
          </IonItemOptions>
        ) : columnId === 'drill' && !drillComplete ? (
          <IonItemOptions side="start">
            <IonItemOption
              onClick={() => {
                updateDrillStatus(drill.id, true)
                setDrillComplete(true)
                closeSlidingItem()
              }}
            >
              <IonIcon slot="start" icon={checkmarkDoneCircleOutline}></IonIcon>
              Done
            </IonItemOption>
          </IonItemOptions>
        ) : null}

        {/* ドリル表示内容 */}
        {columnId === 'stock' ? (
          <IonItem lines="none">
            <IonLabel className={styles['drill-item-label']}>
              {drill.content.url && (
                <IonIcon
                  slot="start"
                  icon={globeOutline}
                  onDoubleClick={() => window.open(drill.content.url, '_blank', 'noreferer')}
                  className={styles['drill-url-icon']}
                ></IonIcon>
              )}
              {drill.content.text}
            </IonLabel>
          </IonItem>
        ) : (
          <IonItem lines="none">
            <IonLabel className={drillComplete ? styles['drill-item-done'] : styles['drill-item-label']}>
              {drill.content.url && !drillComplete && (
                <IonIcon
                  slot="start"
                  icon={globeOutline}
                  onDoubleClick={() => window.open(drill.content.url, '_blank', 'noreferer')}
                  className={styles['drill-url-icon']}
                ></IonIcon>
              )}
              {drill.content.text}
            </IonLabel>
          </IonItem>
        )}

        <IonItemOptions side="end">
          <IonItemOption
            color="success"
            onClick={() => {
              updateDrillColumnId(drill.id, moveToColumnId)
              closeSlidingItem()
            }}
          >
            <IonIcon slot="start" icon={archive}></IonIcon>
            移動
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>

      {/* dialog for edit drill */}
      <Modal show={openEditDialog} onHide={() => setOpenEditDialog(false)}>
        <Modal.Header closeButton>
          <Modal.Title>ドリルの編集</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>url</Form.Label>
              <Form.Control
                type="url"
                pattern="https?://.*"
                value={editDrillContent.url || ''}
                onChange={(e) => setEditDrillContent((prev) => ({ ...prev, url: e.target.value }))}
                isInvalid={!!editDrillContent.url && !/^https?:\/\/.*$/.test(editDrillContent.url)}
              />
              <Form.Control.Feedback type="invalid">正しいURLを入力してください。</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>ドリルの内容</Form.Label>
              <Form.Control
                required
                as="textarea"
                rows={3}
                value={editDrillContent.text}
                onChange={(e) => setEditDrillContent((prev) => ({ ...prev, text: e.target.value }))}
                maxLength={MAX_TEXT_LENGTH}
              />
            </Form.Group>
          </Form>
          <p
            style={{
              textAlign: 'right',
              fontSize: '12px',
              color: editDrillContent.text.length >= 60 ? 'red' : 'inherit'
            }}
          >
            {`${editDrillContent.text.length}文字/${MAX_TEXT_LENGTH}文字`}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={editSubmit} disabled={!editDrillContent.text.length}>
            編集確定
          </Button>
          <Button variant="secondary" onClick={() => setOpenEditDialog(false)}>
            キャンセル
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
