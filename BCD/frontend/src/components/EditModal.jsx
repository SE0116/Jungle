import React, { useState, useEffect } from 'react';

function EditModal({ isOpen, leftPageText, rightPageText, onSave, onCancel }) {
  const [leftText, setLeftText] = useState(leftPageText);
  const [rightText, setRightText] = useState(rightPageText);

  // isOpen이 변경될 때마다 실행되어, 모달이 열릴 때마다 텍스트를 초기화합니다.
  useEffect(() => {
    setLeftText(leftPageText);
    setRightText(rightPageText);
  }, [isOpen, leftPageText, rightPageText]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(leftText, rightText);
  };

  return (
    <div className="modal">
      <textarea value={leftText} onChange={(e) => setLeftText(e.target.value)} />
      <textarea value={rightText} onChange={(e) => setRightText(e.target.value)} />
      <button onClick={handleSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}

export default EditModal;
