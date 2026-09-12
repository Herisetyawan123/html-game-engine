/**
 * Developer / Scene Builder - Step B Refactor
 * Canvas Preview (full) + Sidebar with Tabs (Elements/Properties/Background)
 */

class DeveloperPage {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.assets = null;
    
    this.selectedElement = null;
    this.elements = []; // Array of placed elements
    
    this.bgColor = '#1e293b';
    this.bgImage = null; // Asset key for background image
    this.showGrid = true;
    this._imageCache = {}; // key -> HTMLImageElement (cached)
    
    this.init();
  }

  /**
   * Initialize the Developer Page
   */
  init() {
    // Load assets from asset pack
    if (!window.__ASSETS_PACK__ || !window.__ASSETS_PACK__.images) {
      console.warn('Asset pack not found');
      this.assets = {};
    } else {
      this.assets = window.__ASSETS_PACK__.images;
    }
    
    // Setup canvas first
    this.setupCanvas();
    
    // Setup sidebar
    this.setupSidebar();
    
    // Setup element browser
    this.setupElementBrowser();
    
    // Setup element search
    this.setupElementSearch();

    console.log(`✓ Developer Page Step C initialized (Refactored Layout)`);
  }

  /**
   * Setup Canvas
   */
  setupCanvas() {
    this.canvas = document.getElementById('dev-canvas');
    if (!this.canvas) {
      console.error('Canvas element not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    
    // Setup canvas click handler for element selection
    this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
    
    // Draw initial canvas
    this.drawCanvas();
  }

  /**
   * Setup Sidebar Tabs
   */
  setupSidebar() {
    const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remove active from all tabs and contents
        document.querySelectorAll('.sidebar-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.sidebar-tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active to clicked tab
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.getElementById(tabId).classList.add('active');
      });
    });

    // Setup background editor
    this.setupBackgroundEditor();
  }

  /**
   * Setup Background Editor
   */
  setupBackgroundEditor() {
    const bgColorInput = document.getElementById('bg-color');
    const showGridCheckbox = document.getElementById('show-grid');
    const bgImageSelect = document.getElementById('bg-image');
    const bgImagePreview = document.getElementById('bg-image-preview');
    const bgImageThumb = document.getElementById('bg-image-thumb');

    if (bgColorInput) {
      bgColorInput.addEventListener('change', (e) => {
        this.bgColor = e.target.value;
        this.drawCanvas();
      });
    }

    if (showGridCheckbox) {
      showGridCheckbox.addEventListener('change', (e) => {
        this.showGrid = e.target.checked;
        this.drawCanvas();
      });
    }

    // Setup background image selector
    if (bgImageSelect) {
      // Populate with asset options
      Object.keys(this.assets).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        bgImageSelect.appendChild(option);
      });

      bgImageSelect.addEventListener('change', (e) => {
        const assetKey = e.target.value;
        if (assetKey) {
          this.bgImage = assetKey;
          if (bgImagePreview && bgImageThumb) {
            bgImageThumb.src = this.assets[assetKey];
            bgImagePreview.style.display = 'block';
          }
        } else {
          this.bgImage = null;
          if (bgImagePreview) {
            bgImagePreview.style.display = 'none';
          }
        }
        this.drawCanvas();
      });
    }
  }

  /**
   * Get cached image for asset key (avoids flicker, sync draw when ready)
   */
  getCachedImage(assetKey) {
    if (!assetKey || !this.assets[assetKey]) return null;
    if (this._imageCache[assetKey] && this._imageCache[assetKey].complete) {
      return this._imageCache[assetKey];
    }
    const img = new Image();
    img.src = this.assets[assetKey];
    img.onload = () => this.drawCanvas();
    img.onerror = () => console.warn(`Failed to load image: ${assetKey}`);
    this._imageCache[assetKey] = img;
    return img.complete && img.naturalWidth ? img : null;
  }

  /**
   * Draw Canvas with Grid and Elements
   */
  drawCanvas() {
    if (!this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background color
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, w, h);

    // Background image (if set) - use cache for sync draw
    if (this.bgImage && this.assets[this.bgImage]) {
      const cached = this.getCachedImage(this.bgImage);
      if (cached) {
        this.ctx.drawImage(cached, 0, 0, w, h);
      }
    }
    this.drawGridAndElements();
  }

  /**
   * Draw Grid and Elements (called after background)
   */
  drawGridAndElements() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Grid (if enabled)
    if (this.showGrid) {
      this.ctx.strokeStyle = '#334155';
      this.ctx.lineWidth = 0.5;
      const gridSize = 100;

      for (let x = 0; x <= w; x += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, h);
        this.ctx.stroke();
      }

      for (let y = 0; y <= h; y += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(w, y);
        this.ctx.stroke();
      }
    }

    // Draw elements
    this.elements.forEach((el, idx) => {
      this.drawElement(el, idx);
    });

    // Center indicator if no elements
    if (this.elements.length === 0) {
      this.ctx.fillStyle = '#475569';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Add elements from Element Browser', w / 2, h / 2 - 10);
      this.ctx.fillText('(Click on canvas to select)', w / 2, h / 2 + 10);
    }

    // Resolution info
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`${w} × ${h}`, 10, 10);
  }

  /**
   * Draw Individual Element
   */
  drawElement(el, idx) {
    const isSelected = this.selectedElement === el;
    const bounds = this.calculateElementBounds(el);

    // Draw based on type
    switch (el.type) {
      case 'Label':
        this.drawLabel(bounds, el, isSelected);
        break;
      case 'Button':
        this.drawButton(bounds, el, isSelected);
        break;
      case 'ImageView':
        this.drawImageView(bounds, el, isSelected);
        break;
      case 'ImageButton':
        this.drawImageButton(bounds, el, isSelected);
        break;
      case 'ToggleImage':
        this.drawToggleImage(bounds, el, isSelected);
        break;
      case 'Panel':
        this.drawPanel(bounds, el, isSelected);
        break;
      default:
        this.drawGeneric(bounds, el, isSelected);
    }

    // Draw selection outline
    if (isSelected) {
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      
      // Draw resize handles
      const handleSize = 8;
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.fillRect(bounds.x - handleSize/2, bounds.y - handleSize/2, handleSize, handleSize);
      this.ctx.fillRect(bounds.x + bounds.width - handleSize/2, bounds.y - handleSize/2, handleSize, handleSize);
      this.ctx.fillRect(bounds.x - handleSize/2, bounds.y + bounds.height - handleSize/2, handleSize, handleSize);
      this.ctx.fillRect(bounds.x + bounds.width - handleSize/2, bounds.y + bounds.height - handleSize/2, handleSize, handleSize);
    }
  }

  /**
   * Calculate Element Bounds with Anchor
   */
  calculateElementBounds(el) {
    const w = 1280;
    const h = 720;
    
    // Calculate anchor base (support center/middle, right/bottom/end, left/top/start)
    const getAnchorBase = (anchor, baseSize, elementSize) => {
      switch (anchor) {
        case 'center':
        case 'middle': return (baseSize - elementSize) / 2;
        case 'right':
        case 'bottom':
        case 'end': return baseSize - elementSize;
        case 'left':
        case 'top':
        case 'start':
        default: return 0;
      }
    };

    const anchorBaseX = getAnchorBase(el.anchorX, w, el.width);
    const anchorBaseY = getAnchorBase(el.anchorY, h, el.height);

    return {
      x: anchorBaseX + el.x,
      y: anchorBaseY + el.y,
      width: el.width,
      height: el.height
    };
  }

  /**
   * Draw Label
   */
  drawLabel(bounds, el, isSelected) {
    this.ctx.save();
    this.ctx.fillStyle = '#e5e7eb';
    this.ctx.font = el.font || '24px sans-serif';
    this.ctx.textAlign = el.align || 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(el.text || 'Label', bounds.x, bounds.y);
    this.ctx.restore();
  }

  /**
   * Draw Button
   */
  drawButton(bounds, el, isSelected) {
    this.ctx.save();
    this.ctx.fillStyle = el.color || '#3b82f6';
    this.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, 12);
    this.ctx.fill();
    
    this.ctx.fillStyle = el.textColor || '#ffffff';
    this.ctx.font = el.font || '24px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(el.label || 'Button', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    this.ctx.restore();
  }

  /**
   * Draw ImageView (cached, sync)
   */
  drawImageView(bounds, el, isSelected) {
    this.ctx.save();
    if (el.source && this.assets[el.source]) {
      const cached = this.getCachedImage(el.source);
      if (cached) {
        this.ctx.globalAlpha = el.opacity ?? 1;
        this.ctx.drawImage(cached, bounds.x, bounds.y, bounds.width, bounds.height);
        this.ctx.restore();
        return;
      }
      // Still loading - placeholder
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Loading...', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      this.ctx.restore();
    } else {
      // Placeholder when no image selected
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('ImageView: pick asset', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      this.ctx.restore();
    }
  }

  /**
   * Draw ImageButton (same image logic + button border)
   */
  drawImageButton(bounds, el, isSelected) {
    this.ctx.save();
    if (el.source && this.assets[el.source]) {
      const cached = this.getCachedImage(el.source);
      if (cached) {
        this.ctx.globalAlpha = el.opacity ?? 1;
        this.ctx.drawImage(cached, bounds.x, bounds.y, bounds.width, bounds.height);
        this.ctx.restore();
        // Button affordance border
        this.ctx.save();
        this.ctx.strokeStyle = isSelected ? '#3b82f6' : '#64748b';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        this.ctx.restore();
        return;
      }
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Loading...', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.strokeStyle = '#a855f7';
      this.ctx.setLineDash([6, 4]);
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.setLineDash([]);
      this.ctx.fillStyle = '#a855f7';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('ImageButton: pick asset', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      this.ctx.restore();
    }
  }

  /**
   * Draw ToggleImage (ON/OFF images + state badge, click canvas to toggle preview)
   */
  drawToggleImage(bounds, el, isSelected) {
    this.ctx.save();
    const activeKey = el.value ? el.keyOn : el.keyOff;
    if (activeKey && this.assets[activeKey]) {
      const cached = this.getCachedImage(activeKey);
      if (cached) {
        this.ctx.globalAlpha = el.opacity ?? 1;
        this.ctx.drawImage(cached, bounds.x, bounds.y, bounds.width, bounds.height);
        this.ctx.restore();
        // State badge
        this.ctx.save();
        this.ctx.fillStyle = el.value ? '#22c55e' : '#64748b';
        this.ctx.font = 'bold 11px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        const label = el.value ? 'ON' : 'OFF';
        const tw = this.ctx.measureText(label).width;
        this.ctx.fillStyle = el.value ? 'rgba(34,197,94,0.9)' : 'rgba(100,116,139,0.9)';
        this.ctx.fillRect(bounds.x + 4, bounds.y + 4, tw + 12, 18);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(label, bounds.x + 10, bounds.y + 7);
        this.ctx.restore();
        return;
      }
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Loading...', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.strokeStyle = '#22c55e';
      this.ctx.setLineDash([6, 4]);
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.setLineDash([]);
      this.ctx.fillStyle = '#22c55e';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      const missing = !el.keyOn && !el.keyOff ? 'pick ON / OFF' : el.value ? 'pick ON' : 'pick OFF';
      this.ctx.fillText(`ToggleImage: ${missing}`, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 - 8);
      this.ctx.font = '11px sans-serif';
      this.ctx.fillStyle = '#64748b';
      this.ctx.fillText(`state: ${el.value ? 'ON' : 'OFF'} (toggle checkbox)`, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 + 10);
      this.ctx.restore();
    }
  }

  /**
   * Draw Panel
   */
  drawPanel(bounds, el, isSelected) {
    this.ctx.save();
    this.ctx.fillStyle = el.color || 'rgba(20,20,30,0.92)';
    this.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, el.radius || 16);
    this.ctx.fill();
    
    this.ctx.strokeStyle = el.stroke || '#475569';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Draw Generic Element
   */
  drawGeneric(bounds, el, isSelected) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(100, 116, 139, 0.2)';
    this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '12px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(el.type, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    this.ctx.restore();
  }

  /**
   * Helper: Round Rect
   */
  roundRect(x, y, w, h, r) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  /**
   * Canvas Click Handler
   */
  onCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on element
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const bounds = this.calculateElementBounds(this.elements[i]);
      if (x >= bounds.x && x <= bounds.x + bounds.width &&
          y >= bounds.y && y <= bounds.y + bounds.height) {
        this.selectElement(this.elements[i]);
        return;
      }
    }

    // Deselect
    this.selectElement(null);
  }

  /**
   * Select Element
   */
  selectElement(el) {
    this.selectedElement = el;
    const deleteBtn = document.getElementById('delete-element-btn');
    
    if (el) {
      // Switch to Properties tab
      document.querySelectorAll('.sidebar-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.sidebar-tab-content').forEach(c => c.classList.remove('active'));
      document.querySelector('[data-tab="properties-tab"]').classList.add('active');
      document.getElementById('properties-tab').classList.add('active');
      
      // Show delete button
      if (deleteBtn) {
        deleteBtn.style.display = 'block';
        deleteBtn.onclick = () => this.deleteElement(el);
      }
      
      // Render properties
      this.renderPropertyEditor(el);
    } else {
      // Reset to empty state
      document.getElementById('property-editor').innerHTML = '<div class="property-editor-empty"><p>Click an element on canvas to edit</p></div>';
      if (deleteBtn) {
        deleteBtn.style.display = 'none';
      }
    }

    this.drawCanvas();
  }

  /**
   * Delete Element
   */
  deleteElement(el) {
    const index = this.elements.indexOf(el);
    if (index > -1) {
      this.elements.splice(index, 1);
      this.selectElement(null);
      this.drawCanvas();
      console.log(`✓ Deleted element: ${el.type}`);
    }
  }



  /**
   * Setup Element Browser - Simple List
   */
  setupElementBrowser() {
    const container = document.getElementById('element-browser');
    if (!container) return;

    // Get all elements from registry
    const allElements = Object.keys(UI_ELEMENT_REGISTRY);
    
    // Sort alphabetically
    allElements.sort();

    // Render as simple list
    allElements.forEach(elementName => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'element-item';
      itemDiv.textContent = elementName;
      itemDiv.dataset.elementType = elementName;
      itemDiv.addEventListener('click', () => this.addElement(elementName));
      container.appendChild(itemDiv);
    });
  }

  /**
   * Setup Element Search
   */
  setupElementSearch() {
    const searchInput = document.getElementById('element-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const items = document.querySelectorAll('.element-item');
      
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  /**
   * Add Element to Canvas
   */
  addElement(elementType) {
    const def = UI_ELEMENT_REGISTRY[elementType];
    if (!def) {
      console.warn(`Element type not found: ${elementType}`);
      return;
    }

    const newElement = {
      type: elementType,
      ...def.defaultProps
    };

    this.elements.push(newElement);
    this.selectElement(newElement);
    this.drawCanvas();
    
    console.log(`✓ Added element: ${elementType}`);
  }

  /**
   * Render Property Editor
   */
  renderPropertyEditor(el) {
    const container = document.getElementById('property-editor');
    if (!container) return;

    const def = UI_ELEMENT_REGISTRY[el.type];
    if (!def) return;

    container.innerHTML = '';

    // Element title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'property-group';
    titleDiv.style.marginBottom = '0.75rem';
    titleDiv.innerHTML = `<h3 style="color: #3b82f6; margin: 0; font-size: 0.875rem;">${el.type}</h3>`;
    container.appendChild(titleDiv);

    def.properties.forEach(prop => {
      const row = document.createElement('div');
      row.className = 'property-row';

      const label = document.createElement('label');
      label.className = 'property-label';
      label.textContent = prop.label;

      let input;

      switch (prop.type) {
        case 'number':
          input = document.createElement('input');
          input.type = 'number';
          input.className = 'property-input';
          input.value = el[prop.name] ?? 0;
          if (prop.min !== undefined) input.min = prop.min;
          if (prop.max !== undefined) input.max = prop.max;
          if (prop.step !== undefined) input.step = prop.step;
          input.addEventListener('input', (e) => {
            el[prop.name] = parseFloat(e.target.value);
            this.drawCanvas();
          });
          break;

        case 'text':
          input = document.createElement('input');
          input.type = 'text';
          input.className = 'property-input';
          input.value = el[prop.name] ?? '';
          if (prop.maxLength) input.maxLength = prop.maxLength;
          if (prop.placeholder) input.placeholder = prop.placeholder;
          input.addEventListener('input', (e) => {
            el[prop.name] = e.target.value;
            this.drawCanvas();
          });
          break;

        case 'color':
          input = document.createElement('input');
          input.type = 'color';
          input.className = 'property-input';
          input.value = el[prop.name] ?? '#ffffff';
          input.addEventListener('input', (e) => {
            el[prop.name] = e.target.value;
            this.drawCanvas();
          });
          break;

        case 'select':
          input = document.createElement('select');
          input.className = 'property-select';
          prop.options.forEach(optValue => {
            const option = document.createElement('option');
            option.value = optValue;
            option.textContent = optValue;
            if (el[prop.name] === optValue) option.selected = true;
            input.appendChild(option);
          });
          input.addEventListener('change', (e) => {
            el[prop.name] = e.target.value;
            this.drawCanvas();
          });
          break;

        case 'checkbox':
          input = document.createElement('div');
          input.className = 'property-checkbox';
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = el[prop.name] ?? false;
          checkbox.addEventListener('change', (e) => {
            el[prop.name] = e.target.checked;
            this.drawCanvas();
          });
          const checkLabel = document.createElement('label');
          checkLabel.textContent = prop.label;
          input.appendChild(checkbox);
          input.appendChild(checkLabel);
          row.appendChild(input);
          container.appendChild(row);
          return;

        case 'asset-select': {
          const wrap = document.createElement('div');
          wrap.style.display = 'flex';
          wrap.style.flexDirection = 'column';
          wrap.style.gap = '0.4rem';

          input = document.createElement('select');
          input.className = 'property-select';

          // Add empty option
          const emptyOption = document.createElement('option');
          emptyOption.value = '';
          emptyOption.textContent = '-- None --';
          if (!el[prop.name]) emptyOption.selected = true;
          input.appendChild(emptyOption);

          // Add asset options
          Object.keys(this.assets).forEach(assetKey => {
            const option = document.createElement('option');
            option.value = assetKey;
            option.textContent = assetKey;
            if (el[prop.name] === assetKey) option.selected = true;
            input.appendChild(option);
          });

          const thumb = document.createElement('img');
          thumb.className = 'asset-preview-thumb';
          thumb.style.width = '100%';
          thumb.style.height = 'auto';
          thumb.style.maxHeight = '120px';
          thumb.style.objectFit = 'contain';
          thumb.style.borderRadius = '4px';
          thumb.style.border = '1px solid #475569';
          thumb.style.background = '#0f172a';
          if (el[prop.name] && this.assets[el[prop.name]]) {
            thumb.src = this.assets[el[prop.name]];
            thumb.style.display = 'block';
          } else {
            thumb.style.display = 'none';
          }

          input.addEventListener('change', (e) => {
            el[prop.name] = e.target.value || null;
            if (el[prop.name] && this.assets[el[prop.name]]) {
              thumb.src = this.assets[el[prop.name]];
              thumb.style.display = 'block';
            } else {
              thumb.removeAttribute('src');
              thumb.style.display = 'none';
            }
            this.drawCanvas();
          });

          wrap.appendChild(input);
          wrap.appendChild(thumb);
          input = wrap;
          break;
        }
      }

      row.appendChild(label);
      row.appendChild(input);
      container.appendChild(row);
    });
  }

}


// Initialize Developer Page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.devPage = new DeveloperPage();
});
