"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useI18n } from "../_i18n/I18n";
import styles from "../japan/japan.module.css";

type Kind = "alert" | "confirm";
type Current = { kind: Kind; message: string; resolve: (ok: boolean) => void };

type ModalApi = {
  /** 확인 버튼만 있는 알림. 닫히면 resolve 된다. */
  alert: (message: string) => Promise<void>;
  /** 확인/취소 모달. 확인이면 true. */
  confirm: (message: string) => Promise<boolean>;
};

const ModalContext = createContext<ModalApi | null>(null);

export function useModal(): ModalApi {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}

export default function ModalProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState<Current | null>(null);
  const currentRef = useRef<Current | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = useCallback(
    (kind: Kind, message: string) =>
      new Promise<boolean>((resolve) => {
        // 이미 열린 모달이 있으면 취소로 닫고 새 모달을 연다.
        currentRef.current?.resolve(false);
        const next = { kind, message, resolve };
        currentRef.current = next;
        setCurrent(next);
      }),
    [],
  );

  const api = useMemo<ModalApi>(
    () => ({
      alert: async (m) => {
        await open("alert", m);
      },
      confirm: (m) => open("confirm", m),
    }),
    [open],
  );

  // 모달이 마운트되면 showModal()로 열어 포커스 트랩/ESC/백드롭을 브라우저가 처리하게 한다.
  useEffect(() => {
    const d = dialogRef.current;
    if (current && d && !d.open) d.showModal();
  }, [current]);

  function close(ok: boolean) {
    currentRef.current?.resolve(ok);
    currentRef.current = null;
    setCurrent(null);
  }

  return (
    <ModalContext.Provider value={api}>
      {children}
      {current && (
        <dialog
          ref={dialogRef}
          className={styles.modal}
          aria-labelledby="modal-message"
          onCancel={(e) => {
            e.preventDefault(); // ESC → 취소
            close(false);
          }}
          onClick={(e) => {
            if (e.target === dialogRef.current) close(false); // 백드롭 클릭
          }}
        >
          <div className={styles.modalBody}>
            <span className={styles.modalSun} aria-hidden="true" />
            <p id="modal-message" className={styles.modalMessage}>
              {current.message}
            </p>
          </div>
          <div className={styles.modalActions}>
            {current.kind === "confirm" && (
              <button type="button" className={styles.buttonGhost} onClick={() => close(false)}>
                {t("action.cancel")}
              </button>
            )}
            <button type="button" className={styles.button} autoFocus onClick={() => close(true)}>
              {t("action.confirm")}
            </button>
          </div>
        </dialog>
      )}
    </ModalContext.Provider>
  );
}
