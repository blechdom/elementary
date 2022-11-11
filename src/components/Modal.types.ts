import React, { ReactNode } from "react";

export interface ModalProps {
  active: boolean;
  title?: string;
  showX?: boolean;
  footer?: ReactNode;
  children?: ReactNode;
  hideModal: () => void;
}
