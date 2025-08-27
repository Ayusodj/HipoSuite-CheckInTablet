
import { CardTemplate, Alignment, CARD_WIDTH_PX, CARD_HEIGHT_PX, MealPlanRegime, GuestData } from './types';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_FONTS = ['Arial', 'Verdana', 'Times New Roman', 'Georgia', 'Inter', 'Roboto'];
export const DEFAULT_FONT_SIZES = [10, 12, 14, 16, 18, 24, 32, 48]; // in px relative to card
export const DEFAULT_COLORS = ['#000000', '#FFFFFF', '#EF4444', '#22C55E', '#3B82F6', '#F59E0B', '#6366F1'];

// Positions are based on percentages of card width/height.

export const INITIAL_TEMPLATES: CardTemplate[] = []; // No example templates

export const DEFAULT_TEMPLATE_DATA: Omit<CardTemplate, 'id' | 'widthPx' | 'heightPx'> = {
  name: 'Nueva Plantilla Vertical',
  backgroundColor: '#FFFFFF', // Default to white
  category: '',
  guestNameConfig: {
    enabled: true,
    position: { x: 25, y: 23 },
    style: { fontFamily: 'Inter', fontSize: 14, color: '#000000', textAlign: Alignment.Center, fontWeight: 'bold', fontStyle: 'normal' }, 
  },
  roomNumberConfig: {
    enabled: true,
    position: { x: 25, y: 15 },
    style: { fontFamily: 'Inter', fontSize: 14, color: '#000000', textAlign: Alignment.Center, fontWeight: 'bold', fontStyle: 'normal' }, 
  },
  mealPlanBlockConfig: { 
    enabled: true,
    position: { x: 25, y: 27 }, 
    style: { fontFamily: 'Inter', fontSize: 12, color: '#000000', textAlign: Alignment.Center, fontWeight: 'bold', fontStyle: 'normal' }, 
    mealTimes: { breakfast: "08:00 - 10:30", lunch: "13:00 - 14:30", dinner: "18:30 - 21:00" },
  },
  customElements: [
  ],
};

export const INITIAL_GUESTS: GuestData[] = [];