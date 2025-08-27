
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { CardTemplate, TextElement, ImageElement, Position, Alignment, FixedElementConfig } from '../types';
import CustomDraggableItem from './CustomDraggableItem';

// Helper to parse hex color string (e.g., #RGB, #RRGGBB) to an [r, g, b] array
const hexToRgb = (hex: string): [number, number, number] | null => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return null;
  let normalizedHex = hex;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  normalizedHex = normalizedHex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizedHex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
};

// Calculates luminance for a given RGB color component (0-255)
const getsRGB = (c: number): number => {
  c = c / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

// Calculates relative luminance for an [r, g, b] color array
const getRelativeLuminance = (rgb: [number, number, number] | null): number => {
  if (!rgb) return 0; // Default to dark if color is invalid
  const R = getsRGB(rgb[0]);
  const G = getsRGB(rgb[1]);
  const B = getsRGB(rgb[2]);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

// Calculates contrast ratio between two [r, g, b] colors
const getContrastRatio = (rgb1: [number, number, number] | null, rgb2: [number, number, number] | null): number => {
  if (!rgb1 || !rgb2) return 1; // Minimum contrast if any color is invalid
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

const MIN_CONTRAST_RATIO_PLACEHOLDER = 3.0; // Minimum contrast for placeholder text for readability

const getAdjustedColorForPlaceholder = (
    configuredColorHex: string, 
    bgColorHex: string, 
    lightAlternativeHex: string = '#E5E7EB', 
    darkAlternativeHex: string = '#333333'
  ): string => {
  const configuredColorRgb = hexToRgb(configuredColorHex);
  const bgColorRgb = hexToRgb(bgColorHex);

  if (!configuredColorRgb || !bgColorRgb) {
    return configuredColorHex; // If colors are not valid hex, return original
  }

  const currentContrast = getContrastRatio(configuredColorRgb, bgColorRgb);

  if (currentContrast < MIN_CONTRAST_RATIO_PLACEHOLDER) {
    const lightAltRgb = hexToRgb(lightAlternativeHex);
    const darkAltRgb = hexToRgb(darkAlternativeHex);

    if (!lightAltRgb || !darkAltRgb) return configuredColorHex; // Should not happen with defaults

    const contrastWithLightAlt = getContrastRatio(lightAltRgb, bgColorRgb);
    const contrastWithDarkAlt = getContrastRatio(darkAltRgb, bgColorRgb);
    
    // Choose the alternative that provides better contrast.
    // If both alternatives provide sufficient contrast, prefer the one closer to original text's lightness.
    const configuredIsLight = getRelativeLuminance(configuredColorRgb) >= 0.5;

    if (contrastWithLightAlt >= MIN_CONTRAST_RATIO_PLACEHOLDER && contrastWithDarkAlt >= MIN_CONTRAST_RATIO_PLACEHOLDER) {
        return configuredIsLight ? lightAlternativeHex : darkAlternativeHex; // Pick based on original lightness
    } else if (contrastWithLightAlt >= MIN_CONTRAST_RATIO_PLACEHOLDER) {
        return lightAlternativeHex;
    } else if (contrastWithDarkAlt >= MIN_CONTRAST_RATIO_PLACEHOLDER) {
        return darkAlternativeHex;
    }
    // If neither alternative helps much, fallback to a high contrast option based on background
    return getRelativeLuminance(bgColorRgb) < 0.5 ? lightAlternativeHex : darkAlternativeHex;
  }
  return configuredColorHex; // Original color has sufficient contrast
};

interface DesignCanvasProps {
  template: CardTemplate;
  onUpdateTemplate: (updatedProps: Partial<CardTemplate>) => void;
  onUpdateElement: (updatedElement: TextElement | ImageElement) => void;
  onDeleteElement: (elementId: string) => void;
  selectedElementId: string | null;
  onSelectElement: (elementId: string | null) => void;
}

const FONT_SCALE_FACTOR = 0.75; // Visually scale fonts down in the editor

const DesignCanvas: React.FC<DesignCanvasProps> = ({ template, onUpdateTemplate, onUpdateElement, onDeleteElement, selectedElementId, onSelectElement }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const guestNameRef = useRef<HTMLDivElement>(null);
  const roomNumberRef = useRef<HTMLDivElement>(null);
  const mealPlanBlockRef = useRef<HTMLDivElement>(null);
  const prevCustomElementsRef = useRef<Array<TextElement | ImageElement>>(template.customElements);

  const [guestNameWidth, setGuestNameWidth] = useState(0);
  const [roomNumberWidth, setRoomNumberWidth] = useState(0);
  const [mealPlanWidth, setMealPlanWidth] = useState(0);

  const darkBlueColor = '#1E3A8A';
  const lightGrayColor = '#AAAAAA';
  const midGrayColor = '#CCCCCC';

  const cardWidth = template.widthPx;
  const cardHeight = template.heightPx;

  // Determine the background color for the canvas display. If template.backgroundColor is transparent or invalid, use white.
  const canvasDisplayBackgroundColor = template.backgroundColor && hexToRgb(template.backgroundColor)
    ? template.backgroundColor
    : '#FFFFFF';


  useLayoutEffect(() => {
    if (guestNameRef.current && guestNameRef.current.offsetWidth !== guestNameWidth) {
        setGuestNameWidth(guestNameRef.current.offsetWidth);
    }
    if (roomNumberRef.current && roomNumberRef.current.offsetWidth !== roomNumberWidth) {
        setRoomNumberWidth(roomNumberRef.current.offsetWidth);
    }
    if (mealPlanBlockRef.current && mealPlanBlockRef.current.offsetWidth !== mealPlanWidth) {
        setMealPlanWidth(mealPlanBlockRef.current.offsetWidth);
    }
  }, [
      template.guestNameConfig.style,
      template.roomNumberConfig.style,
      template.mealPlanBlockConfig.style,
      template.mealPlanBlockConfig.mealTimes,
      guestNameWidth,
      roomNumberWidth,
      mealPlanWidth
  ]);

  useEffect(() => {
    if (template.customElements.length > prevCustomElementsRef.current.length) {
      const newElements = template.customElements.filter(
        (el) => !prevCustomElementsRef.current.find(prevEl => prevEl.id === el.id)
      );
      if (newElements.length > 0) {
        onSelectElement(newElements[newElements.length - 1].id);
      }
    } else if (template.customElements.length < prevCustomElementsRef.current.length) {
      if (selectedElementId && !template.customElements.find(el => el.id === selectedElementId)) {
        onSelectElement(null);
      }
    }
    prevCustomElementsRef.current = template.customElements;
  }, [template.customElements, selectedElementId, onSelectElement]);

  const handleFixedElementDragStop = (e: DraggableEvent, data: DraggableData, configName: 'guestNameConfig' | 'roomNumberConfig') => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const effectiveCanvasHeight = canvasRect.height || cardHeight;
    
    // Only update Y position, X is fixed.
    const y = (data.y / effectiveCanvasHeight) * 100;
    
    const currentConfig = template[configName];
    // Keep X position fixed at 25%, only update Y.
    const newPosition: Position = { x: 25, y: Math.max(0, Math.min(100, y)) };

    onUpdateTemplate({ [configName]: { ...currentConfig, position: newPosition } });
  };

  const handleMealPlanDragStop = (e: DraggableEvent, data: DraggableData) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const effectiveCanvasWidth = canvasRect.width || cardWidth;
    const effectiveCanvasHeight = canvasRect.height || cardHeight;
    const mealPlanWidthPx = mealPlanWidth || mealPlanBlockRef.current?.offsetWidth || 0;
    const x = ((data.x + mealPlanWidthPx / 2) / effectiveCanvasWidth) * 100;
    const y = (data.y / effectiveCanvasHeight) * 100;
    const newPosition: Position = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    onUpdateTemplate({ mealPlanBlockConfig: { ...template.mealPlanBlockConfig, position: newPosition } });
  };
  
  const handleCustomElementDragStop = (elementId: string, position: Position) => {
    const element = template.customElements.find(el => el.id === elementId);
    if (element) {
      onUpdateElement({ ...element, position });
    }
  };

  const placeholderGuestNameColor = getAdjustedColorForPlaceholder(template.guestNameConfig.style.color, canvasDisplayBackgroundColor);
  const placeholderRoomNumberColor = getAdjustedColorForPlaceholder(template.roomNumberConfig.style.color, canvasDisplayBackgroundColor);
  const placeholderMealPlanColor = getAdjustedColorForPlaceholder(template.mealPlanBlockConfig.style.color, canvasDisplayBackgroundColor);

  const getMealPlanPlaceholder = (): string[] => {
    const lines: string[] = [];
    const { mealTimes } = template.mealPlanBlockConfig;
    if(mealTimes.breakfast) lines.push(mealTimes.breakfast);
    if(mealTimes.lunch) lines.push(mealTimes.lunch);
    if(mealTimes.dinner) lines.push(mealTimes.dinner);
    return lines.length > 0 ? lines : ["Meal Plan Details"];
  };

  const mealPlanLines = getMealPlanPlaceholder();

  const placeholderBaseStyle = {
    whiteSpace: 'nowrap',
  } as React.CSSProperties;

  return (
    <div
      ref={canvasRef}
      className="relative shadow-lg overflow-hidden"
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        backgroundColor: canvasDisplayBackgroundColor,
      }}
      onClick={() => onSelectElement(null)}
    >
      {/* Decorative Elements */}
      <>
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '25%',
          transform: 'translateX(-50%)',
          fontFamily: 'Inter',
          fontSize: `10px`,
          color: darkBlueColor,
          pointerEvents: 'none', userSelect: 'none'
          }}>
          Room No.
        </div>
        <div style={{
          position: 'absolute',
          top: '24%',
          left: '14.2%',
          width: '21.6%',
          height: `1px`,
          backgroundColor: lightGrayColor,
          opacity: 0.7,
          pointerEvents: 'none', userSelect: 'none'
          }} />
        <div style={{
          position: 'absolute',
          top: '43.5%',
          left: '25%',
          transform: 'translateX(-50%)',
          fontFamily: 'Inter',
          fontSize: `16px`,
          color: darkBlueColor,
          pointerEvents: 'none', userSelect: 'none'
          }}>
          Have a nice day
        </div>
        <div style={{
          position: 'absolute',
          top: '84%',
          left: '25%',
          transform: 'translateX(-50%)',
          fontFamily: 'Inter',
          fontSize: `10px`,
          color: darkBlueColor,
          pointerEvents: 'none', userSelect: 'none'
          }}>
          hipotels.com - We Care
        </div>
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '0%',
          transform: 'translateX(-50%)',
          width: `1px`,
          height: '100%',
          backgroundColor: midGrayColor,
          opacity: 0.5,
          pointerEvents: 'none', userSelect: 'none'
          }} />
      </>


      {/* Draggable Room Number Placeholder */}
      {template.roomNumberConfig.enabled && (
        <Draggable
          nodeRef={roomNumberRef}
          axis="y"
          bounds="parent"
          position={{ 
            x: (0.25 * cardWidth) - (roomNumberWidth / 2),
            y: (template.roomNumberConfig.position.y / 100) * cardHeight 
          }}
          onStop={(e, data) => handleFixedElementDragStop(e, data, 'roomNumberConfig')}
        >
          <div ref={roomNumberRef} className="absolute cursor-ns-resize" style={{ zIndex: 15 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ 
                color: placeholderRoomNumberColor,
                ...placeholderBaseStyle, 
                fontFamily: template.roomNumberConfig.style.fontFamily, 
                fontSize: `${template.roomNumberConfig.style.fontSize * FONT_SCALE_FACTOR}px`,
                fontWeight: template.roomNumberConfig.style.fontWeight,
              }}>
                1234
              </span>
            </div>
          </div>
        </Draggable>
      )}

      {/* Draggable Guest Name Placeholder */}
      {template.guestNameConfig.enabled && (
        <Draggable
          nodeRef={guestNameRef}
          axis="y"
          bounds="parent"
          position={{ 
            x: (0.25 * cardWidth) - (guestNameWidth / 2),
            y: (template.guestNameConfig.position.y / 100) * cardHeight 
          }}
          onStop={(e, data) => handleFixedElementDragStop(e, data, 'guestNameConfig')}
        >
          <div ref={guestNameRef} className="absolute cursor-ns-resize" style={{ zIndex: 15 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ 
                color: placeholderGuestNameColor,
                ...placeholderBaseStyle, 
                fontFamily: template.guestNameConfig.style.fontFamily, 
                fontSize: `${template.guestNameConfig.style.fontSize * FONT_SCALE_FACTOR}px`,
                fontWeight: template.guestNameConfig.style.fontWeight,
              }}>
                Nombre del Huésped
              </span>
            </div>
          </div>
        </Draggable>
      )}

      {/* Draggable Meal Plan Block */}
      {template.mealPlanBlockConfig.enabled && (
        <Draggable
          nodeRef={mealPlanBlockRef}
          bounds="parent"
          position={{
            x: ((template.mealPlanBlockConfig.position.x / 100) * cardWidth) - (mealPlanWidth / 2),
            y: (template.mealPlanBlockConfig.position.y / 100) * cardHeight,
          }}
          onStop={handleMealPlanDragStop}
        >
          <div ref={mealPlanBlockRef} className="absolute cursor-move" style={{ zIndex: 15 }}>
            <div>
              <div style={{
                color: placeholderMealPlanColor,
                fontFamily: template.mealPlanBlockConfig.style.fontFamily,
                fontSize: `${template.mealPlanBlockConfig.style.fontSize * FONT_SCALE_FACTOR}px`,
                fontWeight: template.mealPlanBlockConfig.style.fontWeight,
                textAlign: template.mealPlanBlockConfig.style.textAlign,
                lineHeight: '1.4'
              }}>
                {mealPlanLines.map((line, index) => <div key={index}>{line}</div>)}
              </div>
            </div>
          </div>
        </Draggable>
      )}

      {/* Render Custom Draggable Elements */}
      {template.customElements.map(element => (
        <CustomDraggableItem
          key={element.id}
          element={element}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          isSelected={selectedElementId === element.id}
          onSelect={onSelectElement}
          onDragStop={handleCustomElementDragStop}
          onDelete={onDeleteElement}
          fontScale={FONT_SCALE_FACTOR}
        />
      ))}
    </div>
  );
};

export default DesignCanvas;
