import React from 'react';
import { SemiTransparentOverlay } from './overlay';
import { SecondaryButton, LoadingButton } from './buttons';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonColor?: 'danger' | 'primary';
  isLoading?: boolean;
}

/**
 * 确认对话框组件
 * 用于需要用户确认的操作，例如删除、提交等
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  content,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmButtonColor = 'primary',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // 阻止点击对话框内部时关闭对话框
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <SemiTransparentOverlay onClick={onCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div 
          className="bg-white rounded-lg shadow-lg w-96 max-w-md p-6"
          onClick={handleDialogClick}
        >
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{content}</p>
          
          <div className="flex justify-end space-x-3">
            <SecondaryButton onClick={onCancel} disabled={isLoading}>
              {cancelText}
            </SecondaryButton>
            <LoadingButton 
              onClick={onConfirm}
              isLoading={isLoading}
              className={confirmButtonColor === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {confirmText}
            </LoadingButton>
          </div>
        </div>
      </div>
    </>
  );
}; 