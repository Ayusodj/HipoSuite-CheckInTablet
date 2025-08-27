export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type JsonObject = { [key: string]: Json | undefined };

export type JsonArray = Json[];

export enum MealPlanRegime {
  HD = 'HD', // Half Board (Breakfast & Dinner)
  MP = 'MP', // Modified Pension (Breakfast & Dinner, or as defined by hotel)
  TI = 'TI', // All Inclusive (Breakfast, Lunch, Dinner)
  BB = 'BB', // Bed & Breakfast
  RO = 'RO', // Room Only
}

export enum Alignment {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export interface Position {
  x: number; // percentage
  y: number; // percentage
}

export interface Size {
  width: number; // percentage of card width
  height: number | 'auto'; // percentage of card height, or 'auto'
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number; // px (relative to a base card size for responsiveness)
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: Alignment;
}

interface BaseElement {
  id: string;
  position: Position;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  style: TextStyle;
  width: number; // percentage of card width, for text wrapping
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string; // URL or base64
  size: Size;
  altText?: string;
}

// Specific configurations for fixed elements, set during template setup
export interface FixedElementConfig {
  fontFamily: string;
  fontSize: number; // default font size
  color: string;
  textAlign: Alignment;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
}

export interface CardTemplate {
  id: string;
  name: string;
  notes?: string;
  category?: string;
  backgroundColor: string; // Card background color
  widthPx: number; 
  heightPx: number; 
  
  guestNameConfig: {
    enabled: boolean;
    position: Position; 
    style: FixedElementConfig; 
  };
  roomNumberConfig: {
    enabled: boolean;
    position: Position; 
    style: FixedElementConfig; 
  };
  mealPlanBlockConfig: { 
    enabled: boolean;
    position: Position; 
    style: FixedElementConfig; 
    mealTimes: { 
      breakfast: string; 
      lunch: string;
      dinner: string;
    };
  };
  
  customElements: Array<TextElement | ImageElement>;
}

export interface GuestData {
  id: string;
  roomNumber: string;
  guestName: string;
  mealPlanRegime: MealPlanRegime;
}

export interface NavItemConfigData {
  id: string; // Path for items, UUID for folders
  type: 'item' | 'folder';
  label?: string; // For folders
  visible: boolean;
  children?: NavItemConfigData[];
  isOpen?: boolean;
}

export interface SidebarSettings {
    position: 'left' | 'right' | 'top' | 'bottom';
    displayMode: 'icons-and-text' | 'icons-only';
    iconSize: 'small' | 'medium' | 'large';
}

export const FONT_FAMILY_OPTIONS = [
  'Arial', 'Calibri', 'Comic Sans MS', 'Courier New', 'Georgia', 'Impact', 
  'Inter', 'Lucida Console', 'Open Sans', 'Roboto', 'Segoe UI', 'Times New Roman', 'Verdana'
].sort();


export const PREDEFINED_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Gray', value: '#808080' },
  { name: 'Red', value: '#EF4444' }, 
  { name: 'Green', value: '#22C55E' }, 
  { name: 'Blue', value: '#3B82F6' }, 
  { name: 'Indigo', value: '#6366F1' }, 
  { name: 'Gold', value: '#F59E0B' }, 
];

// A6 dimensions in mm - Updated to Landscape
export const A6_MM_WIDTH = 148; // Landscape width
export const A6_MM_HEIGHT = 105; // Landscape height

export const PIXELS_PER_MM = 3;
export const CARD_WIDTH_PX = A6_MM_WIDTH * PIXELS_PER_MM; // 148mm * 3px/mm = 444px
export const CARD_HEIGHT_PX = A6_MM_HEIGHT * PIXELS_PER_MM; // 105mm * 3px/mm = 315px

// TPV Definition - used by Visas
export interface TpvDefinition {
  id: string;
  label: string;
}

// Visas Feature Types
export interface VisasTpvListConfig {
  baresTpvs: TpvDefinition[];
  recepcionTpvs: TpvDefinition[];
}

export interface VisasFormData {
  date: string; 
  tpvValues: { [tpvId: string]: number | null }; 
  visas: number | null; 
  amex: number | null;
}

// --- Generic Department/Module Types (Used by Efectivos, formerly by Arqueo) ---
export interface DepartmentColorTheme {
  name: string;
  departmentCellClass: string;
  dataCellClass: string;
  departmentCellHex: string;
  dataCellHex: string;
}


export interface DepartmentConfig {
  id: string;
  name: string;
  colorThemeName: DepartmentColorTheme['name']; 
}

export interface DepartmentDataInput {
  arqueo: number | null;
  faltante: number | null;
  recaudacionPlus: number | null;
  recaudacionMinus: number | null;
}

export interface ModuleContextState {
  departmentsConfig: DepartmentConfig[];
  departmentValues: Record<string, DepartmentDataInput>; 
}

// Efectivos Specific Types (Uses the generic structure)
export type EfectivosColorTheme = DepartmentColorTheme;
export type EfectivosDepartmentConfig = DepartmentConfig;
export type EfectivosDepartmentDataInput = DepartmentDataInput;
export type EfectivosContextState = ModuleContextState;
export interface EfectivosPageData {
  date: string;
  departmentValues: Record<string, EfectivosDepartmentDataInput>;
}


// --- New Arqueo Feature Types (Caja Diaria & Caja Noche) ---
export interface ValeItemConfig {
  id: string;
  label: string;
}

// Updated to descending order
export const COIN_DENOMINATIONS = ["2.00", "1.00", "0.50", "0.20", "0.10", "0.05", "0.02", "0.01"] as const;
export type CoinDenomination = typeof COIN_DENOMINATIONS[number];

// Updated to descending order
export const BILLETE_DENOMINATIONS = ["500", "200", "100", "50", "20", "10", "5"] as const;
export type BilleteDenomination = typeof BILLETE_DENOMINATIONS[number];

export interface ArqueoCajaDiariaData {
  monedasQuantitiesBarra: Partial<Record<CoinDenomination, number | null>>;
  billetesQuantitiesBarra: Partial<Record<BilleteDenomination, number | null>>;
  monedasQuantitiesCajaFuerte: Partial<Record<CoinDenomination, number | null>>;
  billetesQuantitiesCajaFuerte: Partial<Record<BilleteDenomination, number | null>>;
  divisaAmount: number | null;
  divisaDiaAmount: number | null;
  valesAmounts: Record<string, number | null>; // Keyed by ValeItemConfig.id
  tarjetasAmount: number | null;
  entregadoAmount: number | null;
}

export interface ArqueoCajaNocheData {
  monedasQuantitiesNoche: Partial<Record<CoinDenomination, number | null>>;
  billetesQuantitiesNoche: Partial<Record<BilleteDenomination, number | null>>;
}

export interface ArqueoContextState {
  valesConfig: ValeItemConfig[];
  cajaDiariaData: ArqueoCajaDiariaData;
  cajaNocheData: ArqueoCajaNocheData;
}


// --- Graphic Designer Types ---

export interface DesignerCanvas {
    width: number; // in px
    height: number; // in px
    backgroundColor: string;
    zoom: number;
}

export interface BaseDesignerElement {
    id: string;
    x: number; // in px
    y: number; // in px
    width: number; // in px
    height: number; // in px
    rotation: number; // in degrees
    opacity: number; // 0 to 1
    visible: boolean;
    locked: boolean;
}

export interface TextDesignerElement extends BaseDesignerElement {
    type: 'text';
    text: string;
    fontFamily: string;
    fontSize: number; // in px
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textAlign: 'left' | 'center' | 'right';
    color: string;
}

export type ShapeType = 
    | 'rectangle' 
    | 'ellipse'
    | 'rounded-rectangle'
    | 'triangle'
    | 'diamond'
    | 'trapezoid'
    | 'polygon'
    | 'star'
    | 'double-star'
    | 'square-star'
    | 'arrow'
    | 'ring'
    | 'pie'
    | 'segment'
    | 'crescent'
    | 'gear'
    | 'cloud'
    | 'speech-bubble-rect'
    | 'speech-bubble-ellipse'
    | 'tear'
    | 'heart';


export interface ShapeDesignerElement extends BaseDesignerElement {
    type: 'shape';
    shapeType: ShapeType;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    // Optional properties for specific shapes
    borderRadius?: number; // for rounded-rectangle
    points?: number; // for star, gear, polygon
    innerRadius?: number; // for star, ring, gear
}

export interface ImageDesignerElement extends BaseDesignerElement {
    type: 'image';
    src: string; // URL or base64 data
}

export interface LineDesignerElement extends BaseDesignerElement {
    type: 'line';
    strokeColor: string;
    strokeWidth: number;
}

export interface TableCell {
    id: string;
    content: string;
}

export interface TableDesignerElement extends BaseDesignerElement {
    type: 'table';
    rows: number;
    columns: number;
    cellPadding: number;
    borderWidth: number;
    borderColor: string;
    headerBackgroundColor: string;
    evenRowBackgroundColor: string;
    oddRowBackgroundColor: string;
    fontFamily: string;
    fontSize: number;
    textColor: string;
    data: TableCell[][];
}

export type DesignerElement = TextDesignerElement | ShapeDesignerElement | ImageDesignerElement | LineDesignerElement | TableDesignerElement;

export type DesignerTool = 
    | 'select' 
    | 'text' 
    | 'image' 
    | 'line' 
    | 'eraser'
    | 'table'
    | ShapeType;

export interface DesignerState {
    canvas: DesignerCanvas;
    elements: DesignerElement[];
    selectedElementId: string | null;
    activeTool: DesignerTool;
}

export interface DesignerHistory {
    past: DesignerState[];
    present: DesignerState;
    future: DesignerState[];
}

// --- App State Types ---
export interface DiarioDayData {
    stats: { ocupPct: string; ocupPax: string; ocupHabs: string; entradas: string; salidas: string; };
    events: { id: string; group: string; when: string; where: string; what: string; }[];
    birthdays: { id:string; extra1: string; name: string; room: string; extra2: string; }[];
    roomChanges: { id: string; name: string; from: string; to: string; reason: string; status: "Pendiente" | "OK"; }[];
    dailyInfo: { id: string; content: string; }[];
    tasks: { id: string; priority: number; task: string; notifier: string; status: "Pendiente" | "OK"; }[];
    images: { id: string; src: string; }[];
}

export interface DiarioState {
    data: Record<string, DiarioDayData>; // Key is 'YYYY-MM-DD'
    sectionVisibility: {
        stats: boolean;
        events: boolean;
        birthdays: boolean;
        roomChanges: boolean;
        dailyInfo: boolean;
        tasks: boolean;
        images: boolean;
    };
}

export type ReservationData = Record<string, { roomNumber: string }>;

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parentId: string | null;
  size?: number; // in bytes
  lastModified?: string; // ISO string
  color?: string; // for color coding
  tags?: string[]; // for tagging
  contentIds?: string[]; // For zip files
  url?: string; // for file previews
  storagePath?: string; // Path in Supabase Storage
  storageType?: 'local' | 'cloud';
}

export interface StorageItem {
    name: string;
    type: 'file' | 'folder';
    fullPath: string;
    size?: number;
    updated?: string;
    color?: string;
    tags?: string[];
    isCheckedOut?: boolean;
}