/**
 * Dynamic UI Element Registry Scanner
 * Auto-scan engine/ui folder and extract element definitions
 */

// Manually list elements (since we can't scan filesystem from browser)
// This maps to actual element files in engine/ui/
const UI_ELEMENTS_LIST = [
  'Label',
  'Button', 
  'ImageView',
  'ImageButton',
  'Panel',
  'Popup',
  'Dialog',
  'Slider',
  'Toggle',
  'ProgressBar',
  'Icon',
  'ToggleImage',
  'DragArea',
  'DropArea'
];

// Element definitions with properties
const UI_ELEMENT_REGISTRY = {
  Label: {
    name: 'Label',
    category: 'Text',
    icon: '📝',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 200,
      height: 50,
      text: 'Label',
      font: '24px sans-serif',
      color: '#e5e7eb',
      align: 'left'
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'text', type: 'text', label: 'Text', maxLength: 100 },
      { name: 'font', type: 'text', label: 'Font', placeholder: '24px sans-serif' },
      { name: 'color', type: 'color', label: 'Color' },
      { name: 'align', type: 'select', label: 'Text Align', options: ['left', 'center', 'right'] }
    ]
  },

  Button: {
    name: 'Button',
    category: 'Interactive',
    icon: '🔘',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 160,
      height: 50,
      label: 'Button',
      color: '#3b82f6',
      hoverColor: '#2563eb',
      textColor: '#ffffff',
      font: '24px sans-serif'
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'label', type: 'text', label: 'Label', maxLength: 50 },
      { name: 'color', type: 'color', label: 'Color' },
      { name: 'hoverColor', type: 'color', label: 'Hover Color' },
      { name: 'textColor', type: 'color', label: 'Text Color' },
      { name: 'font', type: 'text', label: 'Font', placeholder: '24px sans-serif' }
    ]
  },

  ImageView: {
    name: 'ImageView',
    category: 'Image',
    icon: '🖼️',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 200,
      height: 200,
      source: null,
      opacity: 1
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'source', type: 'asset-select', label: 'Image Asset' },
      { name: 'opacity', type: 'number', label: 'Opacity', min: 0, max: 1, step: 0.1 }
    ]
  },

  ImageButton: {
    name: 'ImageButton',
    category: 'Interactive',
    icon: '🎯',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 100,
      height: 100,
      source: null,
      opacity: 1
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'source', type: 'asset-select', label: 'Image Asset' },
      { name: 'opacity', type: 'number', label: 'Opacity', min: 0, max: 1, step: 0.1 }
    ]
  },

  Panel: {
    name: 'Panel',
    category: 'Container',
    icon: '📦',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 300,
      height: 200,
      color: 'rgba(20,20,30,0.92)',
      radius: 16,
      stroke: '#475569'
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'color', type: 'color', label: 'Background Color' },
      { name: 'radius', type: 'number', label: 'Border Radius', min: 0, max: 50, step: 1 },
      { name: 'stroke', type: 'color', label: 'Border Color' }
    ]
  },

  Slider: {
    name: 'Slider',
    category: 'Interactive',
    icon: '🎚️',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 300,
      height: 40,
      value: 0.5
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'value', type: 'number', label: 'Value', min: 0, max: 1, step: 0.1 }
    ]
  },

  Toggle: {
    name: 'Toggle',
    category: 'Interactive',
    icon: '🔘',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 80,
      height: 40,
      value: false
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'value', type: 'checkbox', label: 'Enabled' }
    ]
  },

  ProgressBar: {
    name: 'ProgressBar',
    category: 'Display',
    icon: '📊',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 300,
      height: 20,
      value: 0.5
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'value', type: 'number', label: 'Progress', min: 0, max: 1, step: 0.1 }
    ]
  },

  Icon: {
    name: 'Icon',
    category: 'Display',
    icon: '⭐',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 64,
      height: 64
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] }
    ]
  },

  ToggleImage: {
    name: 'ToggleImage',
    category: 'Interactive',
    icon: '🖼️',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 100,
      height: 100,
      keyOn: null,
      keyOff: null,
      value: false,
      opacity: 1
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'keyOn', type: 'asset-select', label: 'Image ON' },
      { name: 'keyOff', type: 'asset-select', label: 'Image OFF' },
      { name: 'value', type: 'checkbox', label: 'Toggle State (preview ON/OFF)' },
      { name: 'opacity', type: 'number', label: 'Opacity', min: 0, max: 1, step: 0.1 }
    ]
  },

  Popup: {
    name: 'Popup',
    category: 'Container',
    icon: '💬',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'center',
      anchorY: 'center',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 400,
      height: 300,
      color: 'rgba(20,20,30,0.95)',
      radius: 16,
      stroke: '#475569',
      title: 'Popup Title'
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'color', type: 'color', label: 'Background Color' },
      { name: 'radius', type: 'number', label: 'Border Radius', min: 0, max: 50, step: 1 },
      { name: 'stroke', type: 'color', label: 'Border Color' },
      { name: 'title', type: 'text', label: 'Title', maxLength: 50 }
    ]
  },

  Dialog: {
    name: 'Dialog',
    category: 'Container',
    icon: '🗨️',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'center',
      anchorY: 'center',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 450,
      height: 350,
      color: 'rgba(15,23,42,0.98)',
      radius: 20,
      stroke: '#475569',
      title: 'Dialog Title'
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'color', type: 'color', label: 'Background Color' },
      { name: 'radius', type: 'number', label: 'Border Radius', min: 0, max: 50, step: 1 },
      { name: 'stroke', type: 'color', label: 'Border Color' },
      { name: 'title', type: 'text', label: 'Title', maxLength: 50 }
    ]
  },

  DragArea: {
    name: 'DragArea',
    category: 'Interactive',
    icon: '🎯',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 200,
      height: 200,
      color: 'rgba(59,130,246,0.95)',
      radius: 16,
      stroke: '#f8fafc',
      label: '',
      textColor: '#f8fafc',
      font: '24px sans-serif',
      source: null
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'color', type: 'color', label: 'Background Color' },
      { name: 'radius', type: 'number', label: 'Border Radius', min: 0, max: 50, step: 1 },
      { name: 'stroke', type: 'color', label: 'Border Color' },
      { name: 'label', type: 'text', label: 'Label', maxLength: 50 },
      { name: 'textColor', type: 'color', label: 'Text Color' },
      { name: 'font', type: 'text', label: 'Font', placeholder: '24px sans-serif' },
      { name: 'source', type: 'asset-select', label: 'Background Image' }
    ]
  },

  DropArea: {
    name: 'DropArea',
    category: 'Interactive',
    icon: '📮',
    defaultProps: {
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      rotate: 0,
      pivotX: 0.5,
      pivotY: 0.5,
      width: 200,
      height: 200,
      color: 'rgba(15,23,42,0.85)',
      radius: 24,
      stroke: '#94a3b8',
      label: '',
      textColor: '#f8fafc',
      font: '24px sans-serif',
      source: null
    },
    properties: [
      { name: 'x', type: 'number', label: 'X Position', min: -1280, max: 1280, step: 10 },
      { name: 'y', type: 'number', label: 'Y Position', min: -720, max: 720, step: 10 },
      { name: 'width', type: 'number', label: 'Width', min: 0, max: 640, step: 10 },
      { name: 'height', type: 'number', label: 'Height', min: 0, max: 360, step: 10 },
      { name: 'anchorX', type: 'select', label: 'Anchor X', options: ['left', 'center', 'right'] },
      { name: 'anchorY', type: 'select', label: 'Anchor Y', options: ['top', 'center', 'bottom'] },
      { name: 'rotate', type: 'number', label: 'Rotate (°)', min: -360, max: 360, step: 1 },
      { name: 'pivotX', type: 'number', label: 'Pivot X (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'pivotY', type: 'number', label: 'Pivot Y (0-1)', min: 0, max: 1, step: 0.05 },
      { name: 'rotateOrigin', type: 'select', label: 'Rotate Origin', options: ['center','top','bottom','left','right','top left','top right','bottom left','bottom right'] },
      { name: 'color', type: 'color', label: 'Background Color' },
      { name: 'radius', type: 'number', label: 'Border Radius', min: 0, max: 50, step: 1 },
      { name: 'stroke', type: 'color', label: 'Border Color' },
      { name: 'label', type: 'text', label: 'Label', maxLength: 50 },
      { name: 'textColor', type: 'color', label: 'Text Color' },
      { name: 'font', type: 'text', label: 'Font', placeholder: '24px sans-serif' },
      { name: 'source', type: 'asset-select', label: 'Background Image' }
    ]
  }
};

/**
 * Get all available element types
 */
function getElementTypes() {
  return Object.keys(UI_ELEMENT_REGISTRY);
}

/**
 * Get element definition
 */
function getElementDefinition(elementType) {
  return UI_ELEMENT_REGISTRY[elementType];
}

/**
 * Get element categories
 */
function getElementCategories() {
  const categories = new Set();
  Object.values(UI_ELEMENT_REGISTRY).forEach(def => {
    categories.add(def.category);
  });
  return Array.from(categories).sort();
}

/**
 * Get elements by category
 */
function getElementsByCategory(category) {
  return Object.entries(UI_ELEMENT_REGISTRY)
    .filter(([_, def]) => def.category === category)
    .map(([key, def]) => ({ key, ...def }));
}
