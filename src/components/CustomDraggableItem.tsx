import React, { useRef } from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import { TextElement, ImageElement, Position } from '../types';
import { TrashIcon } from './icons/Icons';

interface CustomDraggableItemProps {
  element: TextElement | ImageElement;
  cardWidth: number;
  cardHeight: number;
  isSelected: boolean;
  onSelect: (elementId: string) => void;
  onDragStop: (elementId: string, position: Position) => void;
  onDelete: (elementId: string) => void;
  fontScale: number;
}

const CustomDraggableItem: React.FC<CustomDraggableItemProps> = ({
  element,
  cardWidth,
  cardHeight,
  isSelected,
  onSelect,
  onDragStop,
  onDelete,
  fontScale,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleStop = (e: DraggableEvent, data: DraggableData) => {
    const newXPercent = (data.x / cardWidth) * 100;
    const newYPercent = (data.y / cardHeight) * 100;
    const newPosition: Position = {
      x: Math.max(0, Math.min(100, newXPercent)), 
      y: Math.max(0, Math.min(100, newYPercent)), 
    };
    onDragStop(element.id, newPosition);
  };

  const initialPxX = (element.position.x / 100) * cardWidth;
  const initialPxY = (element.position.y / 100) * cardHeight;

  const renderContent = () => {
    if (element.type === 'text') {
      const textEl = element as TextElement;
      return (
        <div
          style={{
            fontFamily: textEl.style.fontFamily,
            fontSize: `${textEl.style.fontSize * fontScale}px`,
            color: textEl.style.color,
            textAlign: textEl.style.textAlign,
            fontWeight: textEl.style.fontWeight,
            fontStyle: textEl.style.fontStyle,
            width: '100%', 
            height: '100%',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            lineHeight: '1.2',
          }}
        >
          {textEl.text}
        </div>
      );
    }
    if (element.type === 'image') {
      const imgEl = element as ImageElement;
      return (
        <img
          src={imgEl.src}
          alt={imgEl.altText || 'Card image'}
          className="w-full h-full object-contain pointer-events-none" 
        />
      );
    }
    return null;
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      position={{ x: initialPxX, y: initialPxY }} 
      onStop={handleStop}
    >
      <div
        ref={nodeRef}
        className={`absolute cursor-grab ${isSelected ? 'ring-2 ring-indigo-500 z-10' : 'hover:ring-1 hover:ring-indigo-300'}`}
        style={{
          width: element.type === 'text' ? `${element.width}%` : `${element.size.width}%`,
          height: element.type === 'image' ? (element.size.height === 'auto' ? 'auto' : `${element.size.height}%`) : 'auto',
        }}
        onClick={(e) => {
          e.stopPropagation(); 
          onSelect(element.id);
        }}
        role="button"
        tabIndex={0}
        aria-label={`Elemento arrastrable de tipo ${element.type} ${element.type === 'text' ? (element as TextElement).text.substring(0,20) : (element as ImageElement).altText || 'imagen' }`}
      >
        {renderContent()}
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 z-20"
            title="Eliminar Elemento"
            aria-label="Eliminar elemento"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        )}
      </div>
    </Draggable>
  );
};

export default CustomDraggableItem;