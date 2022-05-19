import React, { useCallback, useRef } from "react";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import ScreenModal from './ScreenModal';

const Component = (props: any) => {
  const imgRef = useRef<any>();

  const onUpdate = useCallback(({ x, y, scale }) => {
    const { current: img } = imgRef;

    if (img) {
      const value = make3dTransformValue({ x, y, scale });

      img.style.setProperty("transform", value);
    }
  }, []);

  return <ScreenModal {...props}>
    <div className="image-modal-container">
      <QuickPinchZoom containerProps={{ style: { height: '100%', width: '100%' } }} onUpdate={onUpdate}>
        <div ref={imgRef} className="image" style={{ backgroundImage: `url('${props.imageSrc}')` }} />
      </QuickPinchZoom>
    </div>
  </ScreenModal>
}

export default Component;
