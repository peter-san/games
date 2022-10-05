import React from "react";
import cl from "./Modal.module.scss";

export const Modal = ({ children, visible, setVisible }: any) => {
  const rootClasses = ["modal", cl.modal]

  if (visible) {
    rootClasses.push(cl.active)
  }

  return (
    <div className={rootClasses.join(" ")} onClick={() => setVisible(false)}>
      <div className={cl.content} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
