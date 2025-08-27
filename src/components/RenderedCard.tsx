
import React from 'react';
import { CardTemplate, GuestData, TextElement, ImageElement, MealPlanRegime, Position, TextStyle, FixedElementConfig, Alignment } from '../types';

interface RenderedCardProps {
  template: CardTemplate;
  guest?: GuestData;
  isSelected?: boolean; // For UI feedback, e.g. in print selection
  cardScale?: number; // To scale the card for display (e.g., in previews)
  renderCardShell?: boolean; // New prop to control card's visual shell (background, shadow)
  hideDecorativeElements?: boolean; // If true, static decorative elements are hidden
}

const applyScaleToTextStyle = (style: TextStyle | FixedElementConfig, scale: number): TextStyle => ({
  fontFamily: style.fontFamily,
  fontSize: style.fontSize * scale,
  color: style.color,
  fontWeight: style.fontWeight,
  fontStyle: style.fontStyle,
  textAlign: style.textAlign,
});

const RenderedCard: React.FC<RenderedCardProps> = ({
    template,
    guest,
    isSelected,
    cardScale = 1,
    renderCardShell = true,
    hideDecorativeElements = false, // Default to false (show elements)
}) => {
  const cardWidth = template.widthPx * cardScale;
  const cardHeight = template.heightPx * cardScale;

  const getMealPlanText = (): string[] => {
    if (!template.mealPlanBlockConfig.enabled) return [];

    const lines: string[] = [];
    const { mealTimes } = template.mealPlanBlockConfig;

    if (guest) { // Actual guest data
        switch (guest.mealPlanRegime) {
        case MealPlanRegime.TI:
            if(mealTimes.breakfast) lines.push(mealTimes.breakfast);
            if(mealTimes.lunch) lines.push(mealTimes.lunch);
            if(mealTimes.dinner) lines.push(mealTimes.dinner);
            break;
        case MealPlanRegime.HD:
        case MealPlanRegime.MP:
            if(mealTimes.breakfast) lines.push(mealTimes.breakfast);
            if(mealTimes.dinner) lines.push(mealTimes.dinner);
            break;
        case MealPlanRegime.BB:
            if(mealTimes.breakfast) lines.push(mealTimes.breakfast);
            break;
        case MealPlanRegime.RO:
        default:
            break;
        }
    } else { // Placeholder meal plan text
        if(mealTimes.breakfast) lines.push(mealTimes.breakfast || "Desayuno: HH:MM - HH:MM");
        if(mealTimes.lunch) lines.push(mealTimes.lunch || "Almuerzo: HH:MM - HH:MM");
        if(mealTimes.dinner) lines.push(mealTimes.dinner || "Cena: HH:MM - HH:MM");
        if (lines.length === 0 && template.mealPlanBlockConfig.enabled) { // Ensure some placeholder if enabled but no times
            lines.push("Detalles del Plan de Comidas");
        }
    }
    return lines;
  };

  const renderElement = (element: TextElement | ImageElement) => {
    const scaledStyle = element.type === 'text' ? applyScaleToTextStyle(element.style, cardScale) : undefined;

    if (element.type === 'text') {
      const textEl = element as TextElement;
      return (
        <div
          key={element.id}
          className="absolute"
          style={{
            left: `${textEl.position.x}%`,
            top: `${textEl.position.y}%`,
            width: `${textEl.width}%`,
            fontFamily: scaledStyle!.fontFamily,
            fontSize: `${scaledStyle!.fontSize}px`,
            color: scaledStyle!.color,
            textAlign: scaledStyle!.textAlign,
            fontWeight: scaledStyle!.fontWeight,
            fontStyle: scaledStyle!.fontStyle,
            lineHeight: '1.2',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
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
          key={element.id}
          src={imgEl.src}
          alt={imgEl.altText || 'Card image'}
          className="absolute object-contain"
          style={{
            left: `${imgEl.position.x}%`,
            top: `${imgEl.position.y}%`,
            width: `${imgEl.size.width}%`,
            height: imgEl.size.height === 'auto' ? 'auto' : `${imgEl.size.height}%`,
          }}
        />
      );
    }
    return null;
  };

  const mealPlanLines = getMealPlanText();

  const guestNameStyle = applyScaleToTextStyle(template.guestNameConfig.style, cardScale);
  const roomNumberStyle = applyScaleToTextStyle(template.roomNumberConfig.style, cardScale);
  const mealPlanStyle = applyScaleToTextStyle(template.mealPlanBlockConfig.style, cardScale);

  const cardStyle: React.CSSProperties = {
    width: `${cardWidth}px`,
    height: `${cardHeight}px`,
    backgroundColor: renderCardShell ? template.backgroundColor : 'transparent',
  };

  const createFixedElementStyle = (config: { position: Position, style: FixedElementConfig }, dynamicStyle: TextStyle, isFixedPosition = false): React.CSSProperties => {
    const style: React.CSSProperties = {
        left: isFixedPosition ? '25%' : `${config.position.x}%`,
        top: `${config.position.y}%`,
        fontFamily: dynamicStyle.fontFamily,
        fontSize: `${dynamicStyle.fontSize}px`,
        color: dynamicStyle.color,
        textAlign: dynamicStyle.textAlign,
        fontWeight: dynamicStyle.fontWeight,
        fontStyle: dynamicStyle.fontStyle,
        width: 'auto',
        whiteSpace: 'nowrap',
    };
    if (dynamicStyle.textAlign === Alignment.Center) {
        style.transform = 'translateX(-50%)';
    }
    return style;
  };

  const darkBlueColor = '#1E3A8A';
  const lightGrayColor = '#AAAAAA';
  const midGrayColor = '#CCCCCC';

  return (
    <div
      className={`rendered-card-wrapper relative ${renderCardShell ? 'overflow-hidden' : ''} ${isSelected && renderCardShell ? 'ring-2 ring-indigo-500' : ''}`}
      style={cardStyle}
    >
      {/* Static Decorative Elements - Conditionally Rendered */}
      {!hideDecorativeElements && (
        <>
          <div style={{
            position: 'absolute',
            top: '8%',
            left: '25%',
            transform: 'translateX(-50%)',
            fontFamily: 'Inter',
            fontSize: `${10 * cardScale}px`,
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
            height: `${1 * cardScale}px`,
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
            fontSize: `${16 * cardScale}px`,
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
            fontSize: `${10 * cardScale}px`,
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
            width: `${1 * cardScale}px`,
            height: '100%',
            backgroundColor: midGrayColor,
            opacity: 0.5,
            pointerEvents: 'none', userSelect: 'none'
            }} />
        </>
      )}

      {/* Render Fixed Guest Name: Actual or Placeholder */}
      {template.guestNameConfig.enabled && (
        <div
          className="absolute"
          style={createFixedElementStyle(template.guestNameConfig, guestNameStyle, true)}
        >
          {guest ? guest.guestName : "Nombre del Huésped"}
        </div>
      )}

      {/* Render Fixed Room Number: Actual or Placeholder */}
      {template.roomNumberConfig.enabled && (
        <div
          className="absolute"
          style={createFixedElementStyle(template.roomNumberConfig, roomNumberStyle, true)}
        >
          {guest ? guest.roomNumber : "1234"}
        </div>
      )}

      {/* Render Meal Plan Block */}
      {template.mealPlanBlockConfig.enabled && mealPlanLines.length > 0 && (
         <div
          className="absolute"
          style={{
            left: `${template.mealPlanBlockConfig.position.x}%`,
            top: `${template.mealPlanBlockConfig.position.y}%`,
            fontFamily: mealPlanStyle.fontFamily,
            fontSize: `${mealPlanStyle.fontSize}px`,
            color: mealPlanStyle.color,
            textAlign: mealPlanStyle.textAlign,
            fontWeight: mealPlanStyle.fontWeight,
            fontStyle: mealPlanStyle.fontStyle,
            lineHeight: '1.4',
            ...(mealPlanStyle.textAlign === Alignment.Center && { transform: 'translateX(-50%)' }),
          }}
        >
          {mealPlanLines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}

      {/* Render Custom Elements */}
      {template.customElements.map(renderElement)}
    </div>
  );
};

export default RenderedCard;
