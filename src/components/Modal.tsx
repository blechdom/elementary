import React, { FC } from "react";
import styled from "styled-components";
import { ModalProps } from "./Modal.types";

export const Modal: FC<ModalProps> = ({
  active = true,
  title,
  showX = true,
  footer,
  children,
  hideModal,
}: ModalProps) => {
  return (
    <>
      {active && (
        <ModalBlock>
          <ModalOverlay onClick={() => hideModal()}></ModalOverlay>
          <ModalContainer>
            {(title || showX) && (
              <ModalHeader>
                {title && <ModalTitle>{title}</ModalTitle>}
                {showX && (
                  <ModalClose onClick={() => hideModal()}>X</ModalClose>
                )}
              </ModalHeader>
            )}
            {children && <ModalBody>{children}</ModalBody>}
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </ModalContainer>
        </ModalBlock>
      )}
    </>
  );
};

export const ModalBlock = styled.div`
  align-items: center;
  bottom: 0;
  justify-content: center;
  left: 0;
  overflow: hidden;
  padding: 1.5rem;
  position: fixed;
  right: 0;
  top: 0;
  display: flex;
  opacity: 1;
  z-index: 400;
`;

export const ModalOverlay = styled.a`
  background: rgba(247, 248, 249, 0.75);
  bottom: 0;
  cursor: default;
  display: block;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`;

export const ModalClose = styled.a`
  float: right !important;
  text-decoration: none !important;
  cursor: pointer;
  font-size: 1rem;
`;

export const ModalContainer = styled.div`
  font-family: "Roboto Condensed", sans-serif;
  background: #ffffff;
  border-radius: 0.1rem;
  display: flex;
  flex-direction: column;
  max-height: 75vh;
  max-width: 850px;
  padding: 0 0.8rem;
  width: 100%;
  animation: slide-down 0.2s ease 1;
  z-index: 1;
  box-shadow: 0 0.2rem 0.5rem rgba(48, 55, 66, 0.3);
`;

export const ModalBody = styled.div`
  overflow-y: auto;
  padding: 30px 10px;
  position: relative;
`;

export const ModalHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: #303742;
  padding: 20px 5px 10px 5px;
`;

export const ModalTitle = styled.span`
  font-size: 30px;
  font-weight: 500;
`;

export const ModalFooter = styled.div`
  padding: 10px 0px;
  text-align: right;
`;
